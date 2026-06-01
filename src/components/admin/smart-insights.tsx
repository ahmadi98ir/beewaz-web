'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { toFaDigits, formatPrice } from '@/lib/utils'

interface Insights {
  alerts: { level: 'warning' | 'info' | 'danger'; message: string }[]
  lowStock: { id: string; nameFa: string; stock: number }[]
  pendingOrders: number
  pendingInstallations: number
  sales24h: { count: number; total: number }
}

const LEVEL_STYLE: Record<string, string> = {
  danger: 'bg-red-50 text-red-700 border-red-200',
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
  info: 'bg-blue-50 text-blue-700 border-blue-200',
}

export function SmartInsights() {
  const [data, setData] = useState<Insights | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/insights')
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="bg-white rounded-2xl border border-surface-200 p-5 text-sm text-surface-400">در حال بارگذاری هشدارها...</div>
  }
  if (!data) return null

  return (
    <div className="bg-white rounded-2xl border border-surface-200 p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">🔔</span>
        <h3 className="font-bold text-surface-900 text-sm">هشدارهای هوشمند</h3>
      </div>

      {/* فروش ۲۴ ساعت */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-green-50 rounded-xl p-3">
          <p className="text-xs text-green-600">فروش ۲۴ ساعت اخیر</p>
          <p className="text-lg font-black text-green-700 mt-1">{formatPrice(data.sales24h.total)}</p>
          <p className="text-[11px] text-green-600/70">{toFaDigits(data.sales24h.count)} سفارش</p>
        </div>
        <div className="bg-blue-50 rounded-xl p-3">
          <p className="text-xs text-blue-600">در انتظار رسیدگی</p>
          <p className="text-lg font-black text-blue-700 mt-1">{toFaDigits(data.pendingOrders + data.pendingInstallations)}</p>
          <p className="text-[11px] text-blue-600/70">{toFaDigits(data.pendingOrders)} پرداخت · {toFaDigits(data.pendingInstallations)} نصب</p>
        </div>
      </div>

      {/* هشدارها */}
      {data.alerts.length === 0 ? (
        <p className="text-sm text-surface-400 text-center py-3">✓ همه‌چیز روبراه است</p>
      ) : (
        <div className="space-y-2">
          {data.alerts.map((a, i) => (
            <div key={i} className={`text-xs font-semibold px-3 py-2 rounded-lg border ${LEVEL_STYLE[a.level]}`}>
              {a.message}
            </div>
          ))}
        </div>
      )}

      {/* فهرست موجودی کم */}
      {data.lowStock.length > 0 && (
        <div className="mt-4 pt-4 border-t border-surface-100">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-surface-600">موجودی کم</p>
            <Link href="/admin/inventory" className="text-[11px] text-brand-600 hover:text-brand-700 font-semibold">مدیریت انبار ←</Link>
          </div>
          <div className="space-y-1">
            {data.lowStock.slice(0, 5).map((p) => (
              <div key={p.id} className="flex items-center justify-between text-xs">
                <span className="text-surface-700 truncate">{p.nameFa}</span>
                <span className={`font-bold flex-shrink-0 ms-2 ${p.stock === 0 ? 'text-red-600' : 'text-amber-600'}`}>
                  {p.stock === 0 ? 'ناموجود' : `${toFaDigits(p.stock)} عدد`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
