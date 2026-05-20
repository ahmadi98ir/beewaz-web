'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import Link from 'next/link'

interface Order {
  id: string
  status: string
  totalAmount: string
  paymentMethod: string | null
  trackingCode: string | null
  shippingAddress: { fullName?: string; phone?: string; city?: string } | null
  createdAt: string
  paidAt: string | null
}

interface ApiResponse {
  orders: Order[]
  total: number
  counts: Record<string, number>
}

const STATUS_MAP: Record<string, { label: string; cls: string; dot: string }> = {
  pending:    { label: 'در انتظار پرداخت',   cls: 'bg-amber-50 text-amber-700 border-amber-200',    dot: 'bg-amber-400' },
  paid:       { label: 'پرداخت شده',         cls: 'bg-blue-50 text-blue-700 border-blue-200',       dot: 'bg-blue-400' },
  processing: { label: 'در حال آماده‌سازی', cls: 'bg-violet-50 text-violet-700 border-violet-200', dot: 'bg-violet-400' },
  shipped:    { label: 'ارسال شده',          cls: 'bg-indigo-50 text-indigo-700 border-indigo-200', dot: 'bg-indigo-400' },
  delivered:  { label: 'تحویل داده شده',    cls: 'bg-green-50 text-green-700 border-green-200',    dot: 'bg-green-400' },
  cancelled:  { label: 'لغو شده',           cls: 'bg-red-50 text-red-600 border-red-200',           dot: 'bg-red-400' },
  refunded:   { label: 'مسترد شده',         cls: 'bg-surface-50 text-surface-500 border-surface-200', dot: 'bg-surface-400' },
}

const TABS = [
  { key: 'all', label: 'همه' },
  { key: 'pending', label: 'در انتظار' },
  { key: 'paid', label: 'پرداخت شده' },
  { key: 'processing', label: 'در حال آماده‌سازی' },
  { key: 'shipped', label: 'ارسال شده' },
  { key: 'delivered', label: 'تحویل شده' },
  { key: 'cancelled', label: 'لغو شده' },
]

function OrderBadge({ status }: { status: string }) {
  const cfg = STATUS_MAP[status] ?? STATUS_MAP['pending'] ?? { label: '', cls: '', dot: '' }
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${cfg.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  )
}

function formatPrice(v: string | number) {
  const n = typeof v === 'string' ? parseInt(v) : v
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}K`
  return n.toLocaleString('fa-IR')
}

export default function OrdersPage() {
  const [data, setData] = useState<ApiResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const fetchOrders = useCallback(async (status: string) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ status, limit: '100' })
      const res = await fetch(`/api/admin/orders?${params}`)
      setData(await res.json() as ApiResponse)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchOrders(activeTab) }, [fetchOrders, activeTab])

  const handleStatusChange = async (id: string, status: string) => {
    setUpdatingId(id)
    await fetch(`/api/admin/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    await fetchOrders(activeTab)
    setUpdatingId(null)
  }

  const orders = data?.orders ?? []
  const counts = data?.counts ?? {}

  return (
    <div className="flex-1 overflow-y-auto">
      <header className="bg-white border-b border-surface-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-black text-surface-900">مدیریت سفارشات</h1>
            <p className="text-xs text-surface-400 mt-0.5">{(counts.all ?? 0).toLocaleString('fa-IR')} سفارش</p>
          </div>
          <button
            onClick={() => fetchOrders(activeTab)}
            disabled={loading}
            className="p-2 rounded-xl border border-surface-100 text-surface-400 hover:text-surface-700 hover:bg-surface-50 transition-all"
          >
            <svg viewBox="0 0 20 20" className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="currentColor">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </header>

      <div className="p-6 space-y-5">
        {/* KPI strip */}
        <div className="grid grid-cols-3 sm:grid-cols-7 gap-2">
          {TABS.map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`rounded-xl border px-3 py-2.5 text-center transition-all ${activeTab === tab.key ? 'bg-brand-600 text-white border-brand-600 shadow-sm' : 'bg-white border-surface-100 hover:border-surface-200'}`}>
              <p className={`text-lg font-black ${activeTab === tab.key ? 'text-white' : 'text-surface-900'}`}>
                {(counts[tab.key] ?? 0).toLocaleString('fa-IR')}
              </p>
              <p className={`text-[10px] mt-0.5 leading-tight ${activeTab === tab.key ? 'text-white/80' : 'text-surface-400'}`}>{tab.label}</p>
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-surface-200 overflow-hidden">
          {orders.length === 0 && !loading ? (
            <div className="py-20 text-center text-surface-300">
              <p className="font-semibold text-surface-400">سفارشی یافت نشد</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-surface-50 border-b border-surface-100">
                  <tr>
                    {['شناسه','مشتری','شهر','مبلغ','روش پرداخت','وضعیت','تاریخ','عملیات'].map(h => (
                      <th key={h} className="text-start px-5 py-3 text-xs font-bold text-surface-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-50">
                  {orders.map((order) => (
                    <tr key={order.id} className={`hover:bg-surface-50 transition-colors ${updatingId === order.id ? 'opacity-50' : ''}`}>
                      <td className="px-5 py-3.5 font-mono text-xs text-surface-500">
                        #{order.id.slice(0,8).toUpperCase()}
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="font-semibold text-surface-900">{order.shippingAddress?.fullName ?? '—'}</p>
                        <p className="text-xs text-surface-400 font-mono">{order.shippingAddress?.phone ?? ''}</p>
                      </td>
                      <td className="px-5 py-3.5 text-surface-500">{order.shippingAddress?.city ?? '—'}</td>
                      <td className="px-5 py-3.5 font-bold text-surface-900">
                        {formatPrice(order.totalAmount)} <span className="text-xs font-normal text-surface-400">ت</span>
                      </td>
                      <td className="px-5 py-3.5 text-surface-500 text-xs">
                        {{ online:'آنلاین', card_to_card:'کارت به کارت', cash_on_delivery:'پرداخت درجا', installment:'اقساطی' }[order.paymentMethod ?? ''] ?? '—'}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <OrderBadge status={order.status} />
                          {/* Quick status dropdown */}
                          <div className="relative group">
                            <button className="p-1 rounded-lg hover:bg-surface-100 text-surface-300 hover:text-surface-600">
                              <svg viewBox="0 0 20 20" className="w-3.5 h-3.5" fill="currentColor">
                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                              </svg>
                            </button>
                            <div className="absolute right-0 top-7 bg-white border border-surface-200 rounded-xl shadow-lg py-1 min-w-[160px] z-10 hidden group-hover:block">
                              {Object.entries(STATUS_MAP).map(([s, cfg]) => (
                                <button key={s} onClick={() => handleStatusChange(order.id, s)}
                                  className={`w-full text-start px-3 py-2 text-xs hover:bg-surface-50 flex items-center gap-2 ${s === order.status ? 'font-bold' : ''}`}>
                                  <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />{cfg.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-surface-400 text-xs">
                        {new Intl.DateTimeFormat('fa-IR', { month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' }).format(new Date(order.createdAt))}
                      </td>
                      <td className="px-5 py-3.5">
                        <Link href={`/admin/orders/${order.id}`}
                          className="p-1.5 rounded-lg hover:bg-brand-50 text-surface-400 hover:text-brand-600 transition-colors inline-flex">
                          <svg viewBox="0 0 20 20" className="w-4 h-4" fill="currentColor">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                          </svg>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
       