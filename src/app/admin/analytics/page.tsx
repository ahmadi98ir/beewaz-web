'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Metadata } from 'next'

// ── Types ─────────────────────────────────────────────────────────────────────

interface AnalyticsData {
  period: { days: number; since: string }
  summary: { totalViews: number; uniqueVisitors: number }
  topPages: { path: string; views: number }[]
  viewsByDay: { date: string; views: number; unique: number }[]
  deviceBreakdown: { device: string | null; count: number }[]
}

// ── Mini Bar Chart ─────────────────────────────────────────────────────────────

function MiniBarChart({ data }: { data: { date: string; views: number; unique: number }[] }) {
  const max = Math.max(...data.map((d) => d.views), 1)

  return (
    <div className="flex items-end gap-1 h-24 w-full" role="img" aria-label="نمودار بازدید روزانه">
      {data.map((d) => {
        const heightPct = Math.max((d.views / max) * 100, 4)
        const dateLabel = new Intl.DateTimeFormat('fa-IR', { month: 'short', day: 'numeric' }).format(new Date(d.date))
        return (
          <div
            key={d.date}
            className="relative flex-1 flex flex-col justify-end group"
            title={`${dateLabel}: ${d.views.toLocaleString('fa-IR')} بازدید`}
          >
            <div
              className="w-full rounded-t bg-brand-400 group-hover:bg-brand-600 transition-colors"
              style={{ height: `${heightPct}%` }}
            />
            {/* Tooltip */}
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col items-center z-20 pointer-events-none">
              <div className="bg-surface-900 text-white text-xs rounded-lg px-2 py-1 whitespace-nowrap shadow-lg">
                <span className="font-bold">{d.views.toLocaleString('fa-IR')}</span>
                <span className="text-white/60 mr-1">بازدید</span>
              </div>
              <div className="w-2 h-2 bg-surface-900 rotate-45 -mt-1" />
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const [days, setDays] = useState(30)
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/admin/analytics?days=${days}`)
      if (!res.ok) throw new Error('خطا در دریافت داده')
      const json = await res.json() as AnalyticsData
      setData(json)
    } catch {
      setError('داده‌ها بارگذاری نشد')
    } finally {
      setLoading(false)
    }
  }, [days])

  useEffect(() => { void fetchData() }, [fetchData])

  const deviceLabels: Record<string, string> = {
    mobile: '📱 موبایل',
    desktop: '🖥️ دسکتاپ',
    tablet: '📟 تبلت',
  }
  const deviceColors: Record<string, string> = {
    mobile: 'bg-brand-400',
    desktop: 'bg-blue-400',
    tablet: 'bg-purple-400',
  }

  const totalDevices = data?.deviceBreakdown.reduce((s, d) => s + d.count, 0) ?? 1

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <header className="bg-white border-b border-surface-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div>
          <h1 className="text-lg font-black text-surface-900">آمار بازدید</h1>
          <p className="text-xs text-surface-400 mt-0.5">تحلیل ترافیک سایت</p>
        </div>
        {/* Period Selector */}
        <div className="flex items-center gap-2 bg-surface-50 rounded-xl p-1 border border-surface-100">
          {[7, 14, 30, 90].map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDays(d)}
              className={[
                'px-3 py-1.5 rounded-lg text-sm font-semibold transition-all',
                days === d
                  ? 'bg-white shadow text-brand-700 border border-surface-200'
                  : 'text-surface-500 hover:text-surface-800',
              ].join(' ')}
            >
              {d} روز
            </button>
          ))}
        </div>
      </header>

      <div className="p-6 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-700 text-sm">
            {error}
            <button type="button" onClick={fetchData} className="mr-3 underline">تلاش مجدد</button>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'کل بازدیدها',       value: data?.summary.totalViews,     color: 'brand',  suffix: '' },
            { label: 'بازدیدکنندگان یکتا', value: data?.summary.uniqueVisitors, color: 'blue',   suffix: '' },
            { label: 'میانگین روزانه',      value: data ? Math.round(data.summary.totalViews / days) : undefined, color: 'green', suffix: '' },
            { label: 'دوره انتخابی',        value: days, color: 'amber', suffix: ' روز' },
          ].map((card) => (
            <div key={card.label} className="bg-white rounded-2xl border border-surface-100 p-5">
              <p className="text-xs text-surface-400 mb-2">{card.label}</p>
              {loading ? (
                <div className="h-8 w-16 bg-surface-100 rounded animate-pulse" />
              ) : (
                <p className="text-2xl font-black text-surface-900">
                  {(card.value ?? 0).toLocaleString('fa-IR')}{card.suffix}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Daily Chart */}
        <div className="bg-white rounded-2xl border border-surface-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-surface-900">بازدید روزانه</h3>
            <span className="text-xs text-surface-400 bg-surface-50 px-2.5 py-1 rounded-full border border-surface-100">
              {days} روز گذشته
            </span>
          </div>
          {loading ? (
            <div className="h-24 bg-surface-50 rounded-xl animate-pulse" />
          ) : data && data.viewsByDay.length > 0 ? (
            <>
              <MiniBarChart data={data.viewsByDay} />
              {/* X-axis labels — فقط اول و آخر */}
              <div className="flex justify-between mt-2 text-xs text-surface-400">
                <span>
                  {data.viewsByDay[0]
                    ? new Intl.DateTimeFormat('fa-IR', { month: 'short', day: 'numeric' }).format(new Date(data.viewsByDay[0]!.date))
                    : ''}
                </span>
                <span>
                  {data.viewsByDay[data.viewsByDay.length - 1]
                    ? new Intl.DateTimeFormat('fa-IR', { month: 'short', day: 'numeric' }).format(new Date(data.viewsByDay[data.viewsByDay.length - 1]!.date))
                    : ''}
                </span>
              </div>
            </>
          ) : (
            <p className="text-sm text-surface-400 text-center py-6">هنوز داده‌ای ثبت نشده</p>
          )}
        </div>

        {/* Top Pages + Device Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Top Pages */}
          <div className="bg-white rounded-2xl border border-surface-100 p-6">
            <h3 className="font-bold text-surface-900 mb-4">صفحات پربازدید</h3>
            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-6 bg-surface-50 rounded animate-pulse" />
                ))}
              </div>
            ) : data && data.topPages.length > 0 ? (
              <div className="space-y-3">
                {data.topPages.map((p, i) => {
                  const maxViews = data.topPages[0]?.views ?? 1
                  return (
                    <div key={p.path} className="flex items-center gap-3">
                      <span className="w-5 text-xs text-surface-400 text-center flex-shrink-0 font-bold">
                        {(i + 1).toLocaleString('fa-IR')}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-mono text-surface-700 truncate" dir="ltr">{p.path}</span>
                          <span className="text-xs font-bold text-surface-900 flex-shrink-0 ms-2">
                            {p.views.toLocaleString('fa-IR')}
                          </span>
                        </div>
                        <div className="h-1.5 bg-surface-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-brand-400"
                            style={{ width: `${Math.round((p.views / maxViews) * 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-sm text-surface-400 text-center py-6">داده‌ای موجود نیست</p>
            )}
          </div>

          {/* Device Breakdown */}
          <div className="bg-white rounded-2xl border border-surface-100 p-6">
            <h3 className="font-bold text-surface-900 mb-4">تفکیک دستگاه</h3>
            {loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-6 bg-surface-50 rounded animate-pulse" />
                ))}
              </div>
            ) : data && data.deviceBreakdown.length > 0 ? (
              <div className="space-y-4">
                {data.deviceBreakdown.map((d) => {
                  const key = d.device ?? 'desktop'
                  const pct = Math.round((d.count / totalDevices) * 100)
                  return (
                    <div key={key}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm text-surface-700">{deviceLabels[key] ?? key}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-surface-900">{d.count.toLocaleString('fa-IR')}</span>
                          <span className="text-xs text-surface-400">({pct}٪)</span>
                        </div>
                      </div>
                      <div className="h-2.5 bg-surface-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${deviceColors[key] ?? 'bg-surface-400'} transition-all duration-500`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-sm text-surface-400 text-center py-6">داده‌ای موجود نیست</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}