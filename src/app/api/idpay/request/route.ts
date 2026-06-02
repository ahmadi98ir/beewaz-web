import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { orders } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

const IDPAY_API_KEY = process.env.IDPAY_API_KEY ?? ''
const IDPAY_SANDBOX = process.env.IDPAY_SANDBOX === 'true'
const IDPAY_URL = 'https://api.idpay.ir/v1.1/payment'
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://beewaz.ir'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.redirect(new URL('/login', req.url))

  const orderId = req.nextUrl.searchParams.get('orderId')
  if (!orderId) return NextResponse.redirect(new URL('/shop', req.url))

  const [order] = await db.select()
    .from(orders)
    .where(and(eq(orders.id, orderId), eq(orders.userId, session.user.id)))
    .limit(1)

  if (!order || order.status !== 'pending') {
    return NextResponse.redirect(new URL('/shop', req.url))
  }

  const shippingAddr = order.shippingAddress as Record<string, string> | null

  const res = await fetch(IDPAY_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-KEY': IDPAY_API_KEY,
      ...(IDPAY_SANDBOX ? { 'X-SANDBOX': '1' } : {}),
    },
    body: JSON.stringify({
      order_id: order.id,
      amount: Number(order.totalAmount),
      name: shippingAddr?.fullName ?? '',
      phone: shippingAddr?.phone ?? '',
      desc: `سفارش بیواز #${order.id.slice(0, 8).toUpperCase()}`,
      callback: `${BASE_URL}/api/idpay/verify?orderId=${order.id}`,
    }),
  })

  const data = await res.json() as { id?: string; link?: string; error_code?: number; error_message?: string }

  if (!res.ok || !data.id || !data.link) {
    console.error('[idpay/request]', data)
    return NextResponse.redirect(new URL(`/checkout?error=gateway_error`, req.url))
  }

  // ذخیره شناسه تراکنش
  await db.update(orders)
    .set({ transactionId: data.id })
    .where(eq(orders.id, order.id))

  return NextResponse.redirect(data.link)
}
