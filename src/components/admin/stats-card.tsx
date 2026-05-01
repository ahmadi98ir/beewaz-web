type Props = {
  label: string
  value: string
  growth?: number   // درصد رشد — مثبت یا منفی
  sub?: string
  color?: 'brand' | 'green' | 'blue' | 'amber'
  icon: React.ReactNode
}

const colors = {
  brand: { bg: 'bg-brand-50', icon: 'text-brand-600', ring: 'ring-brand-100' },
  green: { bg: 'bg-green-50', icon: 'text-green-600', ring: 'ring-green-100' },
  blue:  { bg: 'bg-blue-50',  icon: 'text-blue-600',  ring: 'ring-blue-100' },
  amber: { bg: 'bg-amber-50', icon: 'text-amber-600', ring: 'ring-amber-100' },
}

export function StatsCard({ label, value, growth, sub, color = 'brand', icon }: Props) {
  const c = colors[color]
  const isPositive = growth != null && growth > 0

  return (
    <div className="bg-white rounded-2xl border border-surface-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className={`w-11 h-11 rounded-2xl ${c.bg} ring-4 ${c.ring} flex items-center justify-center flex-shrink-0 ${c.icon}`}>
          {icon}
        </div>
        {growth != null && (
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${isPositive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {isPositive ? '↑' : '↓'} {Math.abs(growth).toFixed(1)}٪
          </span>
        )}
      </div>

      <p className="text-2xl font-black text-surface-900 mb-1">{value}</p>
      <p className="text-sm font-semibold text-surface-600">{label}</p>
      {sub && <p className="text-xs text-surface-400 mt-0.5">{sub}</p>}
    </div>
  )
}
