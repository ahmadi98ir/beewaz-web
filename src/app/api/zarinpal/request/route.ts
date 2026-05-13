import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { orders } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

const ZARINPAL_MERCHANT = process.env.ZARINPAL_MERCHANT_ID ?? ''
const ZARINPAL_REQUEST_URL = 'https://api.zarinpal.com/pg/v4/payment/request.json'
const ZARINPAL_STARTPAY_URL = 'https://www.zarinpal.com/pg/StartPay/'
const CALLBACK_URL = `${process.env.NEXTAUTH_URL}/api/zarinpal/verify`

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  const { searchParams } = new URL(req.url)
  const orderId = searchParams.get('orderId')
  if (!orderId) return NextResponse.json({ error: 'orderId الزامی است' }, { status: 400 })

  const [order] = await db
    .select({ id: orders.id, totalAmount: orders.totalAmount, status: orders.status })
    .from(orders)
    .where(and(eq(orders.id, orderId), eq(orders.userId, session.user.id)))
    .limit(1)

  if (!order || order.status !== 'pending') {
    return NextResponse.json({ error: 'سفارش یافت نشد یا قبلاً پرداخت شده' }, { status: 404 })
  }

  const body = {
    merchant_id: ZARINPAL_MERCHANT,
    amount: order.totalAmount,
    callback_url: `${CALLBACK_URL}?orderId=${order.id}`,
    description: `پرداخت سفارش بیواز #${order.id.slice(0, 8)}`,
    currency: 'IRR',
  }

  const zpRes = await fetch(ZARINPAL_REQUEST_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const zpData = await zpRes.json() as { data?: { authority: string; code: number }; errors?: unknown }

  if (!zpRes.ok || zpData.data?.code !== 100) {
    console.error('[zarinpal/request]', zpData)
    return NextResponse.json({ error: 'خطا در اتصال به درگاه پرداخت' }, { status: 502 })
  }

  const authority = zpData.data.authority
  await db.update(orders).set({ paymentAuthority: authority }).where(eq(orders.id, order.id))

  return NextResponse.redirect(`${ZARINPAL_STARTPAY_URL}${authority}`)
}
