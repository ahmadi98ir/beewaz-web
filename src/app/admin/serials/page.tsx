'use client'

import { useState, useEffect, useCallback } from 'react'
import { toFaDigits } from '@/lib/utils'

interface SerialRow {
  id: string
  serialNumber: string
  status: 'unregistered' | 'active' | 'expired'
  generatedAt: string
  productName: string | null
}

interface ProductOption {
  id: string
  nameFa: string
}

const STATUS_MAP = {
  unregistered: { label: 'ثبت نشده', cls: 'bg-surface-50 text-surface-500 border-surface-200' },
  active:       { label: 'فعال',      cls: 'bg-green-50 text-green-700 border-green-200' },
  expired:      { label: 'منقضی',    cls: 'bg-red-50 text-red-600 border-red-200' },
}

function fdate(d: string) {
  return new Intl.DateTimeFormat('fa-IR', { dateStyle: 'short' }).format(new Date(d))
}

export default function SerialsAdminPage() {
  const [serials, setSerials] = useState<SerialRow[]>([])
  const [products, setProducts] = useState<ProductOption[]>([])
  const [loading, setLoading] = useState(true)
  const [bulkText, setBulkText] = useState('')
  const [selectedProduct, setSelectedProduct] = useState('')
  const [adding, setAdding] = useState(false)
  const [toast, setToast] = useState('')
  const [search, setSearch] = useState('')

  const fetchSerials = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/serials')
      const j = await res.json() as { serials: SerialRow[] }
      setSerials(j.serials ?? [])
    } finally { setLoading(false) }
  }, [])

  const fetchProducts = useCallback(async () => {
    const res = await fetch('/api/admin/products?limit=200&status=active')
    const j = await res.json() as { products?: ProductOption[] }
    setProducts(j.products ?? [])
  }, [])

  useEffect(() => { void fetchSerials(); void fetchProducts() }, [fetchSerials, fetchProducts])

  const handleBulkAdd = async () => {
    const lines = bulkText.split('\n').map(s => s.trim()).filter(Boolean)
    if (!lines.length) return
    setAdding(true)
    const res = await fetch('/api/admin/serials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ serials: lines, productId: selectedProduct || undefined }),
    })
    const j = await res.json() as { ok?: boolean; count?: number; error?: string }
    setAdding(false)
    if (j.ok) {
      setToast(`${toFaDigits(j.count ?? 0)} سریال اضافه شد`)
      setBulkText('')
      void fetchSerials()
    } else {
      setToast(j.error ?? 'خطا')
    }
    setTimeout(() => setToast(''), 3000)
  }

  const handleExport = () => {
    const csv = ['سریال,وضعیت,محصول,تاریخ']
      .concat(serials.map(s => `${s.serialNumber},${STATUS_MAP[s.status]?.label ?? s.status},${s.productName ?? ''},${fdate(s.generatedAt)}`))
      .join('\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'serials.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  const filtered = search
    ? serials.filter(s => s.serialNumber.includes(search.toUpperCase()) || (s.productName ?? '').includes(search))
    : serials

  const stats = {
    total: serials.length,
    unregistered: serials.filter(s => s.status === 'unregistered').length,
    active: serials.filter(s => s.status === 'active').length,
    expired: serials.filter(s => s.status === 'expired').length,
  }

  return (
    <div className="flex-1 overflow-y-auto" dir="rtl">
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-green-600 text-white px-5 py-3 rounded-2xl shadow-xl text-sm font-semibold">
          ✅ {toast}
        </div>
      )}

      <header className="bg-white border-b border-surface-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-black text-surface-900">مدیریت شماره سریال و گارانتی</h1>
          <p className="text-xs text-surface-400 mt-0.5">ثبت سریال‌های محصولات و پیگیری وضعیت گارانتی</p>
        </div>
        <button onClick={handleExport} className="btn btn-outline text-sm py-2.5 px-4">
          ⬇ خروجی CSV
        </button>
      </header>

      <div className="p-6 max-w-6xl mx-auto space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'کل سریال‌ها', value: stats.total, cls: 'text-surface-900' },
            { label: 'ثبت نشده', value: stats.unregistered, cls: 'text-surface-500' },
            { label: 'فعال', value: stats.active, cls: 'text-green-700' },
            { label: 'منقضی', value: stats.expired, cls: 'text-red-600' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-surface-200 p-4 text-center">
              <p className={`text-2xl font-black ${s.cls}`}>{toFaDigits(s.value)}</p>
              <p className="text-xs text-surface-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Bulk Add */}
          <div className="bg-white rounded-2xl border border-surface-200 p-5 space-y-4">
            <h2 className="font-bold text-surface-900">افزودن سریال جدید</h2>
            <div>
              <label className="block text-xs font-semibold text-surface-500 mb-1.5">محصول (اختیاری)</label>
              <select
                value={selectedProduct}
                onChange={e => setSelectedProduct(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-300"
              >
                <option value="">— بدون محصول مشخص —</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.nameFa}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-surface-500 mb-1.5">
                شماره سریال‌ها (هر سریال در یک خط)
              </label>
              <textarea
                value={bulkText}
                onChange={e => setBulkText(e.target.value)}
                rows={8}
                placeholder={'BW-2024-00001\nBW-2024-00002\n...'}
                className="w-full px-3 py-2.5 text-xs font-mono border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-300 resize-none"
                dir="ltr"
              />
              <p className="text-xs text-surface-400 mt-1">
                {toFaDigits(bulkText.split('\n').filter(s => s.trim()).length)} سریال آماده افزودن
              </p>
            </div>
            <button
              onClick={() => void handleBulkAdd()}
              disabled={adding || !bulkText.trim()}
              className="w-full btn btn-primary text-sm py-2.5 disabled:opacity-50"
            >
              {adding ? 'در حال افزودن...' : 'افزودن سریال‌ها'}
            </button>
          </div>

          {/* Serials List */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-surface-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-surface-100 flex items-center gap-3">
              <h2 className="font-bold text-surface-900 flex-1">لیست سریال‌ها</h2>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="جستجو..."
                className="px-3 py-2 text-xs border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-300 w-40"
                dir="ltr"
              />
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3 text-surface-300">
                <span className="text-4xl">🔢</span>
                <p className="text-sm">سریالی یافت نشد</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-surface-50 text-xs text-surface-500">
                    <tr>
                      {['شماره سریال', 'محصول', 'وضعیت', 'تاریخ ثبت'].map(h => (
                        <th key={h} className="text-start px-4 py-3 font-semibold">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-50">
                    {filtered.slice(0, 200).map(s => {
                      const sc = STATUS_MAP[s.status]
                      return (
                        <tr key={s.id} className="hover:bg-surface-50 transition-colors">
                          <td className="px-4 py-3 font-mono text-xs text-surface-700 font-semibold" dir="ltr">{s.serialNumber}</td>
                          <td className="px-4 py-3 text-surface-600 text-xs">{s.productName ?? <span className="text-surface-300">—</span>}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded-lg border text-xs font-semibold ${sc?.cls ?? ''}`}>{sc?.label ?? s.status}</span>
                          </td>
                          <td className="px-4 py-3 text-surface-400 text-xs">{fdate(s.generatedAt)}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
                {filtered.length > 200 && (
                  <p className="text-center text-xs text-surface-400 py-3">{toFaDigits(filtered.length - 200)} سریال دیگر — از جستجو برای فیلتر استفاده کنید</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
