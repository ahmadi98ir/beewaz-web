import { NextResponse } from 'next/server'
import { desc, sql } from 'drizzle-orm'
import { db } from '@/lib/db'
import { orders } from '@/lib/db/schema'
import { requireAdmin } from '@/lib/admin-auth'

export async function GET() {
  const guard = await requireAdmin()
  if (guard.error) return guard.error

  try {
    const allOrders = await db
      .select({
        id: orders.id,
        status: orders.status,
        totalAmount: orders.totalAmount,
        shippingAddress: orders.shippingAddress,
        paymentMethod: orders.paymentMethod,
        createdAt: orders.createdAt,
        itemCount: sql<number>`(select count(*)::int from order_items where order_id = ${orders.id})`,
      })
      .from(orders)
      .orderBy(desc(orders.createdAt))

    return NextResponse.json({ orders: allOrders })
  } catch (err) {
    console.error('[API GET /admin/orders]', err)
    return NextResponse.json({ error: 'خطا در بارگیری سفارشات' }, { status: 500 })
  }
}
