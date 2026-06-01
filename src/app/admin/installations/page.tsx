'use client'

import { useEffect, useState, useCallback } from 'react'
import { toFaDigits } from '@/lib/utils'

interface InstallOrder {
  id: string
  status: string
  shippingAddress: { fullName?: string; phone?: string; province?: string; city?: string; street?: string } | null
  needsInstallation: boolean
  installationNote: string | null
  installedAt: string | null
  createdAt: string
}

export default function InstallationsPage() {
  const [orders, setOrders] = useState<InstallOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'done'>('pending')
  const [editId, setEditId] = useState<string | null>(null)
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    const q = filter === 'pending' ? '?done=false' : filter === 'done' ? '?done=true' : ''
    const res = await fetch(`/api/admin/installations${q}`)
    const data = await res.json()
    setOrders(data.orders ?? [])
    setLoading(false)
  }, [filter])

  useEffect(() => { fetchData() }, [fetchData])

  async function saveReport(orderId: string, completed: boolean) {
    setSaving(true)
    await fetch('/api/admin/installations', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, note, completed }),
    })
    setSaving(false)
    setEditId(null)
    setNote('')
    fetchData()
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <header className="bg-white border-b border-surface-200 px-6 py-4">
        <h1 className="text-lg font-black text-surface-900">سفارش‌های نصب</h1>
        <p className="text-xs text-surface-400 mt-0.5">سفارش‌هایی که نیازمند نصب توسط نصاب هستند</p>
      </header>

      <div className="p-6">
        <div className="flex gap-2 mb-4">
          {([['pending', 'در انتظار نصب'], ['done', 'نصب‌شده'], ['all', 'همه']] as const).map(([k, label]) => (
            <button
              key={k}
              onClick={() => setFilter(k)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-colors ${
                filter === k ? 'bg-brand-600 text-white border-brand-600' : 'bg-white border-surface-200 text-surface-600 hover:bg-surface-50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12 text-surface-400">در حال بارگذاری...</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 text-surface-400 text-sm">سفارشی یافت نشد.</div>
        ) : (
          <div className="space-y-3">
            {orders.map((o) => (
              <div key={o.id} className="bg-white rounded-2xl border border-surface-200 p-4">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <p className="font-bold text-surface-900">{o.shippingAddress?.fullName ?? 'بدون نام'}</p>
                    <p className="text-xs text-surface-500 mt-0.5" dir="ltr">{o.shippingAddress?.phone ?? '—'}</p>
                    <p className="text-xs text-surface-500 mt-1">
                      {[o.shippingAddress?.province, o.shippingAddress?.city, o.shippingAddress?.street].filter(Boolean).join('، ') || '—'}
                    </p>
                    <p className="text-[11px] text-surface-400 mt-1 font-mono">#{toFaDigits(o.id.slice(0, 8))}</p>
                  </div>
                  <div className="text-left">
                    {o.installedAt ? (
                      <span className="inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
                        ✓ نصب شد
                      </span>
                    ) : (
                      <span className="inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                        در انتظار نصب
                      </span>
                    )}
                  </div>
                </div>

                {o.installationNote && (
                  <p className="mt-3 text-sm text-surface-600 bg-surface-50 rounded-lg px-3 py-2">{o.installationNote}</p>
                )}

                {editId === o.id ? (
                  <div className="mt-3 space-y-2">
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="گزارش نصب را وارد کنید..."
                      className="input w-full text-sm min-h-[80px]"
                    />
                    <div className="flex gap-2">
                      <button onClick={() => saveReport(o.id, true)} disabled={saving}
                        className="px-4 py-2 rounded-xl text-sm font-bold bg-green-600 text-white hover:bg-green-700 disabled:opacity-60">
                        ثبت و تکمیل نصب
                      </button>
                      <button onClick={() => saveReport(o.id, false)} disabled={saving}
                        className="px-4 py-2 rounded-xl text-sm font-semibold border border-surface-200 text-surface-600">
                        ذخیره یادداشت
                      </button>
                      <button onClick={() => { setEditId(null); setNote('') }}
                        className="px-4 py-2 rounded-xl text-sm font-semibold text-surface-500">انصراف</button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => { setEditId(o.id); setNote(o.installationNote ?? '') }}
                    className="mt-3 text-sm font-semibold text-brand-600 hover:text-brand-700"
                  >
                    {o.installedAt ? 'ویرایش گزارش' : 'ثبت گزارش نصب'}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
