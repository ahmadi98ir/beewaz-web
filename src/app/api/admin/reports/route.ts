import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { orders, orderItems, products } from '@/lib/db/schema'
import { requireAdmin } from '@/lib/admin-auth'
import { eq, gte, sql, desc, and } from 'drizzle-orm'

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req)
  if (!auth.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const range = req.nextUrl.searchParams.get('range') ?? '30'
  const days = Math.min(Math.max(parseInt(range), 7), 365)
  const since = new Date()
  since.setDate(since.getDate() - days)

  // ── درآمد روزانه ──────────────────────────────────────────────────────
  const dailyRevenue = await db
    .select({
      date: sql<string>`DATE(${orders.createdAt})`.as('date'),
      revenue: sql<number>`COALESCE(SUM(CASE WHEN ${orders.status} = 'paid' THEN ${orders.totalAmount}::numeric ELSE 0 END), 0)`.as('revenue'),
      count: sql<number>`COUNT(*)`.as('count'),
    })
    .from(orders)
    .where(gte(orders.createdAt, since))
    .groupBy(sql`DATE(${orders.createdAt})`)
    .orderBy(sql`DATE(${orders.createdAt})`)

  // ── آمار کلی ──────────────────────────────────────────────────────────
  const [stats] = await db
    .select({
      totalRevenue:     sql<number>`COALESCE(SUM(CASE WHEN ${orders.status} = 'paid' THEN ${orders.totalAmount}::numeric ELSE 0 END), 0)`,
      totalOrders:      sql<number>`COUNT(*)`,
      paidOrders:       sql<number>`COUNT(CASE WHEN ${orders.status} = 'paid' THEN 1 END)`,
      pendingOrders:    sql<number>`COUNT(CASE WHEN ${orders.status} = 'pending' THEN 1 END)`,
      cancelledOrders:  sql<number>`COUNT(CASE WHEN ${orders.status} = 'cancelled' THEN 1 END)`,
      avgOrderValue:    sql<number>`COALESCE(AVG(CASE WHEN ${orders.status} = 'paid' THEN ${orders.totalAmount}::numeric END), 0)`,
      totalDiscount:    sql<number>`COALESCE(SUM(${orders.discountAmount}::numeric), 0)`,
    })
    .from(orders)
    .where(gte(orders.createdAt, since))

  // ── پرفروش‌ترین محصولات ───────────────────────────────────────────────
  const topProducts = await db
    .select({
      productId:   orderItems.productId,
      productName: orderItems.productName,
      totalQty:    sql<number>`SUM(${orderItems.quantity})`.as('total_qty'),
      totalRev:    sql<number>`SUM(${orderItems.totalPrice}::numeric)`.as('total_rev'),
    })
    .from(orderItems)
    .innerJoin(orders, eq(orderItems.orderId, orders.id))
    .where(and(gte(orders.createdAt, since), eq(orders.status, 'paid')))
    .groupBy(orderItems.productId, orderItems.productName)
    .orderBy(desc(sql`SUM(${orderItems.quantity})`))
    .limit(10)

  // ── وضعیت سفارشات ─────────────────────────────────────────────────────
  const statusBreakdown = await db
    .select({
      status: orders.status,
      count:  sql<number>`COUNT(*)`.as('count'),
    })
    .from(orders)
    .where(gte(orders.createdAt, since))
    .groupBy(orders.status)

  // ── روش پرداخت ────────────────────────────────────────────────────────
  const paymentMethods = await db
    .select({
      method: orders.paymentMethod,
      count:  sql<number>`COUNT(*)`.as('count'),
      rev:    sql<number>`COALESCE(SUM(CASE WHEN ${orders.status}='paid' THEN ${orders.totalAmount}::numeric ELSE 0 END),0)`.as('rev'),
    })
    .from(orders)
    .where(gte(orders.createdAt, since))
    .groupBy(orders.paymentMethod)

  return NextResponse.json({
    days,
    stats,
    dailyRevenue,
    topProducts,
    statusBreakdown,
    paymentMethods,
  })
}
