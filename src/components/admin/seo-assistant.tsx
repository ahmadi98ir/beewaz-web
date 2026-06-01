'use client'

import { useState } from 'react'

interface SeoResult {
  metaTitle: string
  metaDescription: string
  keywords: string[]
}

interface Props {
  type: 'product' | 'article'
  title: string
  description?: string
  category?: string
  /** هنگام پذیرش نتیجه توسط کاربر صدا زده می‌شود */
  onApply?: (result: SeoResult) => void
}

/**
 * دستیار سئو هوشمند — تولید meta title/description و کلمات کلیدی با AI
 * قابل جاسازی در ویرایشگر محصول یا مقاله.
 */
export function SeoAssistant({ type, title, description, category, onApply }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<SeoResult | null>(null)

  async function generate() {
    if (!title.trim()) { setError('ابتدا عنوان را وارد کنید'); return }
    setLoading(true); setError(''); setResult(null)
    try {
      const res = await fetch('/api/admin/seo/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, title, description, category }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'خطا'); return }
      setResult(data as SeoResult)
    } catch {
      setError('خطا در ارتباط با سرور')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-gradient-to-br from-brand-50 to-purple-50 rounded-2xl border border-brand-100 p-4">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">✨</span>
          <h3 className="font-bold text-surface-800 text-sm">دستیار سئو هوشمند</h3>
        </div>
        <button
          type="button"
          onClick={generate}
          disabled={loading}
          className="px-4 py-1.5 rounded-lg text-xs font-bold bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {loading ? 'در حال تولید...' : 'تولید خودکار'}
        </button>
      </div>

      {error && <p className="text-red-600 text-xs bg-red-50 rounded-lg px-3 py-2 mb-2">{error}</p>}

      {result && (
        <div className="space-y-3 text-sm">
          <div>
            <label className="block text-xs font-semibold text-surface-500 mb-1">عنوان متا ({result.metaTitle.length} کاراکتر)</label>
            <div className="bg-white rounded-lg px-3 py-2 border border-surface-200 text-surface-800">{result.metaTitle}</div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-surface-500 mb-1">توضیح متا ({result.metaDescription.length} کاراکتر)</label>
            <div className="bg-white rounded-lg px-3 py-2 border border-surface-200 text-surface-700 text-xs leading-relaxed">{result.metaDescription}</div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-surface-500 mb-1">کلمات کلیدی</label>
            <div className="flex flex-wrap gap-1.5">
              {result.keywords.map((k, i) => (
                <span key={i} className="px-2.5 py-1 rounded-lg bg-white border border-surface-200 text-xs text-surface-600">{k}</span>
              ))}
            </div>
          </div>
          {onApply && (
            <button
              type="button"
              onClick={() => onApply(result)}
              className="w-full py-2 rounded-lg text-sm font-bold bg-green-600 text-white hover:bg-green-700"
            >
              ✓ اعمال روی فیلدها
            </button>
          )}
        </div>
      )}
    </div>
  )
}
