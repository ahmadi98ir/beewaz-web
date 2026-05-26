'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'

interface Coupon {
  id: string
  code: string
  type: 'percentage' | 'fixed'
  value: string
  minOrderAmount: string | null
  maxDiscountAmount: string | null
  usageLimit: number | null
  usageCount: number
  perUserLimit: number | null
  expiresAt: string | null
  active: boolean
  createdAt: string
}

function fmtNum(v: string | null) {
  if (!v) return '—'
  return Math.floor(Number(v) / 10).toLocaleString('fa-IR') + ' ت'
}

function CouponBadge({ active, expired }: { active: boolean; expired: boolean }) {
  if (!active)  return <span className="inline-flex px-2 py-0.5 rounded-md text-xs font-semibold bg-surface-100 text-surface-500">غیرفعال</span>
  if (expired)  return <span className="inline-flex px-2 py-0.5 rounded-md text-xs font-semibold bg-red-50 text-red-600 border border-red-200">منقضی</span>
  return <span className="inline-flex px-2 py-0.5 rounded-md text-xs font-semibold bg-green-50 text-green-700 border border-green-200">فعال</span>
}

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const filtered = search.trim()
    ? coupons.filter(c => c.code.toLowerCase().includes(search.trim().toLowerCase()))
    : coupons

  const fetchCoupons = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/coupons')
      if (!res.ok) { setError('خطا در دریافت کوپن‌ها'); return }
      const data = await res.json() as { coupons: Coupon[] }
      setCoupons(data.coupons)
    } catch { setError('خطا در ارتباط با سرور') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { void fetchCoupons() }, [fetchCoupons])

  const handleToggle = async (id: string, active: boolean) => {
    await fetch(`/api/admin/coupons/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !active }),
    })
    void fetchCoupons()
  }

  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`آیا مطمئن هستید که می‌خواهید کوپن "${code}" را حذف کنید؟`)) return
    setDeletingId(id)
    await fetch(`/api/admin/coupons/${id}`, { method: 'DELETE' })
    setDeletingId(null)
    void fetchCoupons()
  }

  const now = new Date()

  return (
    <div className="flex-1 overflow-y-auto">
      <header className="bg-white border-b border-surface-200 px-6 py-4">
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0">
            <h1 className="text-lg font-black text-surface-900">مدیریت کوپن‌ها</h1>
            <p className="text-xs text-surface-400 mt-0.5">{filtered.length.toLocaleString('fa-IR')} / {coupons.length.toLocaleString('fa-IR')} کوپن</p>
          </div>
          <div className="flex-1 max-w-xs relative">
            <svg viewBox="0 0 20 20" className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400 pointer-events-none" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="جستجو کد تخفیف..."
              className="w-full pr-9 pl-3 py-2 text-sm border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-300 bg-surface-50 focus:bg-white transition-colors font-mono"
            />
          </div>
          <Link
            href="/admin/coupons/new"
            className="ms-auto inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 transition-colors shadow-sm flex-shrink-0"
          >
            <svg viewBox="0 0 20 20" className="w-4 h-4" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            کوپن جدید
          </Link>
        </div>
      </header>

      <div className="p-6">
        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm text-center">
            {error}
            <button onClick={fetchCoupons} className="ms-3 underline">تلاش مجدد</button>
          </div>
        ) : loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : coupons.length === 0 ? (
          <div className="text-center py-20 text-surface-400">
            <p className="font-semibold text-surface-500 mb-2">هنوز کوپنی ایجاد نشده</p>
            <Link href="/admin/coupons/new" className="text-brand-600 text-sm hover:underline">ایجاد اولین کوپن</Link>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-surface-400">
            <p className="font-semibold text-surface-500 mb-2">کوپنی با این کد یافت نشد</p>
            <button onClick={() => setSearch('')} className="text-brand-600 text-sm hover:underline">پاک کردن جستجو</button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-surface-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-surface-50 border-b border-surface-100">
                  <tr>
                    {['کد','نوع','مقدار','حداقل سفارش','استفاده','انقضا','وضعیت','عملیات'].map(h => (
                      <th key={h} className="text-start px-5 py-3 text-xs font-bold text-surface-500 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-50">
                  {filtered.map((c) => {
                    const expired = c.expiresAt ? new Date(c.expiresAt) < now : false
                    return (
                      <tr key={c.id} className={`hover:bg-surface-50 transition-colors ${deletingId === c.id ? 'opacity-40' : ''}`}>
                        <td className="px-5 py-3.5">
                          <span className="font-mono font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-lg text-xs">
                            {c.code}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-surface-500">
                          {c.type === 'percentage' ? 'درصدی' : 'مقداری'}
                        </td>
                        <td className="px-5 py-3.5 font-bold text-surface-900">
                          {c.type === 'percentage'
                            ? `${Number(c.value).toLocaleString('fa-IR')}٪`
                            : fmtNum(c.value)}
                        </td>
                        <td className="px-5 py-3.5 text-surface-400 text-xs">
                          {fmtNum(c.minOrderAmount)}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="text-surface-700 font-semibold">{c.usageCount.toLocaleString('fa-IR')}</span>
                          {c.usageLimit && (
                            <span className="text-surface-400 text-xs"> / {c.usageLimit.toLocaleString('fa-IR')}</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-xs text-surface-400">
                          {c.expiresAt
                            ? new Intl.DateTimeFormat('fa-IR', { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(c.expiresAt))
                            : 'بدون انقضا'}
                        </td>
                        <td className="px-5 py-3.5">
                          <CouponBadge active={c.active} expired={expired} />
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-1">
                            {/* toggle active */}
                            <button
                              onClick={() => handleToggle(c.id, c.active)}
                              title={c.active ? 'غیرفعال کن' : 'فعال کن'}
                              className="p-1.5 rounded-lg hover:bg-surface-100 text-surface-400 hover:text-surface-700 transition-colors"
                            >
                              <svg viewBox="0 0 20 20" className="w-4 h-4" fill="currentColor">
                                {c.active
                                  ? <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                  : <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                }
                              </svg>
                            </button>
                            {/* edit */}
                            <Link
                              href={`/admin/coupons/${c.id}`}
                              className="p-1.5 rounded-lg hover:bg-brand-50 text-surface-400 hover:text-brand-600 transition-colors"
                            >
                              <svg viewBox="0 0 20 20" className="w-4 h-4" fill="currentColor">
                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                              </svg>
                            </Link>
                            {/* delete */}
                            <button
                              onClick={() => handleDelete(c.id, c.code)}
                              className="p-1.5 rounded-lg hover:bg-red-50 text-surface-400 hover:text-red-600 transition-colors"
                            >
                              <svg viewBox="0 0 20 20" className="w-4 h-4" fill="currentColor">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
