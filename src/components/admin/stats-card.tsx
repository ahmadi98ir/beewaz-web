import type { ReactNode } from 'react'

interface StatsCardProps {
  label: string
  value: string
  sub?: string
  color?: 'brand' | 'blue' | 'green' | 'amber' | 'red'
  icon?: ReactNode
  trend?: { value: number; label: string }
}

const COLOR_MAP: Record<NonNullable<StatsCardProps['color']>, { bg: string; icon: string; text: string }> = {
  brand: { bg: 'bg-brand-50',  icon: 'bg-brand-100 text-brand-600',  text: 'text-brand-700' },
  blue:  { bg: 'bg-blue-50',   icon: 'bg-blue-100 text-blue-600',    text: 'text-blue-700'  },
  green: { bg: 'bg-green-50',  icon: 'bg-green-100 text-green-600',  text: 'text-green-700' },
  amber: { bg: 'bg-amber-50',  icon: 'bg-amber-100 text-amber-600',  text: 'text-amber-700' },
  red:   { bg: 'bg-red-50',    icon: 'bg-red-100 text-red-600',      text: 'text-red-700'   },
}

export function StatsCard({ label, value, sub, color = 'brand', icon, trend }: StatsCardProps) {
  const c = COLOR_MAP[color]
  return (
    <div className={`rounded-2xl border border-surface-200 p-5 ${c.bg} flex flex-col gap-3`}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-surface-600">{label}</span>
        {icon && (
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${c.icon}`}>
            {icon}
          </div>
        )}
      </div>
      <div>
        <p className={`text-2xl font-black ${c.text}`}>{value}</p>
        {sub && <p className="text-xs text-surface-500 mt-0.5">{sub}</p>}
      </div>
      {trend && (
        <div className={`text-xs font-semibold ${trend.value >= 0 ? 'text-green-600' : 'text-red-500'}`}>
          {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}٪ {trend.label}
        </div>
      )}
    </div>
  )
}
