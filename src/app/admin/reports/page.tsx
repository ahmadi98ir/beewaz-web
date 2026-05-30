'use client'

import { useEffect, useState, useCallback } from 'react'

// ── Types ────────────────────────────────────────────────────────────────────
interface Stats {
  totalRevenue: number
  totalOrders: number
  paidOrders: number
  pendingOrders: number
  cancelledOrders: number
  avgOrderValue: number
  totalDiscount: number
}

interface DailyPoint {
  date: string
  revenue: number
  count: number
}

interface TopProduct {
  productId: string | null
  productName: string
  totalQty: number
  totalRev: number
}

interface StatusItem {
  status: string
  count: number
}

interface PaymentItem {
  method: string | null
  count: number
  rev: number
}

interface ReportData {
  days: number
  stats: Stats
  dailyRevenue: DailyPoint[]
  topProducts: TopProduct[]
  statusBreakdown: StatusItem[]
  paymentMethods: PaymentItem[]
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function fmtRev(rial: number) {
  const t = Math.floor(rial / 10)
  if (t >= 1_000_000) return `${(t / 1_000_000).toFixed(1)} م ت`
  if (t >= 1_000)     return `${(t / 1_000).toFixed(0)} ه ت`
  return t.toLocaleString('fa-IR') + ' ت'
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'در انتظار', paid: 'پرداخت شده', processing: 'آماده‌سازی',
  shipped: 'ارسال شده', delivered: 'تحویل شده', cancelled: 'لغو شده', refunded: 'مسترد',
}

const STATUS_COLORS: Record<string, string> = {
  pending: '#F59E0B', paid: '#3B82F6', processing: '#8B5CF6',
  shipped: '#6366F1', delivered: '#10B981', cancelled: '#EF4444', refunded: '#94A3B8',
}

const PAYMENT_LABELS: Record<string, string> = {
  online: 'آنلاین', card_to_card: 'کارت به کارت',
  cash_on_delivery: 'پرداخت درجا', installment: 'اقساطی',
}

const RANGE_OPTIONS = [
  { value: '7',   label: '۷ روز' },
  { value: '30',  label: '۳۰ روز' },
  { value: '90',  label: '۹۰ روز' },
  { value: '365', label: '۱ سال' },
]

// ── Mini bar chart ────────────────────────────────────────────────────────────
function BarChart({ data }: { data: DailyPoint[] }) {
  if (!data.length) return <div className="h-48 flex items-center justify-center text-surface-300 text-sm">داده‌ای وجود ندارد</div>

  const maxRev = Math.max(...data.map(d => Number(d.revenue)))

  return (
    <div className="flex items-end gap-1 h-48 overflow-x-auto pb-2">
      {data.map((d) => {
        const pct = maxRev > 0 ? (Number(d.revenue) / maxRev) * 100 : 0
        const dateStr = new Intl.DateTimeFormat('fa-IR', { month: 'short', day: 'numeric' }).format(new Date(d.date))
        return (
          <div key={d.date} className="flex flex-col items-center gap-1 flex-1 min-w-[24px] group relative">
            {/* tooltip */}
            <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-surface-900 text-white text-[10px] rounded-lg px-2 py-1 whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-10">
              {dateStr}<br />{fmtRev(Number(d.revenue))}<br />{Number(d.count).toLocaleString('fa-IR')} سفارش
            </div>
            <div
              className="w-full rounded-t-md bg-brand-500 hover:bg-brand-600 transition-colors cursor-default"
              style={{ height: `${Math.max(pct, 2)}%` }}
            />
            {data.length <= 14 && (
              <span className="text-[9px] text-surface-400 rotate-45 origin-left translate-x-1 whitespace-nowrap">
                {dateStr}
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ReportsPage() {
  const [data, setData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [range, setRange] = useState('30')

  const fetchData = useCallback(async (r: string) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/reports?range=${r}`)
      if (!res.ok) { setError('خطا در دریافت گزارش'); return }
      setData(await res.json() as ReportData)
    } catch {
      setError('خطا در ارتباط با سرور')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void fetchData(range) }, [fetchData, range])

  const s = data?.stats

  const kpis = [
    {
      label: 'درآمد کل',
      value: s ? fmtRev(Number(s.totalRevenue)) : '—',
      sub: 'از سفارشات پرداخت شده',
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      label: 'کل سفارشات',
      value: s ? Number(s.totalOrders).toLocaleString('fa-IR') : '—',
      sub: `${s ? Number(s.paidOrders).toLocaleString('fa-IR') : '—'} پرداخت شده`,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'میانگین سفارش',
      value: s ? fmtRev(Number(s.avgOrderValue)) : '—',
      sub: 'از سفارشات پرداخت شده',
      color: 'text-violet-600',
      bg: 'bg-violet-50',
    },
    {
      label: 'کل تخفیف',
      value: s ? fmtRev(Number(s.totalDiscount)) : '—',
      sub: 'اعمال‌شده با کوپن',
      color: 'text-orange-600',
      bg: 'bg-orange-50',
    },
  ]

  return (
    <div className="flex-1 overflow-y-auto">
      <header className="bg-white border-b border-surface-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-black text-surface-900">گزارش فروش</h1>
            <p className="text-xs text-surface-400 mt-0.5">تحلیل درآمد و سفارشات</p>
          </div>
          <div className="flex gap-1 bg-surface-100 rounded-xl p-1">
            {RANGE_OPTIONS.map((o) => (
              <button
                key={o.value}
                onClick={() => setRange(o.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  range === o.value
                    ? 'bg-white text-surface-900 shadow-sm'
                    : 'text-surface-500 hover:text-surface-700'
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="p-6 space-y-6">
        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm text-center">
            {error}
            <button onClick={() => fetchData(range)} className="ms-3 underline">تلاش مجدد</button>
          </div>
        ) : null}

        {/* KPI cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((k) => (
            <div key={k.label} className="bg-white rounded-2xl border border-surface-200 p-5 shadow-sm">
              <p className="text-xs text-surface-400 font-semibold">{k.label}</p>
              <p className={`text-2xl font-black mt-1 ${k.color} ${loading ? 'animate-pulse' : ''}`}>
                {k.value}
              </p>
              <p className="text-xs text-surface-400 mt-1">{k.sub}</p>
            </div>
          ))}
        </div>

        {/* Revenue chart */}
        <div className="bg-white rounded-2xl border border-surface-200 p-6 shadow-sm">
          <h2 className="text-sm font-bold text-surface-700 mb-4">درآمد روزانه (ریال)</h2>
          {loading
            ? <div className="h-48 flex items-center justify-center"><div className="w-6 h-6 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>
            : <BarChart data={data?.dailyRevenue ?? []} />
          }
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Top products */}
          <div className="bg-white rounded-2xl border border-surface-200 p-6 shadow-sm">
            <h2 className="text-sm font-bold text-surface-700 mb-4">پرفروش‌ترین محصولات</h2>
            {loading ? (
              <div className="space-y-3">
                {[1,2,3,4,5].map(i => (
                  <div key={i} className="h-8 bg-surface-100 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : !data?.topProducts.length ? (
              <p className="text-surface-400 text-sm text-center py-8">داده‌ای وجود ندارد</p>
            ) : (
              <div className="space-y-3">
                {data.topProducts.map((p, i) => {
                  const maxRev = Math.max(...data.topProducts.map(x => Number(x.totalRev)))
                  const pct = maxRev > 0 ? (Number(p.totalRev) / maxRev) * 100 : 0
                  return (
                    <div key={p.productId ?? i}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-surface-700 font-semibold truncate max-w-[60%]">
                          <span className="text-surface-400 me-1">{(i + 1).toLocaleString('fa-IR')}.</span>
                          {p.productName || '—'}
                        </span>
                        <span className="text-surface-500">
                          {Number(p.totalQty).toLocaleString('fa-IR')} عدد · {fmtRev(Number(p.totalRev))}
                        </span>
                      </div>
                      <div className="h-1.5 bg-surface-100 rounded-full overflow-hidden">
                        <div className="h-full bg-brand-500 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Status & payment breakdown */}
          <div className="space-y-5">
            {/* Status */}
            <div className="bg-white rounded-2xl border border-surface-200 p-6 shadow-sm">
              <h2 className="text-sm font-bold text-surface-700 mb-4">وضعیت سفارشات</h2>
              {loading ? (
                <div className="space-y-2">
                  {[1,2,3].map(i => <div key={i} className="h-7 bg-surface-100 rounded-lg animate-pulse" />)}
                </div>
              ) : (
                <div className="space-y-2">
                  {(data?.statusBreakdown ?? []).map((item) => {
                    const total = data?.statusBreakdown.reduce((s, x) => s + Number(x.count), 0) ?? 1
                    const pct = (Number(item.count) / total) * 100
                    return (
                      <div key={item.status} className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: STATUS_COLORS[item.status] ?? '#94A3B8' }} />
                        <span className="text-xs text-surface-600 flex-1">{STATUS_LABELS[item.status] ?? item.status}</span>
                        <span className="text-xs font-bold text-surface-900">{Number(item.count).toLocaleString('fa-IR')}</span>
                        <div className="w-20 h-1.5 bg-surface-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: STATUS_COLORS[item.status] ?? '#94A3B8' }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Payment method */}
            <div className="bg-white rounded-2xl border border-surface-200 p-6 shadow-sm">
              <h2 className="text-sm font-bold text-surface-700 mb-4">روش پرداخت</h2>
              {loading ? (
                <div className="space-y-2">
                  {[1,2].map(i => <div key={i} className="h-7 bg-surface-100 rounded-lg animate-pulse" />)}
                </div>
              ) : (
                <div className="space-y-3">
                  {(data?.paymentMethods ?? []).map((item) => (
                    <div key={item.method ?? 'null'} className="flex items-center justify-between">
                      <span className="text-xs text-surface-600">
                        {PAYMENT_LABELS[item.method ?? ''] ?? item.method ?? '—'}
                      </span>
                      <div className="text-end">
                        <span className="text-xs font-bold text-surface-900 block">
                          {Number(item.count).toLocaleString('fa-IR')} سفارش
                        </span>
                        <span className="text-[10px] text-surface-400">{fmtRev(Number(item.rev))}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
