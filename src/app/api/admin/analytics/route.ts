/**
 * GET /api/admin/analytics
 * آمار بازدید برای داشبورد ادمین
 */

import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { pageViews } from '@/lib/db/schema'
import { gte, sql, desc } from 'drizzle-orm'
import { requireAdmin } from '@/lib/admin-auth'

export async function GET(req: Request) {
  const auth = await requireAdmin()
  if (!auth.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const days = parseInt(searchParams.get('days') ?? '30', 10)

  const since = new Date()
  since.setDate(since.getDate() - days)

  try {
    const [
      totalViews,
      uniqueSessions,
      topPages,
      viewsByDay,
      deviceBreakdown,
    ] = await Promise.all([
      // کل بازدیدها
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(pageViews)
        .where(gte(pageViews.createdAt, since)),

      // بازدیدکنندگان یکتا (session)
      db
        .select({ count: sql<number>`count(distinct ${pageViews.sessionId})::int` })
        .from(pageViews)
        .where(gte(pageViews.createdAt, since)),

      // صفحات پربازدید
      db
        .select({
          path: pageViews.path,
          views: sql<number>`count(*)::int`,
        })
        .from(pageViews)
        .where(gte(pageViews.createdAt, since))
        .groupBy(pageViews.path)
        .orderBy(desc(sql`count(*)`))
        .limit(10),

      // بازدید روزانه
      db
        .select({
          date: sql<string>`date(${pageViews.createdAt} AT TIME ZONE 'Asia/Tehran')`,
          views: sql<number>`count(*)::int`,
          unique: sql<number>`count(distinct ${pageViews.sessionId})::int`,
        })
        .from(pageViews)
        .where(gte(pageViews.createdAt, since))
        .groupBy(sql`date(${pageViews.createdAt} AT TIME ZONE 'Asia/Tehran')`)
        .orderBy(sql`date(${pageViews.createdAt} AT TIME ZONE 'Asia/Tehran')`),

      // دستگاه
      db
        .select({
          device: pageViews.device,
          count: sql<number>`count(*)::int`,
        })
        .from(pageViews)
        .where(gte(pageViews.createdAt, since))
        .groupBy(pageViews.device),
    ])

    return NextResponse.json({
      period: { days, since: since.toISOString() },
      summary: {
        totalViews: totalViews[0]?.count ?? 0,
        uniqueVisitors: uniqueSessions[0]?.count ?? 0,
      },
      topPages,
      viewsByDay,
      deviceBreakdown,
    })
  } catch (err) {
    console.error('[analytics GET]', err)
    return NextResponse.json({ error: 'خطا در دریافت آمار' }, { status: 500 })
  }
}
