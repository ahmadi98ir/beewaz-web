import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { orders, products, orderItems } from '@/lib/db/schema'
import { eq, sql } from 'drizzle-orm'

const IDPAY_API_KEY = process.env.IDPAY_API_KEY ?? ''
const IDPAY_SANDBOX = process.env.IDPAY_SANDBOX === 'true'
const IDPAY_VERIFY_URL = 'https://api.idpay.ir/v1.1/payment/verify'

export async function POST(req: NextRequest) {
  const orderId = req.nextUrl.searchParams.get('orderId')
  if (!orderId) return NextResponse.redirect(new URL('/shop', req.url))

  const body = await req.json() as { id?: string; order_id?: string; status?: number; track_id?: number }

  // وضعیت 100 یا 101 = موفق
  if (!body.id || (body.status !== 100 && body.status !== 101)) {
    return NextResponse.redirect(new URL(`/checkout?error=cancelled`, req.url))
  }

  const [order] = await db.select()
    .from(orders)
    .where(eq(orders.id, orderId))
    .limit(1)

  if (!order) return NextResponse.redirect(new URL('/shop', req.url))
  if (order.status === 'paid') {
    return NextResponse.redirect(new URL(`/orders/${order.id}/confirmation`, req.url))
  }

  // تأیید با IDPay
  const verifyRes = await fetch(IDPAY_VERIFY_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-KEY': IDPAY_API_KEY,
      ...(IDPAY_SANDBOX ? { 'X-SANDBOX': '1' } : {}),
    },
    body: JSON.stringify({ id: body.id, order_id: orderId }),
  })

  const verifyData = await verifyRes.json() as { status?: number; track_id?: number; id?: string; error_code?: number }

  if (!verifyRes.ok || (verifyData.status !== 100 && verifyData.status !== 101)) {
    console.error('[idpay/verify]', verifyData)
    return NextResponse.redirect(new URL(`/checkout?error=payment_failed`, req.url))
  }

  // اطمینان از تطابق transaction id
  if (order.transactionId && verifyData.id && order.transactionId !== verifyData.id) {
    console.error('[idpay/verify] transaction id mismatch', { stored: order.transactionId, received: verifyData.id })
    return NextResponse.redirect(new URL(`/checkout?error=payment_failed`, req.url))
  }

  // به‌روزرسانی سفارش + کاهش موجودی در یک transaction
  await db.transaction(async (tx) => {
    await tx.update(orders).set({
      status: 'paid',
      trackingCode: String(verifyData.track_id ?? body.track_id ?? ''),
      paidAt: new Date(),
    }).where(eq(orders.id, order.id))

    const items = await tx.select({ productId: orderItems.productId, quantity: orderItems.quantity })
      .from(orderItems).where(eq(orderItems.orderId, order.id))

    for (const item of items) {
      if (item.productId) {
        await tx.update(products)
          .set({ stock: sql`GREATEST(${products.stock} - ${item.quantity}, 0)` })
          .where(eq(products.id, item.productId))
      }
    }
  })

  return NextResponse.redirect(new URL(`/orders/${order.id}/confirmation`, req.url))
}

// IDPay callback ممکن است GET هم باشد
export async function GET(req: NextRequest) {
  const orderId = req.nextUrl.searchParams.get('orderId')
  const status = req.nextUrl.searchParams.get('status')

  if (!orderId || status !== '100') {
    return NextResponse.redirect(new URL('/checkout?error=cancelled', req.url))
  }
  return NextResponse.redirect(new URL(`/orders/${orderId}/confirmation`, req.url))
}
