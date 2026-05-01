'use client'

import { useState } from 'react'
import { mockOrders } from '@/lib/mock-admin-data'
import type { AdminOrder } from '@/lib/mock-admin-data'
import { formatPrice } from '@/lib/utils'
import { SearchIcon } from '@/components/ui/icons'

type Status = AdminOrder['status'] | 'all'

const statusConfig: Record<AdminOrder['status'], { label: string; cls: string }> = {
  pending:    { label: 'در انتظار پرداخت', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  paid:       { label: 'پرداخت شده',       cls: 'bg-blue-50 text-blue-700 border-blue-200' },
  processing: { label: 'در حال آماده‌سازی', cls: 'bg-purple-50 text-purple-700 border-purple-200' },
  shipped:    { label: 'ارسال شده',        cls: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  delivered:  { label: 'تحویل شده',       cls: 'bg-green-50 text-green-700 border-green-200' },
  cancelled:  { label: 'لغو شده',         cls: 'bg-red-50 text-red-700 border-red-200' },
  refunded:   { label: 'بازگشت وجه',     cls: 'bg-surface-100 text-surface-700 border-surface-200' },
}

export default function OrdersPage() {
  const [filter, setFilter] = useState<Status>('all')
  const [search, setSearch] = useState('')
  const [orders, setOrders] = useState(mockOrders)

  const filteredOrders = orders.filter((o) => {
    const matchStatus = filter === 'all' || o.status === filter
    const matchSearch = !search || o.id.includes(search) || o.customerName.includes(search) || o.phone.includes(search)
    return matchStatus && matchSearch
  })

  const totalRevenue = filteredOrders.reduce((s, o) => s + o.totalAmount, 0)

  const updateStatus = (id: string, status: AdminOrder['status']) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o))
  }

  const tabs: { key: Status; label: string }[] = [
    { key: 'all', label: 'همه' },
    { key: 'pending', label: 'در انتظار' },
    { key: 'processing', label: 'در حال پردازش' },
    { key: 'shipped', label: 'ارسال شده' },
    { key: 'delivered', label: 'تحویل شده' },
  ]

  return (
    <div className="flex-1 overflow-y-auto">
      <header className="bg-white border-b border-surface-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-black text-surface-900">مدیریت سفارشات</h1>
          <p className="text-xs text-surface-400 mt-0.5">{orders.length} سفارش ثبت شده</p>
        </div>
        <div className="text-end">
          <p className="text-xs text-surface-400">جمع درآمد (فیلترشده)</p>
          <p className="font-black text-surface-900">{formatPrice(totalRevenue)}</p>
        </div>
      </header>

      <div className="p-6">
        <div className="bg-white rounded-2xl border border-surface-200 overflow-hidden">
          {/* Controls */}
          <div className="flex items-center justify-between gap-4 p-4 border-b border-surface-100 flex-wrap">
            <div className="flex gap-0.5 bg-surface-50 p-1 rounded-xl flex-wrap">
              {tabs.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${filter === key ? 'bg-white text-surface-900 shadow-sm border border-surface-200' : 'text-surface-500 hover:text-surface-700'}`}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="relative">
              <SearchIcon size={14} className="absolute start-3 top-1/2 -translate-y-1/2 text-surface-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="جستجوی سفارش..."
                className="ps-9 pe-4 py-2 text-sm border border-surface-200 rounded-xl w-48 focus:outline-none focus:border-brand-600 transition-colors"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface-50 text-surface-500 text-xs">
                <tr>
                  {['شناسه', 'مشتری', 'شهر', 'تعداد کالا', 'مبلغ کل', 'وضعیت', 'تاریخ', 'تغییر وضعیت'].map(h => (
                    <th key={h} className="text-start px-5 py-3 font-semibold whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {filteredOrders.map((order) => {
                  const sc = statusConfig[order.status]
                  return (
                    <tr key={order.id} className="hover:bg-surface-50 transition-colors">
                      <td className="px-5 py-4 font-mono text-xs font-bold text-surface-600">{order.id}</td>
                      <td className="px-5 py-4">
                        <p className="font-semibold text-surface-900">{order.customerName}</p>
                        <p className="text-xs font-mono text-surface-400" dir="ltr">{order.phone}</p>
                      </td>
                      <td className="px-5 py-4 text-surface-600">{order.city}</td>
                      <td className="px-5 py-4 text-center">
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-surface-100 text-surface-700 text-xs font-bold">
                          {order.itemCount}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-bold text-surface-900 whitespace-nowrap">{formatPrice(order.totalAmount)}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold border ${sc.cls}`}>
                          {sc.label}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-surface-400 text-xs whitespace-nowrap">
                        {new Intl.DateTimeFormat('fa-IR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(order.createdAt))}
                      </td>
                      <td className="px-5 py-4">
                        <select
                          value={order.status}
                          onChange={e => updateStatus(order.id, e.target.value as AdminOrder['status'])}
                          className="text-xs border border-surface-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-brand-600 bg-white w-36"
                        >
                          {Object.entries(statusConfig).map(([val, { label }]) => (
                            <option key={val} value={val}>{label}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {filteredOrders.length === 0 && (
              <div className="text-center py-12 text-surface-400 text-sm">سفارشی یافت نشد.</div>
            )}
          </div>

          {/* Footer summary */}
          <div className="px-5 py-3 border-t border-surface-100 bg-surface-50 flex items-center justify-between text-sm">
            <span className="text-surface-500">{filteredOrders.length} سفارش</span>
            <span className="font-bold text-surface-900">{formatPrice(totalRevenue)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
