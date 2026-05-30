'use client'

import { useEffect, useState, useCallback } from 'react'

interface Review {
  id: string
  productId: string
  productName: string | null
  authorName: string
  rating: number
  body: string | null
  approved: boolean
  createdAt: string
}

function Stars({ value }: { value: number }) {
  return (
    <span dir="ltr" className="text-amber-400 text-sm tracking-tight">
      {'★'.repeat(value)}{'☆'.repeat(5 - value)}
    </span>
  )
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fa-IR', { year: 'numeric', month: 'short', day: 'numeric' })
}

export default function AdminReviewsPage() {
  const [tab, setTab] = useState<'pending' | 'all'>('pending')
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)

  const fetchReviews = useCallback(async () => {
    setLoading(true)
    try {
      const url = tab === 'pending' ? '/api/admin/reviews?pending=1' : '/api/admin/reviews'
      const res = await fetch(url)
      const data = await res.json()
      setReviews(data.reviews ?? [])
    } finally {
      setLoading(false)
    }
  }, [tab])

  useEffect(() => { fetchReviews() }, [fetchReviews])

  async function approve(id: string) {
    await fetch(`/api/admin/reviews/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approved: true }),
    })
    if (tab === 'pending') {
      setReviews((prev) => prev.filter((r) => r.id !== id))
    } else {
      setReviews((prev) => prev.map((r) => r.id === id ? { ...r, approved: true } : r))
    }
  }

  async function unapprove(id: string) {
    await fetch(`/api/admin/reviews/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approved: false }),
    })
    setReviews((prev) => prev.map((r) => r.id === id ? { ...r, approved: false } : r))
  }

  async function remove(id: string) {
    if (!confirm('این نظر حذف شود؟')) return
    await fetch(`/api/admin/reviews/${id}`, { method: 'DELETE' })
    setReviews((prev) => prev.filter((r) => r.id !== id))
  }

  const pendingCount = reviews.filter((r) => !r.approved).length

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-black text-surface-900">مدیریت نظرات</h1>
          {tab === 'all' && pendingCount > 0 && (
            <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-semibold">
              {pendingCount} در انتظار تأیید
            </span>
          )}
        </div>

        {/* tabs */}
        <div className="flex gap-2 mb-6">
          {([
            { key: 'pending', label: 'در انتظار تأیید' },
            { key: 'all', label: 'همه نظرات' },
          ] as const).map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                tab === t.key
                  ? 'bg-brand-600 text-white'
                  : 'bg-white border border-surface-200 text-surface-600 hover:bg-surface-50'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center text-surface-400 py-16">در حال بارگذاری...</div>
        ) : reviews.length === 0 ? (
          <div className="text-center text-surface-400 py-16 bg-white rounded-2xl border border-surface-100">
            {tab === 'pending' ? 'نظر در انتظار تأیید وجود ندارد.' : 'هیچ نظری یافت نشد.'}
          </div>
        ) : (
          <div className="space-y-3">
            {reviews.map((r) => (
              <div key={r.id} className="bg-white rounded-2xl border border-surface-100 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap mb-1">
                      <span className="font-bold text-surface-800">{r.authorName}</span>
                      <Stars value={r.rating} />
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        r.approved
                          ? 'bg-green-100 text-green-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {r.approved ? 'تأیید شده' : 'در انتظار'}
                      </span>
                    </div>
                    {r.productName && (
                      <p className="text-xs text-surface-500 mb-2">محصول: {r.productName}</p>
                    )}
                    {r.body ? (
                      <p className="text-sm text-surface-700 leading-relaxed">{r.body}</p>
                    ) : (
                      <p className="text-xs text-surface-400 italic">بدون متن</p>
                    )}
                    <p className="text-xs text-surface-400 mt-2">{formatDate(r.createdAt)}</p>
                  </div>

                  <div className="flex gap-2 flex-shrink-0">
                    {!r.approved ? (
                      <button
                        onClick={() => approve(r.id)}
                        className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700"
                      >
                        تأیید
                      </button>
                    ) : (
                      <button
                        onClick={() => unapprove(r.id)}
                        className="px-3 py-1.5 bg-surface-100 text-surface-600 rounded-lg text-xs font-semibold hover:bg-surface-200"
                      >
                        لغو تأیید
                      </button>
                    )}
                    <button
                      onClick={() => remove(r.id)}
                      className="px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded-lg text-xs font-semibold hover:bg-red-100"
                    >
                      حذف
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
