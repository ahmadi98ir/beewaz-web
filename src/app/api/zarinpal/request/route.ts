import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { orders } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { getZarinpalConfig } from '@/lib/payment-config'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://beewaz.ir'

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

  const config = await getZarinpalConfig()
  if (!config.merchantId) {
    return NextResponse.json({ error: 'درگاه زرین‌پال پیکربندی نشده' }, { status: 503 })
  }

  const callbackUrl = `${BASE_URL}/api/zarinpal/verify?orderId=${order.id}`

  const zpRes = await fetch(config.requestUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      merchant_id: config.merchantId,
      amount: order.totalAmount,
      callback_url: callbackUrl,
      description: `پرداخت سفارش بیواز #${order.id.slice(0, 8)}`,
      currency: 'IRR',
    }),
  })
  const zpData = await zpRes.json() as { data?: { authority: string; code: number }; errors?: unknown }

  if (!zpRes.ok || zpData.data?.code !== 100) {
    console.error('[zarinpal/request]', zpData)
    return NextResponse.json({ error: 'خطا در اتصال به درگاه پرداخت' }, { status: 502 })
  }

  const authority = zpData.data.authority
  await db.update(orders).set({ transactionId: authority }).where(eq(orders.id, order.id))

  return NextResponse.redirect(`${config.startPayUrl}${authority}`)
}
