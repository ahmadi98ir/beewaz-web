'use client'

import { useState } from 'react'

type SortOption = 'newest' | 'price_asc' | 'price_desc' | 'featured'
type ViewMode = 'grid' | 'list'

type Props = {
  total: number
  sort: SortOption
  view: ViewMode
  onSortChange: (sort: SortOption) => void
  onViewChange: (view: ViewMode) => void
}

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'newest', label: 'جدیدترین' },
  { value: 'price_asc', label: 'ارزان‌ترین' },
  { value: 'price_desc', label: 'گران‌ترین' },
  { value: 'featured', label: 'ویژه‌ها' },
]

export function SortBar({ total, sort, view, onSortChange, onViewChange }: Props) {
  return (
    <div className="flex items-center justify-between gap-4 bg-white rounded-2xl border border-surface-200 px-4 py-3">

      {/* نتایج */}
      <p className="text-sm text-surface-500 flex-shrink-0">
        <span className="font-bold text-surface-900">{total}</span> محصول
      </p>

      <div className="flex items-center gap-3 ms-auto">

        {/* مرتب‌سازی */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-surface-500 hidden sm:inline flex-shrink-0">مرتب‌سازی:</span>
          <div className="flex gap-1 bg-surface-50 rounded-xl p-1">
            {sortOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => onSortChange(opt.value)}
                className={[
                  'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150',
                  sort === opt.value
                    ? 'bg-white text-surface-900 shadow-sm border border-surface-200'
                    : 'text-surface-500 hover:text-surface-700',
                ].join(' ')}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* نحوه نمایش — فقط دسکتاپ */}
        <div className="hidden md:flex items-center gap-1 bg-surface-50 rounded-xl p-1">
          <button
            onClick={() => onViewChange('grid')}
            aria-label="نمایش شبکه‌ای"
            aria-pressed={view === 'grid'}
            className={`p-2 rounded-lg transition-all duration-150 ${view === 'grid' ? 'bg-white text-surface-900 shadow-sm border border-surface-200' : 'text-surface-400 hover:text-surface-700'}`}
          >
            <svg viewBox="0 0 16 16" className="w-4 h-4" fill="currentColor" aria-hidden="true">
              <rect x="0" y="0" width="7" height="7" rx="1.5" />
              <rect x="9" y="0" width="7" height="7" rx="1.5" />
              <rect x="0" y="9" width="7" height="7" rx="1.5" />
              <rect x="9" y="9" width="7" height="7" rx="1.5" />
            </svg>
          </button>
          <button
            onClick={() => onViewChange('list')}
            aria-label="نمایش لیستی"
            aria-pressed={view === 'list'}
            className={`p-2 rounded-lg transition-all duration-150 ${view === 'list' ? 'bg-white text-surface-900 shadow-sm border border-surface-200' : 'text-surface-400 hover:text-surface-700'}`}
          >
            <svg viewBox="0 0 16 16" className="w-4 h-4" fill="currentColor" aria-hidden="true">
              <rect x="0" y="0" width="16" height="4" rx="1.5" />
              <rect x="0" y="6" width="16" height="4" rx="1.5" />
              <rect x="0" y="12" width="16" height="4" rx="1.5" />
            </svg>
          </button>
        </div>

      </div>
    </div>
  )
}
