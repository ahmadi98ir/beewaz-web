'use client'

import { useState } from 'react'
import { ChevronDownIcon, XIcon } from '@/components/ui/icons'
import type { ShopCategory } from '@/lib/shop-product'

type Filters = {
  categories: string[]
  minPrice: string
  maxPrice: string
  inStock: boolean
  isNew: boolean
}

type Props = {
  filters: Filters
  categories: ShopCategory[]
  onChange: (filters: Filters) => void
  onReset: () => void
}

function FilterSection({
  title,
  children,
  defaultOpen = true,
}: {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="border-b border-surface-100 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-3.5 text-sm font-bold text-surface-800 hover:text-surface-900 transition-colors"
      >
        {title}
        <ChevronDownIcon
          size={16}
          className={`text-surface-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && <div className="pb-4">{children}</div>}
    </div>
  )
}

export function FiltersSidebar({ filters, categories, onChange, onReset }: Props) {
  const hasActiveFilters =
    filters.categories.length > 0 ||
    filters.minPrice ||
    filters.maxPrice ||
    filters.inStock ||
    filters.isNew

  const toggleCategory = (slug: string) => {
    const next = filters.categories.includes(slug)
      ? filters.categories.filter((c) => c !== slug)
      : [...filters.categories, slug]
    onChange({ ...filters, categories: next })
  }

  return (
    <aside className="w-full" aria-label="فیلترهای جستجو">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-surface-900">فیلترها</h2>
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors"
          >
            <XIcon size={12} />
            پاک کردن
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-surface-200 divide-y divide-surface-100 overflow-hidden">

        {/* دسته‌بندی */}
        {categories.length > 0 && (
          <FilterSection title="دسته‌بندی">
            <ul className="space-y-1" role="list">
              {categories.map((cat) => {
                const checked = filters.categories.includes(cat.slug)
                return (
                  <li key={cat.slug}>
                    <label className="flex items-center gap-3 cursor-pointer py-1.5 px-1 rounded-lg hover:bg-surface-50 transition-colors group">
                      <div className="relative flex-shrink-0">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleCategory(cat.slug)}
                          className="peer sr-only"
                          aria-label={cat.nameFa}
                        />
                        <div className={`w-4.5 h-4.5 rounded-md border-2 flex items-center justify-center transition-all ${checked ? 'bg-brand-600 border-brand-600' : 'border-surface-300 bg-white'}`}>
                          {checked && (
                            <svg viewBox="0 0 10 8" className="w-2.5" fill="none">
                              <path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between flex-1 min-w-0">
                        <span className={`text-sm truncate transition-colors ${checked ? 'font-semibold text-brand-700' : 'text-surface-700'}`}>
                          {cat.nameFa}
                        </span>
                        <span className="text-xs text-surface-400 flex-shrink-0 ms-2">{cat.productCount}</span>
                      </div>
                    </label>
                  </li>
                )
              })}
            </ul>
          </FilterSection>
        )}

        {/* بازه قیمت */}
        <FilterSection title="بازه قیمت">
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-surface-500 mb-1 block">از (تومان)</label>
                <input
                  type="number"
                  placeholder="۰"
                  value={filters.minPrice}
                  onChange={(e) => onChange({ ...filters, minPrice: e.target.value })}
                  className="input text-sm py-2 px-3"
                  min={0}
                />
              </div>
              <div>
                <label className="text-xs text-surface-500 mb-1 block">تا (تومان)</label>
                <input
                  type="number"
                  placeholder="هر قیمت"
                  value={filters.maxPrice}
                  onChange={(e) => onChange({ ...filters, maxPrice: e.target.value })}
                  className="input text-sm py-2 px-3"
                  min={0}
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'تا ۵۰۰ هزار', min: '0', max: '500000' },
                { label: '۵۰۰ تا ۲ میلیون', min: '500000', max: '2000000' },
                { label: '۲ میلیون+', min: '2000000', max: '' },
              ].map((range) => (
                <button
                  key={range.label}
                  onClick={() => onChange({ ...filters, minPrice: range.min, maxPrice: range.max })}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    filters.minPrice === range.min && filters.maxPrice === range.max
                      ? 'bg-brand-600 text-white border-brand-600'
                      : 'border-surface-200 text-surface-600 hover:border-brand-300 hover:text-brand-600'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>
        </FilterSection>

        {/* سایر */}
        <FilterSection title="سایر فیلترها" defaultOpen={false}>
          <div className="space-y-3">
            {[
              { key: 'inStock' as const, label: 'فقط کالاهای موجود' },
              { key: 'isNew' as const, label: 'فقط محصولات جدید' },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center gap-3 cursor-pointer group">
                <div className="relative flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={filters[key]}
                    onChange={(e) => onChange({ ...filters, [key]: e.target.checked })}
                    className="peer sr-only"
                  />
                  <div className={`w-10 h-6 rounded-full transition-colors ${filters[key] ? 'bg-brand-600' : 'bg-surface-200'}`}>
                    <div className={`w-4 h-4 rounded-full bg-white shadow-sm absolute top-1 transition-all ${filters[key] ? 'start-5' : 'start-1'}`} />
                  </div>
                </div>
                <span className="text-sm text-surface-700">{label}</span>
              </label>
            ))}
          </div>
        </FilterSection>

      </div>
    </aside>
  )
}
