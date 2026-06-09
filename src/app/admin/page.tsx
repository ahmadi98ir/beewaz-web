import type { Metadata } from 'next'
import { getDashboardData } from './actions/dashboard'
import { RevenueTile }      from '@/components/admin/dashboard/revenue-tile'
import { StatTile }         from '@/components/admin/dashboard/stat-tile'
import { LowStockTile }     from '@/components/admin/dashboard/low-stock-tile'
import { AnalyticsTile }    from '@/components/admin/dashboard/analytics-tile'
import { QuickActionsTile } from '@/components/admin/dashboard/quick-actions-tile'
import { RecentOrdersTile } from '@/components/admin/dashboard/recent-orders-tile'

export const metadata: Metadata = { title: 'داشبورد' }

// ─── Icons ────────────────────────────────────────────────────────────────────

const IconShoppingCart = (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
)

const IconUsers = (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function AdminDashboard() {
  let data = await getDashboardData().catch(() => null)

  // Graceful fallback اگر DB در دسترس نباشد
  if (!data) {
    data = {
      revenueTomanThisMonth: 0,
      revenueLastMonth:      0,
      ordersThisMonth:       0,
      paidOrdersThisMonth:   0,
      newUsersThisMonth:     0,
      lowStockProducts:      [],
      recentOrders:          [],
      sparkData:             [],
      abandonedCartsCount:   0,
      abandonedCartsToman:   0,
      conversionRatePct:     0,
    }
  }

  const revTrend = data.revenueLastMonth > 0
    ? {
        value: Math.round(((data.revenueTomanThisMonth - data.revenueLastMonth) / data.revenueLastMonth) * 100),
        isUp:  data.revenueTomanThisMonth >= data.revenueLastMonth,
      }
    : undefined

  const persianDate = new Intl.DateTimeFormat('fa-IR', { dateStyle: 'full' }).format(new Date())

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-y-auto bg-[#070711]">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="bg-white/[0.03] backdrop-blur-xl border-b border-white/[0.06] px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div>
          <h1 className="text-base font-black text-white">داشبورد بیواز</h1>
          <p className="text-white/30 text-xs mt-0.5">{persianDate}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-semibold bg-emerald-400/10 px-3 py-1.5 rounded-full border border-emerald-400/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            سیستم آنلاین
          </span>
        </div>
      </header>

      {/* ── Bento Grid ─────────────────────────────────────────────────────── */}
      <div className="p-5 grid grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-min">

        {/* ── ردیف ۱: Revenue Hero + آمار کلی ────────────────────────────── */}
        <RevenueTile
          revenueToman={data.revenueTomanThisMonth}
          revenueLastMonth={data.revenueLastMonth}
          paidOrders={data.paidOrdersThisMonth}
          sparkData={data.sparkData}
        />

        <StatTile
          label="سفارشات این ماه"
          value={data.ordersThisMonth.toLocaleString('fa-IR')}
          sub={`${data.paidOrdersThisMonth.toLocaleString('fa-IR')} پرداخت‌شده`}
          icon={IconShoppingCart}
          iconBg="bg-brand-500/15 text-brand-300"
          glowColor="rgba(59,92,239,0.10)"
          trend={revTrend ? { value: Math.abs(revTrend.value), isUp: revTrend.isUp } : undefined}
        />

        <StatTile
          label="کاربران جدید"
          value={data.newUsersThisMonth.toLocaleString('fa-IR')}
          sub="این ماه"
          icon={IconUsers}
          iconBg="bg-purple-500/15 text-purple-300"
          glowColor="rgba(167,139,250,0.08)"
        />

        {/* ── ردیف ۲: Low Stock + Abandonment + Quick Actions ─────────────── */}
        <LowStockTile products={data.lowStockProducts} />

        <AnalyticsTile
          conversionRatePct={data.conversionRatePct}
          abandonedCarts={data.abandonedCartsCount}
          abandonedToman={data.abandonedCartsToman}
          ordersThisMonth={data.ordersThisMonth}
          paidOrders={data.paidOrdersThisMonth}
        />

        <QuickActionsTile />

        {/* ── ردیف ۳: آخرین سفارشات (col-span-4) ─────────────────────────── */}
        <RecentOrdersTile orders={data.recentOrders} />

      </div>

    </div>
  )
}
