'use server'

import { unstable_cache } from 'next/cache'
import { db } from '@/lib/db'
import { orders, products, users, analyticsDailySnapshots } from '@/lib/db/schema'
import { eq, desc, gte, sql, isNull, and, lte, inArray } from 'drizzle-orm'
import { ensureDailySnapshots } from '@/lib/analytics/daily-snapshot'

// ─── Types ────────────────────────────────────────────────────────────────────

export type DailyRevenue = { date: string; toman: number }

export type DashboardData = {
  revenueTomanThisMonth:  number
  revenueLastMonth:       number
  ordersThisMonth:        number
  paidOrdersThisMonth:    number
  newUsersThisMonth:      number
  lowStockProducts:       { id: string; nameFa: string; stock: number; threshold: number }[]
  recentOrders:           {
    id: string
    status: string
    totalAmount: string | null
    customerName: string | null
    city: string | null
    createdAt: Date
  }[]
  sparkData:              DailyRevenue[]
  abandonedCartsCount:    number
  abandonedCartsToman:    number
  conversionRatePct:      number
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function startOfMonth(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth(), 1)
}
function startOfLastMonth() {
  const d = new Date()
  return new Date(d.getFullYear(), d.getMonth() - 1, 1)
}
function endOfLastMonth() {
  return new Date(startOfMonth().getTime() - 1)
}
function daysAgo(n: number) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  d.setHours(0, 0, 0, 0)
  return d
}

// ─── Revenue spark (آخرین ۷ روز) ─────────────────────────────────────────────

async function fetchSparkData(): Promise<DailyRevenue[]> {
  const since = daysAgo(6)
  const rows = await db
    .select({
      day:     sql<string>`date_trunc('day', ${orders.paidAt})::date::text`,
      revenue: sql<number>`coalesce(sum(${orders.totalAmount}), 0)::bigint`,
    })
    .from(orders)
    .where(
      and(
        inArray(orders.status, ['paid', 'delivered', 'shipped', 'processing']),
        gte(orders.paidAt, since)
      )
    )
    .groupBy(sql`date_trunc('day', ${orders.paidAt})`)
    .orderBy(sql`date_trunc('day', ${orders.paidAt})`)

  // پر کردن روزهایی که فروشی نداشتند
  const map = new Map(rows.map((r) => [r.day, r.revenue]))
  return Array.from({ length: 7 }, (_, i) => {
    const d = daysAgo(6 - i)
    const key = d.toISOString().slice(0, 10)
    return { date: key, toman: Math.floor((map.get(key) ?? 0) / 10) }
  })
}

// ─── Main fetcher (cache: 5 دقیقه) ───────────────────────────────────────────

export const getDashboardData = unstable_cache(
  async (): Promise<DashboardData> => {
    const monthStart    = startOfMonth()
    const lastMonthStart = startOfLastMonth()
    const lastMonthEnd  = endOfLastMonth()

    await ensureDailySnapshots()

    const [statsRow, lowStockRows, recentOrderRows, sparkData, snapshotRows] = await Promise.all([
      // ─── آمار کلی ────────────────────────────────────────────────────────
      db
        .select({
          revThisMonth: sql<number>`
            coalesce(sum(case
              when ${orders.status} in ('paid','delivered','shipped','processing')
                and ${orders.paidAt} >= ${monthStart.toISOString()}
              then ${orders.totalAmount} else 0
            end), 0)::bigint`,
          revLastMonth: sql<number>`
            coalesce(sum(case
              when ${orders.status} in ('paid','delivered','shipped','processing')
                and ${orders.paidAt} >= ${lastMonthStart.toISOString()}
                and ${orders.paidAt} <= ${lastMonthEnd.toISOString()}
              then ${orders.totalAmount} else 0
            end), 0)::bigint`,
          ordersThisMonth: sql<number>`
            count(case when ${orders.createdAt} >= ${monthStart.toISOString()} then 1 end)::int`,
          paidThisMonth: sql<number>`
            count(case
              when ${orders.status} in ('paid','delivered','shipped','processing')
                and ${orders.paidAt} >= ${monthStart.toISOString()}
              then 1 end)::int`,
          newUsers: sql<number>`
            (select count(*)::int from users
             where created_at >= ${monthStart.toISOString()})`,
        })
        .from(orders),

      // ─── محصولات کم‌موجود (stock <= 5) ───────────────────────────────────
      db
        .select({ id: products.id, nameFa: products.nameFa, stock: products.stock })
        .from(products)
        .where(
          and(
            isNull(products.deletedAt),
            eq(products.status, 'active'),
            lte(products.stock, 5)
          )
        )
        .orderBy(products.stock)
        .limit(8),

      // ─── آخرین سفارشات ───────────────────────────────────────────────────
      db
        .select({
          id:          orders.id,
          status:      orders.status,
          totalAmount: orders.totalAmount,
          shippingAddress: orders.shippingAddress,
          createdAt:   orders.createdAt,
        })
        .from(orders)
        .orderBy(desc(orders.createdAt))
        .limit(6),

      // ─── Spark data ───────────────────────────────────────────────────────
      fetchSparkData(),

      // ─── ۳۰ روز snapshot از analytics_daily_snapshots ────────────────────
      db
        .select({
          abandonedCarts:      analyticsDailySnapshots.abandonedCarts,
          abandonedValueToman: analyticsDailySnapshots.abandonedValueToman,
          conversionRateBps:   analyticsDailySnapshots.conversionRateBps,
        })
        .from(analyticsDailySnapshots)
        .where(gte(analyticsDailySnapshots.date, sql<string>`(now() - interval '30 days')::date`))
        .orderBy(desc(analyticsDailySnapshots.date))
        .limit(30),
    ])

    const s = statsRow[0]

    // جمع abandoned carts از snapshot‌های ۳۰ روز اخیر
    const abandonedCartsCount = snapshotRows.reduce((acc, r) => acc + r.abandonedCarts, 0)
    const abandonedCartsToman = snapshotRows.reduce((acc, r) => acc + Number(r.abandonedValueToman), 0)
    const avgConvBps = snapshotRows.length
      ? Math.round(snapshotRows.reduce((acc, r) => acc + r.conversionRateBps, 0) / snapshotRows.length)
      : 0

    const recentOrders = recentOrderRows.map((o) => ({
      id:          o.id,
      status:      o.status,
      totalAmount: o.totalAmount,
      customerName: (o.shippingAddress as { fullName?: string } | null)?.fullName ?? null,
      city:         (o.shippingAddress as { city?: string } | null)?.city ?? null,
      createdAt:   o.createdAt,
    }))

    return {
      revenueTomanThisMonth: Math.floor(Number(s?.revThisMonth ?? 0) / 10),
      revenueLastMonth:      Math.floor(Number(s?.revLastMonth ?? 0) / 10),
      ordersThisMonth:       s?.ordersThisMonth ?? 0,
      paidOrdersThisMonth:   s?.paidThisMonth ?? 0,
      newUsersThisMonth:     s?.newUsers ?? 0,
      lowStockProducts:      lowStockRows.map((p) => ({ ...p, threshold: 5 })),
      recentOrders,
      sparkData,
      abandonedCartsCount,
      abandonedCartsToman,
      conversionRatePct: Math.round(avgConvBps / 100),
    }
  },
  ['admin-dashboard'],
  { revalidate: 300 }
)
