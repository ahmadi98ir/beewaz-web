import Link from 'next/link'
import { StatsCard } from '@/components/admin/stats-card'
import { kpiData, mockOrders, mockLeads, monthlyStats } from '@/lib/mock-admin-data'
import { formatPrice } from '@/lib/utils'
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

function LeadBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    new:       { label: 'جدید',      cls: 'bg-blue-50 text-blue-700 border-blue-200' },
    contacted: { label: 'تماس گرفته', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
    converted: { label: 'تبدیل شده', cls: 'bg-green-50 text-green-700 border-green-200' },
    lost:      { label: 'از دست رفته', cls: 'bg-red-50 text-red-700 border-red-200' },
  }
  const s = map[status] ?? { label: status, cls: 'bg-surface-100 text-surface-700 border-surface-200' }
  return <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold border ${s.cls}`}>{s.label}</span>
}

// ── Revenue Bar Chart ────────────────────────────────────────────────────────

function RevenueChart() {
  const max = Math.max(...monthlyStats.map((m) => m.revenue))
  return (
    <div className="bg-white rounded-2xl border border-surface-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-bold text-surface-900">درآمد ماهانه</h3>
          <p className="text-xs text-surface-400 mt-0.5">۷ ماه اخیر</p>
        </div>
        <span className="text-xs font-semibold text-green-600 bg-green-50 px-2.5 py-1 rounded-full border border-green-200">
          ↑ ۱۴.۲٪ رشد
        </span>
      </div>

      <div className="flex items-end gap-2 h-36">
        {monthlyStats.map((m, i) => {
          const heightPct = (m.revenue / max) * 100
          const isLast = i === monthlyStats.length - 1
          return (
            <div key={m.month} className="flex-1 flex flex-col items-center gap-2 group">
              <div className="w-full flex items-end justify-center" style={{ height: '112px' }}>
                <div
                  className={`w-full rounded-t-xl transition-all duration-500 relative ${isLast ? '' : 'bg-surface-200 group-hover:bg-brand-300'}`}
                  style={{ height: `${heightPct}%`, ...(isLast ? { background: '#F97316' } : {}) }}
                  title={formatPrice(m.revenue)}
                >
                  {/* Tooltip */}
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-surface-900 text-white text-[10px] font-bold px-2 py-1 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    {(m.revenue / 1_000_000).toFixed(1)}M
                  </div>
                </div>
              </div>
              <span className="text-[10px] text-surface-400 font-medium">{m.month}</span>
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-surface-100">
        {[
          { label: 'کل درآمد', value: `${(monthlyStats.at(-1)!.revenue / 1_000_000).toFixed(0)}M تومان` },
          { label: 'سفارشات', value: `${monthlyStats.at(-1)!.orders} عدد` },
          { label: 'لیدهای جدید', value: `${monthlyStats.at(-1)!.leads} نفر` },
        ].map((item) => (
          <div key={item.label} className="text-center">
            <p className="text-base font-black text-surface-900">{item.value}</p>
            <p className="text-xs text-surface-400">{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const recentOrders = mockOrders.slice(0, 5)
  const recentLeads = mockLeads.filter((l) => l.status === 'new').slice(0, 5)

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
            value={`${(kpiData.totalRevenue / 1_000_000).toFixed(0)}M`}
            growth={kpiData.revenueGrowth}
            sub="تومان"
            color="brand"
            icon={<svg viewBox="0 0 20 20" className="w-5 h-5" fill="currentColor"><path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd"/></svg>}
          />
          <StatsCard
            label="سفارشات این ماه"
            value={kpiData.totalOrders.toString()}
            growth={kpiData.ordersGrowth}
            sub="سفارش ثبت شده"
            color="blue"
            icon={<svg viewBox="0 0 20 20" className="w-5 h-5" fill="currentColor"><path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"/></svg>}
          />
          <StatsCard
            label="لیدهای جدید"
            value={kpiData.newLeads.toString()}
            growth={kpiData.leadsGrowth}
            sub="در انتظار تماس"
            color="green"
            icon={<svg viewBox="0 0 20 20" className="w-5 h-5" fill="currentColor"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/></svg>}
          />
          <StatsCard
            label="نرخ تبدیل"
            value={`${kpiData.conversionRate}٪`}
            sub="لید به مشتری"
            color="amber"
            icon={<svg viewBox="0 0 20 20" className="w-5 h-5" fill="currentColor"><path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd"/></svg>}
          />
        </div>

        {/* Chart + Recent Leads */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RevenueChart />
          </div>

          {/* لیدهای جدید */}
          <div className="bg-white rounded-2xl border border-surface-200 p-6 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-surface-900">لیدهای جدید</h3>
              <Link href="/admin/leads" className="text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors">
                مشاهده همه
              </Link>
            </div>
            <div className="flex-1 space-y-3">
              {recentLeads.map((lead) => (
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
                  <span className="text-xs text-surface-400 flex-shrink-0">{lead.inquiryType?.split('/')[0]}</span>
                </div>
              ))}
            </div>
            <Link href="/admin/leads" className="btn btn-outline w-full text-sm py-2.5 mt-4">
              مدیریت لیدها
            </Link>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-2xl border border-surface-200 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-surface-100">
            <h3 className="font-bold text-surface-900">آخرین سفارشات</h3>
            <Link href="/admin/orders" className="text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors">
              مشاهده همه
            </Link>
          </div>
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
                    <td className="px-5 py-3.5 font-mono text-xs text-surface-500">{order.id}</td>
                    <td className="px-5 py-3.5 font-semibold text-surface-900">{order.customerName}</td>
                    <td className="px-5 py-3.5 text-surface-500">{order.city}</td>
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
        </div>
      </div>
    </div>
  )
}
