'use client'

import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { SearchIcon, XIcon } from '@/components/ui/icons'
import { mockProducts } from '@/lib/mock-data'
import { formatPrice } from '@/lib/utils'
import { ProductSvgIcon } from '@/components/shop/product-svg-icon'

export function SearchBar() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes((e.target as Element).tagName)) {
        e.preventDefault()
        setOpen(true)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  useEffect(() => {
    if (open) {
      inputRef.current?.focus()
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
      setQuery('')
    }
  }, [open])

  const results = useMemo(() => {
    if (query.trim().length < 2) return []
    const q = query.trim().toLowerCase()
    return mockProducts
      .filter(
        (p) =>
          p.nameFa.includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.categoryName.includes(q) ||
          p.descriptionFa.includes(q),
      )
      .slice(0, 6)
  }, [query])

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      if (!query.trim()) return
      router.push(`/shop?q=${encodeURIComponent(query.trim())}`)
      setOpen(false)
    },
    [query, router],
  )

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="btn btn-ghost p-2.5 relative"
        aria-label="جستجو"
        aria-keyshortcuts="/"
      >
        <SearchIcon size={20} />
        <span className="hidden xl:flex items-center gap-1.5 me-1 text-xs text-surface-400">
          <kbd className="inline-flex items-center px-1.5 py-0.5 rounded border border-surface-200 font-mono bg-surface-50">
            /
          </kbd>
        </span>
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-50 bg-surface-950/60 animate-fade-in"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />

          <div className="fixed inset-x-0 top-0 z-50 p-4 sm:p-6 animate-slide-down">
            <div
              className="bg-white rounded-2xl mx-auto max-w-2xl overflow-hidden"
              style={{ boxShadow: 'var(--shadow-modal)' }}
            >
              {/* Input */}
              <form onSubmit={handleSubmit} className="flex items-center gap-3 p-4 border-b border-surface-100">
                <SearchIcon size={20} className="text-surface-400 flex-shrink-0" />
                <input
                  ref={inputRef}
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="جستجو در محصولات، مدل و دسته‌بندی..."
                  className="flex-1 text-base outline-none placeholder:text-surface-400 bg-transparent"
                  autoComplete="off"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    className="text-surface-400 hover:text-surface-700 transition-colors"
                    aria-label="پاک کردن"
                  >
                    <XIcon size={16} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="text-xs text-surface-400 hover:text-surface-700 transition-colors px-2 py-1 border border-surface-200 rounded-lg"
                >
                  Esc
                </button>
              </form>

              {/* نتایج live */}
              {results.length > 0 && (
                <ul role="listbox" className="py-2 max-h-80 overflow-y-auto">
                  {results.map((product) => (
                    <li key={product.id}>
                      <Link
                        href={`/shop/${product.categorySlug}/${product.slug}`}
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-surface-50 transition-colors group"
                      >
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{
                            background: `linear-gradient(135deg, ${product.placeholderFrom}, ${product.placeholderTo})`,
                          }}
                        >
                          <ProductSvgIcon
                            categorySlug={product.categorySlug}
                            size={22}
                            className="text-surface-500/70"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-surface-800 group-hover:text-brand-600 transition-colors truncate">
                            {product.nameFa}
                          </p>
                          <p className="text-xs text-surface-400">{product.categoryName} · {product.sku}</p>
                        </div>
                        <span className="text-sm font-bold text-surface-700 flex-shrink-0">
                          {formatPrice(product.price)}
                        </span>
                      </Link>
                    </li>
                  ))}

                  {query.trim().length >= 2 && (
                    <li className="border-t border-surface-100 mt-1 pt-1">
                      <button
                        onClick={handleSubmit as unknown as React.MouseEventHandler}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-brand-600 font-semibold hover:bg-brand-50 transition-colors"
                      >
                        <SearchIcon size={15} />
                        مشاهده همه نتایج برای «{query}»
                      </button>
                    </li>
                  )}
                </ul>
              )}

              {/* Empty state */}
              {query.trim().length >= 2 && results.length === 0 && (
                <div className="px-4 py-8 text-center">
                  <p className="text-sm font-semibold text-surface-700 mb-1">نتیجه‌ای یافت نشد</p>
                  <p className="text-xs text-surface-400">عبارت دیگری امتحان کنید</p>
                </div>
              )}

              {/* پیشنهادات سریع */}
              {query.trim().length < 2 && (
                <div className="border-t border-surface-100 px-4 py-3">
                  <p className="text-xs text-surface-400 mb-2">جستجوهای پرتکرار:</p>
                  <div className="flex flex-wrap gap-2">
                    {['دزدگیر خانگی', 'حسگر حرکتی', 'سیرن خارجی', 'ریموت دزدگیر'].map((term) => (
                      <button
                        key={term}
                        onClick={() => {
                          setQuery(term)
                          inputRef.current?.focus()
                        }}
                        className="text-xs px-3 py-1.5 rounded-full bg-surface-100 text-surface-700 hover:bg-brand-50 hover:text-brand-700 transition-colors"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  )
}
