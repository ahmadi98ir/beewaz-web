/**
 * POST /api/admin/orders/[id]/refund
 * استرداد سفارش: تغییر وضعیت به refunded + بازگرداندن موجودی محصولات
 */
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { orders, orderItems, products } from '@/lib/db/schema'
import { requireAdmin } from '@/lib/admin-auth'
import { eq, sql } from 'drizzle-orm'
import { sendBulkSms } from '@/lib/sms'
import { auditLog } from '@/lib/audit'
import { auth } from '@/lib/auth'

type Params = { params: Promise<{ id: string }> }

export async function POST(req: NextRequest, { params }: Params) {
  const adminCheck = await requireAdmin(req)
  if (!adminCheck.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const session = await auth()
  const adminId = session?.user?.id ?? 'admin-env'

  try {
    const body = await req.json() as { reason?: string }

    const [order] = await db.select().from(orders).where(eq(orders.id, id)).limit(1)
    if (!order) return NextResponse.json({ error: 'سفارش یافت نشد' }, { status: 404 })

    if (order.status === 'refunded') {
      return NextResponse.json({ error: 'این سفارش قبلاً مسترد شده است' }, { status: 400 })
    }
    if (!['paid', 'processing', 'shipped', 'delivered'].includes(order.status)) {
      return NextResponse.json({ error: 'فقط سفارشات پرداخت‌شده قابل استرداد هستند' }, { status: 400 })
    }

    const items = await db.select({
      productId: orderItems.productId,
      quantity: orderItems.quantity,
    }).from(orderItems).where(eq(orderItems.orderId, id))

    // استرداد + بازگرداندن موجودی در یک transaction
    await db.transaction(async (tx) => {
      await tx.update(orders)
        .set({
          status: 'refunded',
          adminNote: body.reason
            ? `استرداد: ${body.reason}`
            : 'استرداد توسط ادمین',
          updatedAt: new Date(),
        })
        .where(eq(orders.id, id))

      for (const item of items) {
        if (item.productId) {
          await tx.update(products)
            .set({ stock: sql`${products.stock} + ${item.quantity}` })
            .where(eq(products.id, item.productId))
        }
      }
    })

    void auditLog(adminId, 'order.refunded', 'order', id,
      { status: order.status },
      { status: 'refunded', reason: body.reason },
    )

    const addr = order.shippingAddress as { phone?: string } | null
    if (addr?.phone) {
      void sendBulkSms(addr.phone,
        `بیواز: مبلغ سفارش #${id.slice(0, 8).toUpperCase()} مسترد شد. برای پیگیری با پشتیبانی تماس بگیرید.`,
        { trigger: 'order_status_change', relatedType: 'order', relatedId: id },
      ).catch(() => {})
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[order refund]', err)
    return NextResponse.json({ error: 'خطا در پردازش استرداد' }, { status: 500 })
  }
}
