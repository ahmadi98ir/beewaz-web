import { db } from '@/lib/db'
import { orders, users, productViews, cartAbandonmentSessions, analyticsDailySnapshots } from '@/lib/db/schema'
import { sql, gte } from 'drizzle-orm'

const BACKFILL_DAYS = 30
const PAID_STATUSES = sql`('paid','delivered','shipped','processing')`

function isoDay(d: Date) {
  return d.toISOString().slice(0, 10)
}

// محاسبه و پر کردن روزهای گذشته‌ای که هنوز snapshot ندارند (self-healing، بدون نیاز به cron خارجی)
export async function ensureDailySnapshots() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const start = new Date(today)
  start.setDate(start.getDate() - BACKFILL_DAYS)

  const existing = await db
    .select({ date: analyticsDailySnapshots.date })
    .from(analyticsDailySnapshots)
    .where(gte(analyticsDailySnapshots.date, isoDay(start)))

  const existingDates = new Set(existing.map((r) => r.date))

  const missingDates: string[] = []
  for (const d = new Date(start); d < today; d.setDate(d.getDate() + 1)) {
    const key = isoDay(d)
    if (!existingDates.has(key)) missingDates.push(key)
  }
  if (missingDates.length === 0) return

  const [createdRows, paidRows, userRows, viewRows, cartRows] = await Promise.all([
    db.select({
      day:       sql<string>`date_trunc('day', ${orders.createdAt})::date::text`,
      total:     sql<number>`count(*)::int`,
      cancelled: sql<number>`count(*) filter (where ${orders.status} = 'cancelled')::int`,
    })
      .from(orders)
      .where(gte(orders.createdAt, start))
      .groupBy(sql`date_trunc('day', ${orders.createdAt})`),

    db.select({
      day:         sql<string>`date_trunc('day', ${orders.paidAt})::date::text`,
      paid:        sql<number>`count(*) filter (where ${orders.status} in ${PAID_STATUSES})::int`,
      revenueRial: sql<number>`coalesce(sum(${orders.totalAmount}) filter (where ${orders.status} in ${PAID_STATUSES}), 0)::bigint`,
    })
      .from(orders)
      .where(gte(orders.paidAt, start))
      .groupBy(sql`date_trunc('day', ${orders.paidAt})`),

    db.select({
      day:   sql<string>`date_trunc('day', ${users.createdAt})::date::text`,
      count: sql<number>`count(*)::int`,
    })
      .from(users)
      .where(gte(users.createdAt, start))
      .groupBy(sql`date_trunc('day', ${users.createdAt})`),

    db.select({
      day:            sql<string>`date_trunc('day', ${productViews.createdAt})::date::text`,
      count:          sql<number>`count(*)::int`,
      activeSessions: sql<number>`count(distinct ${productViews.sessionId})::int`,
    })
      .from(productViews)
      .where(gte(productViews.createdAt, start))
      .groupBy(sql`date_trunc('day', ${productViews.createdAt})`),

    db.select({
      day:       sql<string>`date_trunc('day', ${cartAbandonmentSessions.createdAt})::date::text`,
      abandoned: sql<number>`count(*)::int`,
      recovered: sql<number>`count(*) filter (where ${cartAbandonmentSessions.recovered})::int`,
      valueRial: sql<number>`coalesce(sum(${cartAbandonmentSessions.totalAmountRial}), 0)::bigint`,
    })
      .from(cartAbandonmentSessions)
      .where(gte(cartAbandonmentSessions.createdAt, start))
      .groupBy(sql`date_trunc('day', ${cartAbandonmentSessions.createdAt})`),
  ])

  const createdMap = new Map(createdRows.map((r) => [r.day, r]))
  const paidMap     = new Map(paidRows.map((r) => [r.day, r]))
  const userMap     = new Map(userRows.map((r) => [r.day, r.count]))
  const viewMap     = new Map(viewRows.map((r) => [r.day, r]))
  const cartMap     = new Map(cartRows.map((r) => [r.day, r]))

  const rows = missingDates.map((day) => {
    const created = createdMap.get(day)
    const paid    = paidMap.get(day)
    const view    = viewMap.get(day)
    const cart    = cartMap.get(day)

    const revenueRial   = Number(paid?.revenueRial ?? 0)
    const revenueToman  = Math.floor(revenueRial / 10)
    const paidOrders    = paid?.paid ?? 0
    const activeUsers   = view?.activeSessions ?? 0

    return {
      date:                day,
      totalOrders:         created?.total ?? 0,
      paidOrders,
      cancelledOrders:     created?.cancelled ?? 0,
      revenueRial,
      revenueToman,
      aovToman:            paidOrders > 0 ? Math.floor(revenueToman / paidOrders) : 0,
      newUsers:            userMap.get(day) ?? 0,
      activeUsers,
      productViewsCount:   view?.count ?? 0,
      abandonedCarts:      cart?.abandoned ?? 0,
      recoveredCarts:      cart?.recovered ?? 0,
      abandonedValueToman: Math.floor(Number(cart?.valueRial ?? 0) / 10),
      conversionRateBps:   activeUsers > 0 ? Math.round((paidOrders / activeUsers) * 10000) : 0,
    }
  })

  await db.insert(analyticsDailySnapshots).values(rows).onConflictDoNothing()
}
