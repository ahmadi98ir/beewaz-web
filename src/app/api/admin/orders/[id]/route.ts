/**
 * GET   /api/admin/orders/[id] — جزئیات سفارش + آیتم‌ها
 * PATCH /api/admin/orders/[id] — تغییر وضعیت، کد پیگیری، یادداشت ادمین
 */
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { orders, orderItems } from '@/lib/db/schema'
import { requireAdmin } from '@/lib/admin-auth'
import { eq } from 'drizzle-orm'
import type { OrderStatus } from '@/lib/db/schema'
import { sendBulkSms } from '@/lib/sms'

type Params = { params: Promise<{ id: string }> }

export async function GET(req: NextRequest, { params }: Params) {
  const auth = await requireAdmin(req)
  if (!auth.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params

  try {
    const [order] = await db.select().from(orders).where(eq(orders.id, id)).limit(1)
    if (!order) return NextResponse.json({ error: 'سفارش یافت نشد' }, { status: 404 })

    const items = await db.select().from(orderItems).where(eq(orderItems.orderId, id))
    return NextResponse.json({ order, items })
  } catch (err) {
    console.error('[order GET]', err)
    return NextResponse.json({ error: 'خطا' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const auth = await requireAdmin(req)
  if (!auth.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params

  try {
    const body = await req.json() as {
      status?: OrderStatus
      trackingCode?: string
      adminNote?: string
      shippedAt?: string
      deliveredAt?: string
    }

    const validStatuses: OrderStatus[] = ['pending','paid','processing','shipped','delivered','cancelled','refunded']
    // biome-ignore lint/suspicious/noExplicitAny: dynamic update
    const update: Record<string, any> = { updatedAt: new Date() }

    if (body.status && validStatuses.includes(body.status)) {
      update.status = body.status
      if (body.status === 'shipped' && !body.shippedAt) update.shippedAt = new Date()
      if (body.status === 'delivered' && !body.deliveredAt) update.deliveredAt = new Date()
      if (body.status === 'paid') update.paidAt = new Date()
    }
    if (body.trackingCode !== undefined) update.trackingCode = body.trackingCode
    if (body.adminNote !== undefined)    update.adminNote = body.adminNote
    if (body.shippedAt)   update.shippedAt = new Date(body.shippedAt)
    if (body.deliveredAt) update.deliveredAt = new Date(body.deliveredAt)

    const [updated] = await db.update(orders).set(update).where(eq(orders.id, id)).returning()
    if (!updated) return NextResponse.json({ error: 'سفارش یافت نشد' }, { status: 404 })

    // پیامک اطلاع‌رسانی وضعیت سفارش
    const addr = updated.shippingAddress as { phone?: string; fullName?: string } | null
    const customerPhone = addr?.phone
    if (customerPhone && body.status) {
      const shortId = id.slice(0, 8).toUpperCase()
      if (body.status === 'shipped') {
        const trackMsg = update.trackingCode
          ? `کد پیگیری: ${update.trackingCode}`
          : 'برای پیگیری با پشتیبانی تماس بگیرید'
        void sendBulkSms(customerPhone,
          `بیواز: سفارش #${shortId} ارسال شد. ${trackMsg}`)
      } else if (body.status === 'delivered') {
        void sendBulkSms(customerPhone,
          `بیواز: سفارش #${shortId} تحویل داده شد. ممنون از خرید شما 🙏`)
      } else if (body.status === 'processing') {
        void sendBulkSms(customerPhone,
          `بیواز: سفارش #${shortId} در حال آماده‌سازی است.`)
      } else if (body.status === 'cancelled') {
        void sendBulkSms(customerPhone,
          `بیواز: سفارش #${shortId} لغو شد. برای پیگیری با پشتیبانی تماس بگیرید.`)
      } else if (body.status === 'refunded') {
        void sendBulkSms(customerPhone,
          `بیواز: مبلغ سفارش #${shortId} مسترد شد.`)
      }
    }

    return NextResponse.json({ order: updated })
  } catch (err) {
    console.error('[order PATCH]', err)
    return NextResponse.json({ error: 'خطا' }, { status: 500 })
  }
}
