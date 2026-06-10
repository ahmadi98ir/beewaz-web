'use server'

import { revalidatePath } from 'next/cache'
import { auth }           from '@/lib/auth'
import { db }             from '@/lib/db'
import { eq }             from 'drizzle-orm'
import { returnRequests, smsLogs, orders, users } from '@/lib/db/schema'
import { sendSmsPattern, SMS_TEMPLATES }          from '@/lib/sms/sms-ir'
import type { ReturnStatus }                      from '@/lib/db/schema'

const PATH = '/admin/returns'

export const RETURN_STATUS_LABELS: Record<ReturnStatus, string> = {
  pending:  'در انتظار بررسی',
  approved: 'تأیید شده',
  rejected: 'رد شده',
  refunded: 'بازپرداخت شده',
}

export async function updateReturnStatus(
  returnId: string,
  status: ReturnStatus,
  adminNotes: string,
): Promise<{ success: boolean; error?: string }> {
  const session = await auth()
  if (!session?.user) return { success: false, error: 'ابتدا وارد شوید' }

  // بارگذاری درخواست + اطلاعات کاربر برای ارسال پیامک
  const [rr] = await db
    .select({
      id:         returnRequests.id,
      orderId:    returnRequests.orderId,
      userId:     returnRequests.userId,
      userPhone:  users.phone,
      orderShort: orders.id,
    })
    .from(returnRequests)
    .leftJoin(users,  eq(returnRequests.userId,  users.id))
    .leftJoin(orders, eq(returnRequests.orderId, orders.id))
    .where(eq(returnRequests.id, returnId))

  if (!rr) return { success: false, error: 'درخواست مرجوعی یافت نشد' }

  const resolvedAt = ['approved', 'rejected', 'refunded'].includes(status) ? new Date() : null

  await db.transaction(async (tx) => {
    // بروزرسانی وضعیت
    await tx
      .update(returnRequests)
      .set({
        status,
        adminNotes: adminNotes.trim() || null,
        resolvedAt,
        updatedAt: new Date(),
      })
      .where(eq(returnRequests.id, returnId))

    // ثبت لاگ پیامک
    if (rr.userPhone) {
      await tx.insert(smsLogs).values({
        phone:       rr.userPhone,
        userId:      rr.userId ?? undefined,
        message:     `وضعیت مرجوعی سفارش شما به «${RETURN_STATUS_LABELS[status]}» تغییر یافت`,
        status:      'queued',
        trigger:     'order_status_change',
        relatedType: 'return_request',
        relatedId:   returnId,
      })
    }
  })

  // ارسال پیامک خارج از تراکنش
  if (rr.userPhone) {
    void sendSmsPattern(rr.userPhone, 200000, [
      { name: 'STATUS',   value: RETURN_STATUS_LABELS[status] },
      { name: 'ORDER_ID', value: rr.orderShort?.slice(0, 8).toUpperCase() ?? '' },
    ])
  }

  revalidatePath(PATH)
  return { success: true }
}
