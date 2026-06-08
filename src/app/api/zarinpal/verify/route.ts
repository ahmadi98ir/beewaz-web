import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { orders, products, orderItems } from '@/lib/db/schema'
import { and, eq, sql } from 'drizzle-orm'
import { getZarinpalConfig } from '@/lib/payment-config'

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
    .select({ id: orders.id, totalAmount: orders.totalAmount, status: orders.status, transactionId: orders.transactionId })
    .from(orders)
    .where(eq(orders.id, orderId))
    .limit(1)

  if (!order || order.transactionId !== authority) {
    return NextResponse.redirect(new URL('/shop', req.url))
  }

  if (order.status === 'paid') {
    return NextResponse.redirect(new URL(`/orders/${order.id}/confirmation`, req.url))
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
    return NextResponse.redirect(new URL(`/checkout?error=payment_failed`, req.url))
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

  return NextResponse.redirect(new URL(`/orders/${order.id}/confirmation`, req.url))
}
