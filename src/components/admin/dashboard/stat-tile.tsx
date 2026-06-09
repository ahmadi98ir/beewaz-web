import type { ReactNode } from 'react'
import { BentoCard } from './bento-card'

interface StatTileProps {
  label:      string
  value:      string
  sub?:       string
  icon:       ReactNode
  iconBg:     string
  glowColor?: string
  trend?:     { value: number; isUp: boolean }
}

export function StatTile({ label, value, sub, icon, iconBg, glowColor, trend }: StatTileProps) {
  return (
    <BentoCard className="p-5 flex flex-col justify-between min-h-[130px]" glowColor={glowColor}>
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
          {icon}
        </div>
        {trend && (
          <span
            className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
              trend.isUp
                ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20'
                : 'text-red-400 bg-red-400/10 border-red-400/20'
            }`}
          >
            {trend.isUp ? '↑' : '↓'}{Math.abs(trend.value).toLocaleString('fa-IR')}٪
          </span>
        )}
      </div>

      <div>
        <p className="text-2xl font-black text-white">{value}</p>
        <p className="text-white/40 text-xs mt-0.5">{label}</p>
        {sub && <p className="text-white/25 text-[10px] mt-0.5">{sub}</p>}
      </div>
    </BentoCard>
  )
}
