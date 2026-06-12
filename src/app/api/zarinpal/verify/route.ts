import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { orders, products, orderItems } from '@/lib/db/schema'
import { and, eq, sql } from 'drizzle-orm'
import { getZarinpalConfig } from '@/lib/payment-config'

export async function GET(req: Request) {
  const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://beewaz.ir'
  const { searchParams } = new URL(req.url)
  const orderId = searchParams.get('orderId')
  const authority = searchParams.get('Authority')
  const status = searchParams.get('Status')

  if (!orderId || !authority) {
    return NextResponse.redirect(`${SITE}/shop`)
  }

  if (status !== 'OK') {
    return NextResponse.redirect(`${SITE}/checkout?error=cancelled`)
  }

  const [order] = await db
    .select({ id: orders.id, totalAmount: orders.totalAmount, status: orders.status, transactionId: orders.transactionId })
    .from(orders)
    .where(eq(orders.id, orderId))
    .limit(1)

  if (!order || order.transactionId !== authority) {
    return NextResponse.redirect(`${SITE}/shop`)
  }

  if (order.status === 'paid') {
    return NextResponse.redirect(`${SITE}/orders/${order.id}/confirmation`)
  }

  const config = await getZarinpalConfig()

  const zpRes = await fetch(config.verifyUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      merchant_id: config.merchantId,
      amount: order.totalAmount,
      authority,
    }),
  })
  const zpData = await zpRes.json() as { data?: { code: number; ref_id: number }; errors?: unknown }

  if (!zpRes.ok || (zpData.data?.code !== 100 && zpData.data?.code !== 101)) {
    console.error('[zarinpal/verify]', zpData)
    return NextResponse.redirect(`${SITE}/checkout?error=payment_failed`)
  }

  await db.transaction(async (tx) => {
    const invRows = await tx.execute<{ nextInvoice: number }>(
      sql`SELECT nextval('invoice_number_seq') AS "nextInvoice"`
    )
    const nextInvoice = invRows[0]?.nextInvoice ?? null
    const updated = await tx.update(orders).set({
      status: 'paid',
      trackingCode: String(zpData.data?.ref_id ?? ''),
      paidAt: new Date(),
      invoiceNumber: nextInvoice,
    }).where(and(eq(orders.id, order.id), eq(orders.status, 'pending')))
      .returning({ id: orders.id })

    if (updated.length === 0) return

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

  return NextResponse.redirect(`${SITE}/orders/${order.id}/confirmation`)
}
