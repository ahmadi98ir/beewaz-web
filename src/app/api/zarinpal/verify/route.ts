import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { orders } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

const ZARINPAL_MERCHANT = process.env.ZARINPAL_MERCHANT_ID ?? ''
const ZARINPAL_VERIFY_URL = 'https://api.zarinpal.com/pg/v4/payment/verify.json'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const orderId = searchParams.get('orderId')
  const authority = searchParams.get('Authority')
  const status = searchParams.get('Status')

  if (!orderId || !authority) {
    return NextResponse.redirect(new URL('/shop', req.url))
  }

  if (status !== 'OK') {
    return NextResponse.redirect(new URL(`/checkout?error=cancelled`, req.url))
  }

  const [order] = await db
    .select({ id: orders.id, totalAmount: orders.totalAmount, status: orders.status, paymentAuthority: orders.paymentAuthority })
    .from(orders)
    .where(eq(orders.id, orderId))
    .limit(1)

  if (!order || order.paymentAuthority !== authority) {
    return NextResponse.redirect(new URL('/shop', req.url))
  }

  if (order.status === 'paid') {
    return NextResponse.redirect(new URL(`/orders/${order.id}/confirmation`, req.url))
  }

  const zpRes = await fetch(ZARINPAL_VERIFY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      merchant_id: ZARINPAL_MERCHANT,
      amount: order.totalAmount,
      authority,
    }),
  })
  const zpData = await zpRes.json() as { data?: { code: number; ref_id: number }; errors?: unknown }

  if (!zpRes.ok || (zpData.data?.code !== 100 && zpData.data?.code !== 101)) {
    console.error('[zarinpal/verify]', zpData)
    return NextResponse.redirect(new URL(`/checkout?error=payment_failed`, req.url))
  }

  await db.update(orders).set({
    status: 'paid',
    paymentRef: String(zpData.data?.ref_id ?? ''),
    paidAt: new Date(),
  }).where(eq(orders.id, order.id))

  return NextResponse.redirect(new URL(`/orders/${order.id}/confirmation`, req.url))
}
