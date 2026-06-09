'use client'

import type { DailyRevenue } from '@/app/admin/actions/dashboard'

interface MiniSparkChartProps {
  data: DailyRevenue[]
  color?: string
  height?: number
}

export function MiniSparkChart({ data, color = '#6080FA', height = 56 }: MiniSparkChartProps) {
  if (data.length < 2) {
    return <div style={{ height }} className="opacity-30 flex items-center justify-center text-white/40 text-xs">بدون داده</div>
  }

  const width = 200
  const pad   = 4
  const max   = Math.max(...data.map((d) => d.toman), 1)
  const min   = Math.min(...data.map((d) => d.toman), 0)

  const xStep = (width - pad * 2) / (data.length - 1)
  const yRange = max - min || 1

  const points = data.map((d, i) => ({
    x: pad + i * xStep,
    y: pad + (1 - (d.toman - min) / yRange) * (height - pad * 2),
  }))

  const linePath = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    .join(' ')

  const firstPoint = points[0]!
  const lastPoint  = points[points.length - 1]!

  const areaPath =
    linePath +
    ` L${lastPoint.x.toFixed(1)},${(height - pad).toFixed(1)}` +
    ` L${firstPoint.x.toFixed(1)},${(height - pad).toFixed(1)} Z`

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      height={height}
      className="overflow-visible"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id={`spark-area-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>

      {/* Area fill */}
      <path
        d={areaPath}
        fill={`url(#spark-area-${color.replace('#', '')})`}
      />

      {/* Line */}
      <path
        d={linePath}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ filter: `drop-shadow(0 0 4px ${color}80)` }}
      />

      {/* Last point dot */}
      <circle
        cx={lastPoint.x}
        cy={lastPoint.y}
        r="3.5"
        fill={color}
        style={{ filter: `drop-shadow(0 0 6px ${color})` }}
      />
    </svg>
  )
}
