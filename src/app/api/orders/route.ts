import { NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { orders, orderItems, products, coupons, couponUsages, siteSettings, users } from '@/lib/db/schema'
import { eq, inArray, and, count, sql } from 'drizzle-orm'
import { sendVerifySms, sendBulkSms, SMS_TEMPLATES } from '@/lib/sms'

const addressSchema = z.object({
  fullName: z.string().min(2),
  phone: z.string().regex(/^09\d{9}$/, 'شماره موبایل معتبر نیست'),
  province: z.string().min(2),
  city: z.string().min(2),
  street: z.string().min(2),
  alley: z.string().optional(),
  plaque: z.string().min(1),
  unit: z.string().optional(),
  postalCode: z.string().regex(/^\d{10}$/, 'کد پستی ۱۰ رقمی باشد'),
})

const schema = z.object({
  address: addressSchema,
  items: z.array(z.object({
    id: z.string().uuid(),
    quantity: z.number().int().min(1),
  })).min(1),
  notes: z.string().max(500).optional(),
  couponCode: z.string().optional(),
  paymentMethod: z.enum(['online', 'card_to_card', 'cash_on_delivery', 'installment']).default('online'),
  gateway: z.enum(['zarinpal', 'idpay', 'card_to_card', 'cash_on_delivery']).default('zarinpal'),
})

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'لطفاً وارد شوید' }, { status: 401 })
  }

  const body = await req.json() as unknown
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    const firstErr = parsed.error.errors[0]
    return NextResponse.json({ error: firstErr?.message ?? 'اطلاعات نامعتبر', field: firstErr?.path?.join('.') }, { status: 400 })
  }

  const { address, items, notes, couponCode, paymentMethod, gateway } = parsed.data
  const productIds = items.map((i) => i.id)

  // بررسی محصولات
  const dbProducts = await db
    .select({ id: products.id, nameFa: products.nameFa, sku: products.sku, price: products.price, stock: products.stock })
    .from(products)
    .where(inArray(products.id, productIds))

  if (dbProducts.length !== productIds.length) {
    return NextResponse.json({ error: 'یک یا چند محصول یافت نشد' }, { status: 400 })
  }

  const productMap = new Map(dbProducts.map((p) => [p.id, p]))
  let subtotal = 0
  const orderItemsData: { productId: string; productName: string; sku: string | null; quantity: number; unitPrice: string; totalPrice: string }[] = []

  for (const item of items) {
    const p = productMap.get(item.id)!
    const price = typeof p.price === 'string' ? parseInt(p.price, 10) : (p.price ?? 0)
    const stock = typeof p.stock === 'string' ? parseInt(p.stock as string, 10) : (p.stock ?? 0)
    if (stock < item.quantity) {
      return NextResponse.json({ error: `موجودی کافی برای "${p.nameFa}" وجود ندارد` }, { status: 400 })
    }
    const lineTotal = price * item.quantity
    subtotal += lineTotal
    orderItemsData.push({
      productId: p.id,
      productName: p.nameFa ?? '',
      sku: p.sku ?? null,
      quantity: item.quantity,
      unitPrice: String(price),
      totalPrice: String(lineTotal),
    })
  }

  // هزینه ارسال (تهران ارزان‌تر، شهرستان گران‌تر)
  const FREE_SHIPPING_THRESHOLD = 2_000_000
  const isTehran = address.province?.includes('تهران') || address.city?.includes('تهران')
  const SHIPPING_COST = isTehran ? 100_000 : 200_000
  const shippingAmount = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST

  // ── پردازش کوپن ───────────────────────────────────────────────────────────
  let discountAmount = 0
  let appliedCoupon: typeof coupons.$inferSelect | null = null

  if (couponCode?.trim()) {
    const code = couponCode.trim().toUpperCase()
    const [coupon] = await db.select().from(coupons)
      .where(and(eq(coupons.code, code), eq(coupons.active, true)))
      .limit(1)

    if (!coupon) {
      return NextResponse.json({ error: 'کد تخفیف معتبر نیست' }, { status: 400 })
    }
    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return NextResponse.json({ error: 'کد تخفیف منقضی شده است' }, { status: 400 })
    }
    if (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) {
      return NextResponse.json({ error: 'ظرفیت این کد تخفیف پر شده است' }, { status: 400 })
    }
    if (coupon.minOrderAmount && subtotal < Number(coupon.minOrderAmount)) {
      return NextResponse.json({ error: `حداقل مبلغ سفارش برای این کوپن ${Math.floor(Number(coupon.minOrderAmount) / 10).toLocaleString('fa-IR')} تومان است` }, { status: 400 })
    }
    if (coupon.perUserLimit && coupon.perUserLimit > 0) {
      const ucRows = await db.select({ count: count() }).from(couponUsages)
        .where(and(eq(couponUsages.couponId, coupon.id), eq(couponUsages.userId, session.user.id)))
      const uc = ucRows[0]?.count ?? 0
      if (uc >= coupon.perUserLimit) {
        return NextResponse.json({ error: 'قبلاً از این کد تخفیف استفاده کرده‌اید' }, { status: 400 })
      }
    }

    if (coupon.type === 'percentage') {
      discountAmount = Math.floor(subtotal * Number(coupon.value) / 100)
      if (coupon.maxDiscountAmount) discountAmount = Math.min(discountAmount, Number(coupon.maxDiscountAmount))
    } else {
      discountAmount = Math.min(Number(coupon.value), subtotal)
    }
    appliedCoupon = coupon
  }

  const totalAmount = Math.max(0, subtotal + shippingAmount - discountAmount)
  const userId = session.user!.id === 'admin-env' ? null : session.user!.id

  // ثبت سفارش در یک transaction برای جلوگیری از ناسازگاری داده
  let order: { id: string }
  try {
    const result = await db.transaction(async (tx) => {
      const [newOrder] = await tx.insert(orders).values({
        userId,
        status: 'pending',
        totalAmount: String(totalAmount),
        shippingAmount: String(shippingAmount),
        discountAmount: String(discountAmount),
        couponCode: appliedCoupon?.code ?? null,
        shippingAddress: address,
        paymentMethod,
        customerNote: notes ?? null,
      }).returning({ id: orders.id })

      if (!newOrder) throw new Error('order_insert_failed')

      await tx.insert(orderItems).values(
        orderItemsData.map((item) => ({ orderId: newOrder.id, ...item }))
      )

      // ثبت کوپن با بررسی اتمیک (جلوگیری از race condition)
      if (appliedCoupon && discountAmount > 0) {
        const couponWhere = appliedCoupon.usageLimit !== null
          ? and(eq(coupons.id, appliedCoupon.id), sql`${coupons.usageCount} < ${appliedCoupon.usageLimit}`)
          : eq(coupons.id, appliedCoupon.id)

        const updated = await tx.update(coupons)
          .set({ usageCount: sql`${coupons.usageCount} + 1` })
          .where(couponWhere)
          .returning({ id: coupons.id })

        if (updated.length === 0) throw new Error('coupon_exhausted')

        if (userId) {
          await tx.insert(couponUsages).values({
            couponId: appliedCoupon.id,
            userId,
            orderId: newOrder.id,
            discountAmount: String(discountAmount),
          })
        }
      }

      // کاهش موجودی برای پرداخت غیرآنلاین
      if (paymentMethod === 'cash_on_delivery' || paymentMethod === 'card_to_card') {
        for (const item of orderItemsData) {
          await tx.update(products)
            .set({ stock: sql`GREATEST(${products.stock} - ${item.quantity}, 0)` })
            .where(eq(products.id, item.productId))
        }
      }

      return newOrder
    })
    order = result
  } catch (err) {
    const msg = err instanceof Error ? err.message : ''
    if (msg === 'coupon_exhausted') return NextResponse.json({ error: 'ظرفیت این کد تخفیف پر شده است' }, { status: 400 })
    console.error('[orders POST] transaction failed', err)
    const detail = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: 'خطا در ثبت سفارش', detail }, { status: 500 })
  }

  const shortId = order.id.slice(0, 8).toUpperCase()
  const tomanStr = Math.floor(totalAmount / 10).toLocaleString('fa-IR')

  // پیامک تایید به مشتری (fire-and-forget)
  void sendVerifySms(address.phone, SMS_TEMPLATES.ORDER_CONFIRM, {
    ORDERID: shortId,
    PRICE: tomanStr,
  })

  // پیامک اطلاع‌رسانی به ادمین (اگر شماره ثبت شده باشد)
  void (async () => {
    try {
      const [setting] = await db.select({ value: siteSettings.value })
        .from(siteSettings)
        .where(eq(siteSettings.key, 'admin_order_notify_phone'))
        .limit(1)
      const adminPhone = setting?.value?.trim()
      if (adminPhone && /^09\d{9}$/.test(adminPhone)) {
        await sendBulkSms(adminPhone,
          `بیواز: سفارش جدید #${shortId} — ${tomanStr} تومان — ${address.fullName}`)
      }
    } catch { /* نادیده گرفتن خطای اطلاع‌رسانی ادمین */ }
  })()

  // ذخیره آخرین آدرس ارسال روی پروفایل کاربر (fire-and-forget)
  if (session.user.id !== 'admin-env') {
    void db.update(users)
      .set({
        lastShippingAddress: {
          fullName: address.fullName,
          province: address.province,
          city: address.city,
          street: address.street,
          alley: address.alley,
          plaque: address.plaque,
          unit: address.unit,
          postalCode: address.postalCode,
        },
        updatedAt: new Date(),
      })
      .where(eq(users.id, session.user.id))
      .catch(() => {})
  }

  return NextResponse.json({ orderId: order.id, totalAmount, gateway })
}
