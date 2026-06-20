/**
 * GET /api/admin/analytics
 * آمار بازدید برای داشبورد ادمین
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { pageViews } from '@/lib/db/schema'
import { gte, lt, and, sql, desc } from 'drizzle-orm'
import { requireAdmin } from '@/lib/admin-auth'

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req)
  if (!auth.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const days = parseInt(searchParams.get('days') ?? '30', 10)

  const since = new Date()
  since.setDate(since.getDate() - days)

  const prevSince = new Date(since)
  prevSince.setDate(prevSince.getDate() - days)

  // هر query به‌صورت مجزا اجرا می‌شود — اگر یکی خطا داد (مثلاً قبل از اعمال
  // کامل migration ستون‌های جدید)، کل صفحه از کار نمی‌افتد، فقط همان بخش خالی می‌ماند
  async function safe<T>(label: string, fallback: T, fn: () => Promise<T>): Promise<T> {
    try {
      return await fn()
    } catch (err) {
      console.error(`[analytics GET] ${label} failed:`, err)
      return fallback
    }
  }

  try {
    const [
      totalViews,
      uniqueSessions,
      topPages,
      viewsByDay,
      deviceBreakdown,
      browserBreakdown,
      osBreakdown,
      referrerBreakdown,
      hourlyBreakdown,
      prevTotals,
    ] = await Promise.all([
      // کل بازدیدها
      safe('totalViews', [{ count: 0 }], () => db
        .select({ count: sql<number>`count(*)::int` })
        .from(pageViews)
        .where(gte(pageViews.createdAt, since))),

      // بازدیدکنندگان یکتا (session)
      safe('uniqueSessions', [{ count: 0 }], () => db
        .select({ count: sql<number>`count(distinct ${pageViews.sessionId})::int` })
        .from(pageViews)
        .where(gte(pageViews.createdAt, since))),

      // صفحات پربازدید
      safe('topPages', [] as { path: string; views: number }[], () => db
        .select({
          path: pageViews.path,
          views: sql<number>`count(*)::int`,
        })
        .from(pageViews)
        .where(gte(pageViews.createdAt, since))
        .groupBy(pageViews.path)
        .orderBy(desc(sql`count(*)`))
        .limit(10)),

      // بازدید روزانه
      safe('viewsByDay', [] as { date: string; views: number; unique: number }[], () => db
        .select({
          date: sql<string>`date(${pageViews.createdAt} AT TIME ZONE 'Asia/Tehran')`,
          views: sql<number>`count(*)::int`,
          unique: sql<number>`count(distinct ${pageViews.sessionId})::int`,
        })
        .from(pageViews)
        .where(gte(pageViews.createdAt, since))
        .groupBy(sql`date(${pageViews.createdAt} AT TIME ZONE 'Asia/Tehran')`)
        .orderBy(sql`date(${pageViews.createdAt} AT TIME ZONE 'Asia/Tehran')`)),

      // دستگاه
      safe('deviceBreakdown', [] as { device: string | null; count: number }[], () => db
        .select({
          device: pageViews.device,
          count: sql<number>`count(*)::int`,
        })
        .from(pageViews)
        .where(gte(pageViews.createdAt, since))
        .groupBy(pageViews.device)),

      // مرورگر
      safe('browserBreakdown', [] as { browser: string | null; count: number }[], () => db
        .select({
          browser: pageViews.browser,
          count: sql<number>`count(*)::int`,
        })
        .from(pageViews)
        .where(gte(pageViews.createdAt, since))
        .groupBy(pageViews.browser)
        .orderBy(desc(sql`count(*)`))
        .limit(8)),

      // سیستم‌عامل
      safe('osBreakdown', [] as { os: string | null; count: number }[], () => db
        .select({
          os: pageViews.os,
          count: sql<number>`count(*)::int`,
        })
        .from(pageViews)
        .where(gte(pageViews.createdAt, since))
        .groupBy(pageViews.os)
        .orderBy(desc(sql`count(*)`))
        .limit(8)),

      // منابع ورودی (referrer) — بر اساس دامنه
      safe('referrerBreakdown', [] as { referrer: string | null; count: number }[], () => db
        .select({
          referrer: sql<string>`
            CASE
              WHEN ${pageViews.referrer} IS NULL OR ${pageViews.referrer} = '' THEN 'مستقیم'
              ELSE regexp_replace(${pageViews.referrer}, '^https?://(www\\.)?([^/]+).*$', '\\2')
            END
          `,
          count: sql<number>`count(*)::int`,
        })
        .from(pageViews)
        .where(gte(pageViews.createdAt, since))
        .groupBy(sql`1`)
        .orderBy(desc(sql`count(*)`))
        .limit(8)),

      // تفکیک ساعت روز (الگوی ترافیک)
      safe('hourlyBreakdown', [] as { hour: number; count: number }[], () => db
        .select({
          hour: sql<number>`extract(hour from ${pageViews.createdAt} AT TIME ZONE 'Asia/Tehran')::int`,
          count: sql<number>`count(*)::int`,
        })
        .from(pageViews)
        .where(gte(pageViews.createdAt, since))
        .groupBy(sql`1`)
        .orderBy(sql`1`)),

      // دوره قبلی برای محاسبه رشد
      safe('prevTotals', [{ count: 0, unique: 0 }], () => db
        .select({
          count: sql<number>`count(*)::int`,
          unique: sql<number>`count(distinct ${pageViews.sessionId})::int`,
        })
        .from(pageViews)
        .where(and(gte(pageViews.createdAt, prevSince), lt(pageViews.createdAt, since)))),
    ])

    const prevViews = prevTotals[0]?.count ?? 0
    const prevUnique = prevTotals[0]?.unique ?? 0
    const curViews = totalViews[0]?.count ?? 0
    const curUnique = uniqueSessions[0]?.count ?? 0
    const growth = (cur: number, prev: number) =>
      prev === 0 ? (cur > 0 ? 100 : 0) : Math.round(((cur - prev) / prev) * 100)

    return NextResponse.json({
      period: { days, since: since.toISOString() },
      summary: {
        totalViews: curViews,
        uniqueVisitors: curUnique,
        viewsGrowth: growth(curViews, prevViews),
        visitorsGrowth: growth(curUnique, prevUnique),
      },
      topPages,
      viewsByDay,
      deviceBreakdown,
      browserBreakdown,
      osBreakdown,
      referrerBreakdown,
      hourlyBreakdown,
    })
  } catch (err) {
    console.error('[analytics GET]', err)
    return NextResponse.json({ error: 'خطا در دریافت آمار' }, { status: 500 })
  }
}
