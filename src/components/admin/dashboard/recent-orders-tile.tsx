import Link from 'next/link'
import { BentoCard } from './bento-card'

interface Order {
  id:          string
  status:      string
  totalAmount: string | null
  customerName: string | null
  city:        string | null
  createdAt:   Date
}

const STATUS_CONFIG: Record<string, { label: string; cls: string; dot: string }> = {
  pending:    { label: 'در انتظار',   cls: 'text-amber-400 bg-amber-400/10 border-amber-400/20', dot: 'bg-amber-400' },
  paid:       { label: 'پرداخت شده', cls: 'text-blue-400 bg-blue-400/10 border-blue-400/20',   dot: 'bg-blue-400' },
  processing: { label: 'آماده‌سازی', cls: 'text-purple-400 bg-purple-400/10 border-purple-400/20', dot: 'bg-purple-400' },
  shipped:    { label: 'ارسال شده',  cls: 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20', dot: 'bg-indigo-400' },
  delivered:  { label: 'تحویل شده', cls: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20', dot: 'bg-emerald-400' },
  cancelled:  { label: 'لغو شده',   cls: 'text-red-400 bg-red-400/10 border-red-400/20',       dot: 'bg-red-400' },
  refunded:   { label: 'مسترد شده', cls: 'text-rose-400 bg-rose-400/10 border-rose-400/20',    dot: 'bg-rose-400' },
}

function formatPrice(rial: string | null): string {
  if (!rial) return '—'
  const toman = Math.floor(Number(rial) / 10)
  if (toman >= 1_000_000) return `${(toman / 1_000_000).toFixed(1)} م`
  if (toman >= 1_000)     return `${(toman / 1_000).toFixed(0)} ه`
  return toman.toLocaleString('fa-IR')
}

export function RecentOrdersTile({ orders }: { orders: Order[] }) {
  return (
    <BentoCard className="col-span-3 flex flex-col" glowColor="rgba(96,128,250,0.06)">
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
        <p className="text-white font-bold text-sm">آخرین سفارشات</p>
        <Link href="/admin/orders" className="text-white/40 text-xs hover:text-white/70 transition-colors">
          مشاهده همه ←
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="py-12 text-center text-white/25 text-sm">هنوز سفارشی ثبت نشده</div>
      ) : (
        <div className="divide-y divide-white/[0.04]">
          {orders.map((order) => {
            const s = STATUS_CONFIG[order.status] ?? STATUS_CONFIG['pending']!
            const date = new Intl.DateTimeFormat('fa-IR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(order.createdAt))

            return (
              <Link
                key={order.id}
                href={`/admin/orders/${order.id}`}
                className="flex items-center gap-4 px-6 py-3.5 hover:bg-white/[0.03] transition-colors group"
              >
                {/* ID */}
                <span className="font-mono text-[11px] text-white/30 w-16 flex-shrink-0 group-hover:text-white/50 transition-colors" dir="ltr">
                  {order.id.slice(0, 8).toUpperCase()}
                </span>

                {/* Customer */}
                <div className="flex-1 min-w-0">
                  <p className="text-white/80 text-sm font-medium truncate group-hover:text-white transition-colors">
                    {order.customerName ?? 'ناشناس'}
                  </p>
                  {order.city && (
                    <p className="text-white/30 text-[11px]">{order.city}</p>
                  )}
                </div>

                {/* Price */}
                <span className="text-white font-bold text-sm flex-shrink-0 w-20 text-end">
                  {formatPrice(order.totalAmount)} ت
                </span>

                {/* Status */}
                <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border flex-shrink-0 hidden sm:inline-flex items-center gap-1.5 ${s.cls}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                  {s.label}
                </span>

                {/* Date */}
                <span className="text-white/25 text-[11px] flex-shrink-0 hidden lg:block">{date}</span>

                {/* Arrow */}
                <span className="text-white/20 group-hover:text-white/50 transition-colors flex-shrink-0">←</span>
              </Link>
            )
          })}
        </div>
      )}
    </BentoCard>
  )
}
