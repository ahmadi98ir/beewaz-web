import { db } from '@/lib/db'
import { cartAbandonmentSessions, users } from '@/lib/db/schema'
import { and, eq, isNull, isNotNull, lte, gte, sql } from 'drizzle-orm'
import { sendBulkSms } from '@/lib/sms'
import { logger } from '@/lib/logger'

const REMINDER_DELAY_HOURS = 1
const MAX_AGE_DAYS = 7
const MAX_PER_RUN = 200

export type CartSnapshotItem = {
  productId: string
  variantId?: string
  productName: string
  quantity: number
  unitPrice: number
}

// ─── ثبت/به‌روزرسانی فعالیت سبد خرید کاربر لاگین‌شده ────────────────────────────

export async function trackCartActivity(opts: {
  userId: string
  sessionId?: string
  items: CartSnapshotItem[]
}) {
  const { userId, sessionId, items } = opts

  // سبد خالی شده → دیگر نیازی به یادآوری نیست
  if (items.length === 0) {
    await db.delete(cartAbandonmentSessions)
      .where(and(eq(cartAbandonmentSessions.userId, userId), eq(cartAbandonmentSessions.recovered, false)))
    return
  }

  const totalAmountRial = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0)
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0)

  const [open] = await db.select({ id: cartAbandonmentSessions.id })
    .from(cartAbandonmentSessions)
    .where(and(eq(cartAbandonmentSessions.userId, userId), eq(cartAbandonmentSessions.recovered, false)))
    .limit(1)

  if (open) {
    await db.update(cartAbandonmentSessions)
      .set({
        sessionId,
        cartSnapshot: { items },
        totalAmountRial,
        itemCount,
        lastSeenAt: new Date(),
        reminderSentAt: null, // فعالیت تازه → یادآوری قبلی بی‌اثر شد، دوباره واجد شرایط شود
      })
      .where(eq(cartAbandonmentSessions.id, open.id))
  } else {
    await db.insert(cartAbandonmentSessions).values({
      userId,
      sessionId,
      cartSnapshot: { items },
      totalAmountRial,
      itemCount,
      lastSeenAt: new Date(),
    })
  }
}

// ─── علامت‌گذاری سبد به عنوان بازیابی‌شده (سفارش با موفقیت ثبت شد) ──────────────

export async function markCartRecovered(userId: string, orderId: string) {
  await db.update(cartAbandonmentSessions)
    .set({ recovered: true, recoveredAt: new Date(), recoveredOrderId: orderId })
    .where(and(eq(cartAbandonmentSessions.userId, userId), eq(cartAbandonmentSessions.recovered, false)))
}

// ─── ارسال پیامک یادآوری برای سبدهای رهاشده (صدا زده می‌شود از cron) ────────────

export async function recoverAbandonedCarts() {
  const now = Date.now()
  const reminderCutoff = new Date(now - REMINDER_DELAY_HOURS * 60 * 60 * 1000)
  const maxAgeCutoff = new Date(now - MAX_AGE_DAYS * 24 * 60 * 60 * 1000)
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://beewaz.ir'

  const candidates = await db
    .select({
      id:        cartAbandonmentSessions.id,
      userId:    cartAbandonmentSessions.userId,
      itemCount: cartAbandonmentSessions.itemCount,
      totalAmountRial: cartAbandonmentSessions.totalAmountRial,
      phone:     users.phone,
      fullName:  users.fullName,
    })
    .from(cartAbandonmentSessions)
    .innerJoin(users, eq(users.id, cartAbandonmentSessions.userId))
    .where(and(
      eq(cartAbandonmentSessions.recovered, false),
      isNull(cartAbandonmentSessions.reminderSentAt),
      isNotNull(cartAbandonmentSessions.userId),
      lte(cartAbandonmentSessions.lastSeenAt, reminderCutoff),
      gte(cartAbandonmentSessions.lastSeenAt, maxAgeCutoff),
    ))
    .orderBy(cartAbandonmentSessions.lastSeenAt)
    .limit(MAX_PER_RUN)

  let sent = 0
  let failed = 0

  for (const c of candidates) {
    const toman = Math.floor(Number(c.totalAmountRial) / 10).toLocaleString('fa-IR')
    const message = `بیواز: ${c.fullName ?? 'مشتری گرامی'} عزیز، سبد خرید شما با ${c.itemCount} کالا (${toman} تومان) منتظر تکمیل است. ادامه خرید: ${siteUrl}/cart`

    const ok = await sendBulkSms(c.phone, message, {
      trigger: 'cart_abandonment',
      userId: c.userId ?? undefined,
      relatedType: 'cart_abandonment_session',
      relatedId: c.id,
    })

    if (ok) {
      sent++
      await db.update(cartAbandonmentSessions)
        .set({ reminderSentAt: new Date() })
        .where(eq(cartAbandonmentSessions.id, c.id))
    } else {
      failed++
      logger.warn('[cart-recovery] reminder SMS failed, will retry next run', { sessionId: c.id })
    }
  }

  return { found: candidates.length, sent, failed }
}
