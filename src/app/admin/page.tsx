import Link from 'next/link'
import { StatsCard } from '@/components/admin/stats-card'
import { formatPrice } from '@/lib/utils'
import { db } from '@/lib/db'
import { orders, leads, pageViews } from '@/lib/db/schema'
import { eq, desc, gte, sql } from 'drizzle-orm'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'داشبورد' }

// ── Status Badges ────────────────────────────────────────────────────────────

function OrderBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    pending:    { label: 'در انتظار',   cls: 'bg-amber-50 text-amber-700 border-amber-200' },
    paid:       { label: 'پرداخت شده', cls: 'bg-blue-50 text-blue-700 border-blue-200' },
    processing: { label: 'در حال آماده‌سازی', cls: 'bg-purple-50 text-purple-700 border-purple-200' },
    shipped:    { label: 'ارسال شده',  cls: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    delivered:  { label: 'تحویل شده', cls: 'bg-green-50 text-green-700 border-green-200' },
    cancelled:  { label: 'لغو شده',   cls: 'bg-red-50 text-red-700 border-red-200' },
  }
  const s = map[status] ?? { label: status, cls: 'bg-surface-100 text-surface-700 border-surface-200' }
  return (
    <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold border ${s.cls}`}>
      {s.label}
    </span>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function AdminDashboard() {
  const monthStart = new Date()
  monthStart.setDate(1)
  monthStart.setHours(0, 0, 0, 0)

  let recentOrders: {
    id: string
    status: string
    totalAmount: number
    shippingAddress: { fullName?: string; city?: string } | null
    createdAt: Date
  }[] = []

  let recentLeads: {
    id: string
    fullName: string | null
    phone: string
    inquiryType: string | null
  }[] = []

  let totalOrdersThisMonth = 0
  let totalRevenueThisMonth = 0
  let newLeadsCount = 0
  let totalLeads = 0

  // Analytics — ۷ روز گذشته
  let totalViewsWeek = 0
  let uniqueVisitorsWeek = 0
  let topPages: { path: string; views: number }[] = []
  let deviceBreakdown: { device: string | null; count: number }[] = []

  try {
    const [ordersResult, leadsResult, statsResult] = await Promise.all([
      db
        .select({
          id: orders.id,
          status: orders.status,
          totalAmount: orders.totalAmount,
          shippingAddress: orders.shippingAddress,
          createdAt: orders.createdAt,
        })
        .from(orders)
        .orderBy(desc(orders.createdAt))
        .limit(5),

      db
        .select({
          id: leads.id,
          fullName: leads.fullName,
          phone: leads.phone,
          inquiryType: leads.inquiryType,
        })
        .from(leads)
        .where(eq(leads.status, 'new'))
        .orderBy(desc(leads.createdAt))
        .limit(5),

      db
        .select({
          orderCount: sql<number>`count(case when ${orders.createdAt} >= ${monthStart.toISOString()} then 1 end)::int`,
          revenue: sql<number>`coalesce(sum(case when ${orders.status} in ('paid','delivered') and ${orders.createdAt} >= ${monthStart.toISOString()} then ${orders.totalAmount} else 0 end), 0)::bigint`,
          newLeads: sql<number>`(select count(*)::int from leads where status = 'new')`,
          totalLeads: sql<number>`(select count(*)::int from leads)`,
        })
        .from(orders),
    ])

    recentOrders = ordersResult
    recentLeads = leadsResult

    const s = statsResult[0]
    if (s) {
      totalOrdersThisMonth = s.orderCount ?? 0
      totalRevenueThisMonth = Number(s.revenue ?? 0)
      newLeadsCount = s.newLeads ?? 0
      totalLeads = s.totalLeads ?? 0
    }

    // Analytics — جداگانه تا خطا کل بلاک را متوقف نکند
    try {
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      const [viewStats, pagesStats, devicesStats] = await Promise.all([
        db.select({ total: sql<number>`count(*)::int`, unique: sql<number>`count(distinct ${pageViews.sessionId})::int` })
          .from(pageViews).where(gte(pageViews.createdAt, weekAgo)),
        db.select({ path: pageViews.path, views: sql<number>`count(*)::int` })
          .from(pageViews).where(gte(pageViews.createdAt, weekAgo))
          .groupBy(pageViews.path).orderBy(desc(sql`count(*)`)).limit(5),
        db.select({ device: pageViews.device, count: sql<number>`count(*)::int` })
          .from(pageViews).where(gte(pageViews.createdAt, weekAgo)).groupBy(pageViews.device),
      ])
      totalViewsWeek = viewStats[0]?.total ?? 0
      uniqueVisitorsWeek = viewStats[0]?.unique ?? 0
      topPages = pagesStats
      deviceBreakdown = devicesStats
    } catch {
      // جدول page_views هنوز ساخته نشده
    }
  } catch {
    // DB might not be available during SSR — show zeros gracefully
  }

  const conversionRate = totalLeads > 0
    ? Math.round(((totalLeads - newLeadsCount) / totalLeads) * 100)
    : 0

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <header className="bg-white border-b border-surface-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-black text-surface-900">داشبورد</h1>
          <p className="text-xs text-surface-400 mt-0.5">
            {new Intl.DateTimeFormat('fa-IR', { dateStyle: 'full' }).format(new Date())}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-xs text-green-600 font-semibold bg-green-50 px-3 py-1.5 rounded-full border border-green-200">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            سیستم آنلاین
          </span>
        </div>
      </header>

      <div className="p-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            label="درآمد این ماه"
            value={totalRevenueThisMonth > 0 ? `${(totalRevenueThisMonth / 1_000_000).toFixed(1)}M` : '—'}
            sub="تومان"
            color="brand"
            icon={<svg viewBox="0 0 20 20" className="w-5 h-5" fill="currentColor"><path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd"/></svg>}
          />
          <StatsCard
            label="سفارشات این ماه"
            value={totalOrdersThisMonth.toString()}
            sub="سفارش ثبت شده"
            color="blue"
            icon={<svg viewBox="0 0 20 20" className="w-5 h-5" fill="currentColor"><path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"/></svg>}
          />
          <StatsCard
            label="لیدهای جدید"
            value={newLeadsCount.toString()}
            sub="در انتظار تماس"
            color="green"
            icon={<svg viewBox="0 0 20 20" className="w-5 h-5" fill="currentColor"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/></svg>}
          />
          <StatsCard
            label="نرخ تبدیل"
            value={`${conversionRate}٪`}
            sub="لید به مشتری"
            color="amber"
            icon={<svg viewBox="0 0 20 20" className="w-5 h-5" fill="currentColor"><path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd"/></svg>}
          />
        </div>

        {/* ── Analytics ─────────────────────────────────────────────── */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl border border-surface-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-surface-900">بازدید سایت</h3>
              <span className="text-xs text-surface-400 bg-surface-50 px-2.5 py-1 rounded-full border border-surface-100">۷ روز گذشته</span>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-brand-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-black text-brand-700">{totalViewsWeek.toLocaleString('fa-IR')}</p>
                <p className="text-xs text-brand-600 mt-1">کل بازدیدها</p>
              </div>
              <div className="bg-green-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-black text-green-700">{uniqueVisitorsWeek.toLocaleString('fa-IR')}</p>
                <p className="text-xs text-green-600 mt-1">بازدیدکنندگان یکتا</p>
              </div>
            </div>
            {deviceBreakdown.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-surface-500 mb-2">تفکیک دستگاه</p>
                {(() => {
                  const total = deviceBreakdown.reduce((s, d) => s + d.count, 0) || 1
                  const labels: Record<string, string> = { mobile: '📱 موبایل', desktop: '🖥️ دسکتاپ', tablet: '📟 تبلت' }
                  const colors: Record<string, string> = { mobile: 'bg-brand-400', desktop: 'bg-blue-400', tablet: 'bg-purple-400' }
                  return deviceBreakdown.map((d) => {
                    const pct = Math.round((d.count / total) * 100)
                    const key = d.device ?? 'desktop'
                    return (
                      <div key={key} className="flex items-center gap-2">
                        <span className="text-xs text-surface-600 w-20 flex-shrink-0">{labels[key] ?? key}</span>
                        <div className="flex-1 h-1.5 bg-surface-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full \${colors[key] ?? 'bg-surface-400'}`} style={{ width: `\${pct}%` }} />
                        </div>
                        <span className="text-xs text-surface-500 w-9 text-end">{pct}٪</span>
                      </div>
                    )
                  })
                })()}
              </div>
            )}
            {totalViewsWeek === 0 && <p className="text-xs text-surface-400 text-center py-2">هنوز بازدیدی ثبت نشده</p>}
          </div>
          <div className="lg:col-span-2 bg-white rounded-2xl border border-surface-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-surface-900">صفحات پربازدید</h3>
              <span className="text-xs text-surface-400 bg-surface-50 px-2.5 py-1 rounded-full border border-surface-100">۷ روز گذشته</span>
            </div>
            {topPages.length === 0 ? (
              <p className="text-sm text-surface-400 text-center py-8">داده‌ای موجود نیست</p>
            ) : (
              <div className="space-y-3">
                {(() => {
                  const maxViews = topPages[0]?.views ?? 1
                  return topPages.map((p, i) => (
                    <div key={p.path} className="flex items-center gap-3">
                      <span className="w-5 text-xs text-surface-400 text-center flex-shrink-0">{(i + 1).toLocaleString('fa-IR')}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-mono text-surface-700 truncate" dir="ltr">{p.path}</span>
                          <span className="text-xs font-bold text-surface-900 flex-shrink-0 ms-2">{p.views.toLocaleString('fa-IR')}</span>
                        </div>
                        <div className="h-1.5 bg-surface-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-brand-400" style={{ width: `\${Math.round((p.views / maxViews) * 100)}%` }} />
                        </div>
                      </div>
                    </div>
                  ))
                })()}
              </div>
            )}
          </div>
        </div>

        {/* Recent Leads + Orders grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* لیدهای جدید */}
          <div className="bg-white rounded-2xl border border-surface-200 p-6 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-surface-900">لیدهای جدید</h3>
              <Link href="/admin/leads" className="text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors">
                مشاهده همه
              </Link>
            </div>
            <div className="flex-1 space-y-3">
              {recentLeads.length === 0 ? (
                <p className="text-sm text-surface-400 text-center py-6">لید جدیدی وجود ندارد</p>
              ) : (
                recentLeads.map((lead) => (
                  <div key={lead.id} className="flex items-center gap-3 p-3 rounded-xl bg-surface-50 hover:bg-surface-100 transition-colors">
                    <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm flex-shrink-0">
                      {(lead.fullName ?? lead.phone)[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-surface-900 truncate">
                        {lead.fullName ?? 'ناشناس'}
                      </p>
                      <p className="text-xs text-surface-400 font-mono" dir="ltr">{lead.phone}</p>
                    </div>
                    <span className="text-xs text-surface-400 flex-shrink-0">{lead.inquiryType?.split('/')[0] ?? ''}</span>
                  </div>
                ))
              )}
            </div>
            <Link href="/admin/leads" className="btn btn-outline w-full text-sm py-2.5 mt-4">
              مدیریت لیدها
            </Link>
          </div>

          {/* Recent Orders */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-surface-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-surface-100">
              <h3 className="font-bold text-surface-900">آخرین سفارشات</h3>
              <Link href="/admin/orders" className="text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors">
                مشاهده همه
              </Link>
            </div>
            {recentOrders.length === 0 ? (
              <div className="py-12 text-center text-surface-400 text-sm">هنوز سفارشی ثبت نشده</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-surface-50 text-surface-500 text-xs">
                    <tr>
                      {['شناسه', 'مشتری', 'شهر', 'مبلغ', 'وضعیت', 'تاریخ'].map((h) => (
                        <th key={h} className="text-start px-5 py-3 font-semibold">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-100">
                    {recentOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-surface-50 transition-colors">
                        <td className="px-5 py-3.5 font-mono text-xs text-surface-500">
                          {order.id.slice(0, 8).toUpperCase()}
                        </td>
                        <td className="px-5 py-3.5 font-semibold text-surface-900">
                          {(order.shippingAddress as { fullName?: string } | null)?.fullName ?? '—'}
                        </td>
                        <td className="px-5 py-3.5 text-surface-500">
                          {(order.shippingAddress as { city?: string } | null)?.city ?? '—'}
                        </td>
                        <td className="px-5 py-3.5 font-bold text-surface-900">{formatPrice(order.totalAmount)}</td>
                        <td className="px-5 py-3.5"><OrderBadge status={order.status} /></td>
                        <td className="px-5 py-3.5 text-surface-400 text-xs">
                          {new Intl.DateTimeFormat('fa-IR', { month: 'short', day: 'numeric' }).format(new Date(order.createdAt))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
