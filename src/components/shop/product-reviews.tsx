'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { toFaDigits } from '@/lib/utils'

interface Review {
  id: string
  authorName: string
  rating: number
  body: string | null
  createdAt: string
}

function StarRow({ value, onChange, size = 24 }: { value: number; onChange?: (v: number) => void; size?: number }) {
  const [hovered, setHovered] = useState(0)
  const display = onChange ? (hovered || value) : value
  return (
    <div className="flex gap-0.5" dir="ltr">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type={onChange ? 'button' : undefined}
          onClick={() => onChange?.(s)}
          onMouseEnter={() => onChange && setHovered(s)}
          onMouseLeave={() => onChange && setHovered(0)}
          className={onChange ? 'cursor-pointer' : 'cursor-default'}
          style={{ fontSize: size, lineHeight: 1, background: 'none', border: 'none', padding: 0 }}
          aria-label={`${s} ستاره`}
        >
          <span style={{ color: s <= display ? '#f59e0b' : '#d1d5db' }}>★</span>
        </button>
      ))}
    </div>
  )
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' })
}

export function ProductReviews({ slug, ratingAvg, ratingCount }: { slug: string; ratingAvg?: string | null; ratingCount?: number }) {
  const { data: session } = useSession()
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [rating, setRating] = useState(0)
  const [body, setBody] = useState('')
  const [authorName, setAuthorName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const fetchReviews = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/products/${slug}/reviews`)
      const data = await res.json()
      setReviews(data.reviews ?? [])
    } finally {
      setLoading(false)
    }
  }, [slug])

  useEffect(() => { fetchReviews() }, [fetchReviews])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!rating) { setError('لطفاً امتیاز را انتخاب کنید'); return }
    const name = session?.user?.name ?? authorName.trim()
    if (!name) { setError('نام الزامی است'); return }
    setSubmitting(true)
    try {
      const res = await fetch(`/api/products/${slug}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, body: body.trim() || undefined, authorName: name }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'خطا'); return }
      setSubmitted(true)
    } finally {
      setSubmitting(false)
    }
  }

  const avg = ratingAvg ? parseFloat(ratingAvg) : 0
  const count = ratingCount ?? 0

  return (
    <div className="space-y-6">
      {/* summary */}
      {count > 0 && (
        <div className="flex items-center gap-4 p-4 bg-amber-50 rounded-2xl border border-amber-100">
          <div className="text-center">
            <div className="text-4xl font-black text-amber-500">{toFaDigits(avg.toFixed(1))}</div>
            <StarRow value={Math.round(avg)} size={20} />
            <div className="text-xs text-surface-500 mt-1">{toFaDigits(count)} نظر</div>
          </div>
        </div>
      )}

      {/* review list */}
      {loading ? (
        <p className="text-sm text-surface-400">در حال بارگذاری...</p>
      ) : reviews.length === 0 ? (
        <p className="text-sm text-surface-400">هنوز نظری ثبت نشده است. اولین نفر باشید!</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r.id} className="p-4 rounded-2xl border border-surface-100 bg-white">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-surface-800">{r.authorName}</span>
                  <StarRow value={r.rating} size={16} />
                </div>
                <span className="text-xs text-surface-400">{formatDate(r.createdAt)}</span>
              </div>
              {r.body && <p className="text-sm text-surface-600 leading-relaxed">{r.body}</p>}
            </div>
          ))}
        </div>
      )}

      {/* form */}
      <div className="border-t border-surface-100 pt-6">
        <h3 className="font-bold text-surface-800 mb-4">ثبت نظر</h3>
        {submitted ? (
          <div className="p-4 rounded-2xl bg-green-50 border border-green-200 text-green-700 text-sm">
            نظر شما ثبت شد و پس از تأیید نمایش داده می‌شود.
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            {!session?.user?.name && (
              <input
                type="text"
                placeholder="نام شما *"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="w-full border border-surface-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-brand-400"
              />
            )}
            <div>
              <p className="text-sm text-surface-600 mb-1">امتیاز *</p>
              <StarRow value={rating} onChange={setRating} size={32} />
            </div>
            <textarea
              placeholder="نظر شما (اختیاری)"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={3}
              className="w-full border border-surface-200 rounded-xl px-4 py-2 text-sm resize-none focus:outline-none focus:border-brand-400"
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-brand-600 text-white rounded-xl text-sm font-semibold hover:bg-brand-700 disabled:opacity-50"
            >
              {submitting ? 'در حال ارسال...' : 'ثبت نظر'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
