'use client'

import { useState } from 'react'
import { SeoAssistant } from '@/components/admin/seo-assistant'

export default function SeoToolPage() {
  const [type, setType] = useState<'product' | 'article'>('product')
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')

  return (
    <div className="flex-1 overflow-y-auto">
      <header className="bg-white border-b border-surface-200 px-6 py-4">
        <h1 className="text-lg font-black text-surface-900">دستیار سئو هوشمند</h1>
        <p className="text-xs text-surface-400 mt-0.5">تولید عنوان، توضیح متا و کلمات کلیدی با هوش مصنوعی</p>
      </header>

      <div className="p-6 max-w-2xl mx-auto space-y-5">
        <div className="bg-white rounded-2xl border border-surface-200 p-6 space-y-4">
          <div className="flex gap-2">
            {([['product', 'محصول'], ['article', 'مقاله']] as const).map(([k, label]) => (
              <button
                key={k}
                onClick={() => setType(k)}
                className={`flex-1 px-4 py-2 rounded-xl text-sm font-semibold border transition-colors ${
                  type === k ? 'bg-brand-600 text-white border-brand-600' : 'bg-white border-surface-200 text-surface-600'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div>
            <label className="block text-sm font-semibold text-surface-700 mb-1.5">عنوان <span className="text-red-500">*</span></label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="input w-full" placeholder="عنوان محصول یا مقاله" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-surface-700 mb-1.5">دسته‌بندی</label>
            <input value={category} onChange={(e) => setCategory(e.target.value)} className="input w-full" placeholder="اختیاری" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-surface-700 mb-1.5">توضیحات</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="input w-full min-h-[80px]" placeholder="توضیح کوتاه برای کمک به تولید بهتر (اختیاری)" />
          </div>
        </div>

        <SeoAssistant type={type} title={title} description={description} category={category} />
      </div>
    </div>
  )
}
