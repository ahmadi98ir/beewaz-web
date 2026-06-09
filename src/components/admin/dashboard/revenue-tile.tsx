'use client'

import { BentoCard } from './bento-card'
import { MiniSparkChart } from './mini-spark-chart'
import type { DailyRevenue } from '@/app/admin/actions/dashboard'

interface RevenueTileProps {
  revenueToman:   number
  revenueLastMonth: number
  paidOrders:     number
  sparkData:      DailyRevenue[]
}

function formatToman(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)} میلیارد`
  if (n >= 1_000_000)     return `${(n / 1_000_000).toFixed(1)} میلیون`
  if (n >= 1_000)         return `${(n / 1_000).toFixed(0)} هزار`
  return n.toLocaleString('fa-IR')
}

export function RevenueTile({ revenueToman, revenueLastMonth, paidOrders, sparkData }: RevenueTileProps) {
  const diff = revenueLastMonth > 0
    ? Math.round(((revenueToman - revenueLastMonth) / revenueLastMonth) * 100)
    : null
  const isUp = diff !== null && diff >= 0

  return (
    <BentoCard
      className="col-span-2 p-6 flex flex-col justify-between min-h-[180px]"
      glowColor="rgba(96,128,250,0.12)"
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-white/50 text-xs font-medium tracking-wide uppercase">درآمد این ماه</p>
          <p className="text-3xl font-black text-white mt-1 leading-none">
            {revenueToman > 0 ? formatToman(revenueToman) : '—'}
          </p>
          <p className="text-white/40 text-xs mt-1">تومان</p>
        </div>

        <div className="flex flex-col items-end gap-2">
          {diff !== null && (
            <span
              className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border ${
                isUp
                  ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20'
                  : 'text-red-400 bg-red-400/10 border-red-400/20'
              }`}
            >
              {isUp ? '↑' : '↓'} {Math.abs(diff).toLocaleString('fa-IR')}٪
            </span>
          )}
          <span className="text-white/30 text-xs">
            {paidOrders.toLocaleString('fa-IR')} سفارش پرداخت‌شده
          </span>
        </div>
      </div>

      {/* Spark chart */}
      <div className="mt-4 -mb-1 -mx-1">
        <MiniSparkChart data={sparkData} color="#6080FA" height={52} />
      </div>

      {/* Bottom label */}
      <div className="flex justify-between mt-2">
        {sparkData.map((d, i) => (
          <span key={i} className="text-[10px] text-white/25">
            {new Date(d.date).toLocaleDateString('fa-IR', { weekday: 'narrow' })}
          </span>
        ))}
      </div>
    </BentoCard>
  )
}
