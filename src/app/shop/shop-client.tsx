'use client'

import { useState, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { FiltersSidebar } from '@/components/shop/filters-sidebar'
import { SortBar } from '@/components/shop/sort-bar'
import { ProductCard } from '@/components/shop/product-card'
import { AnimateIn } from '@/components/ui/animate-in'
import { XIcon, MenuIcon } from '@/components/ui/icons'
import type { ShopProduct, ShopCategory } from '@/lib/shop-product'

type Filters = {
  categories: string[]
  minPrice: string
  maxPrice: string
  inStock: boolean
  isNew: boolean
}

type SortOption = 'newest' | 'price_asc' | 'price_desc' | 'featured'
type ViewMode = 'grid' | 'list'

const INITIAL_FILTERS: Filters = {
  categories: [],
  minPrice: '',
  maxPrice: '',
  inStock: false,
  isNew: false,
}

const ITEMS_PER_PAGE = 12

type Props = {
  initialQuery?: string
  initialCategory?: string
  products: ShopProduct[]
  categories: ShopCategory[]
}

export function ShopClient({ initialQuery = '', initialCategory, products, categories }: Props) {
  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const [filters, setFilters] = useState<Filters>({
    ...INITIAL_FILTERS,
    categories: initialCategory ? [initialCategory] : [],
  })
  const [sort, setSort] = useState<SortOption>('newest')
  const [view, setView] = useState<ViewMode>('grid')
  const [page, setPage] = useState(1)
  const [mobileFilerOpen, setMobileFilterOpen] = useState(false)

  const handleFiltersChange = useCallback((next: Filters) => {
    setFilters(next)
    setPage(1)
  }, [])

  const handleReset = useCallback(() => {
    setFilters(INITIAL_FILTERS)
    setPage(1)
  }, [])

  const filtered = useMemo(() => {
    let list = [...products]

    if (searchQuery.trim().length >= 1) {
      const q = searchQuery.trim().toLowerCase()
      list = list.filter(
        (p) =>
          p.nameFa.includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.categoryName.includes(q) ||
          p.descriptionFa.includes(q),
      )
    }
    if (filters.categories.length > 0) {
      list = list.filter((p) => filters.categories.includes(p.categorySlug))
    }
    if (filters.minPrice) list = list.filter((p) => p.price >= Number(filters.minPrice))
    if (filters.maxPrice) list = list.filter((p) => p.price <= Number(filters.maxPrice))
    if (filters.inStock) list = list.filter((p) => p.stock > 0)
    if (filters.isNew) list = list.filter((p) => p.isNew)

    switch (sort) {
      case 'price_asc':  list.sort((a, b) => a.price - b.price); break
      case 'price_desc': list.sort((a, b) => b.price - a.price); break
      case 'featured':   list.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0)); break
      default:           list.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0))
    }

    return list
  }, [products, filters, sort, searchQuery])

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  const activeFiltersCount =
    filters.categories.length +
    (filters.minPrice ? 1 : 0) +
    (filters.maxPrice ? 1 : 0) +
    (filters.inStock ? 1 : 0) +
    (filters.isNew ? 1 : 0) +
    (searchQuery.trim() ? 1 : 0)

  return (
    <div className="min-h-screen bg-surface-50">

      <div className="bg-white border-b border-surface-200">
        <div className="container-main py-3">
          <nav className="flex items-center gap-2 text-sm" aria-label="مسیر صفحه">
            <Link href="/" className="text-surface-500 hover:text-brand-600 transition-colors">خانه</Link>
            <span className="text-surface-300">/</span>
            <span className="text-surface-900 font-medium">فروشگاه</span>
          </nav>
        </div>
      </div>

      <div className="container-main py-8">

        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-surface-900">فروشگاه بیواز</h1>
            <p className="text-sm text-surface-500 mt-1">کامل‌ترین مجموعه تجهیزات امنیتی</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative flex-1 sm:w-64 sm:flex-none">
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setPage(1) }}
                placeholder="جستجوی محصول..."
                className="input pe-10 py-2.5 text-sm"
              />
              <svg
                viewBox="0 0 24 24"
                className="absolute top-1/2 -translate-y-1/2 end-3 w-4 h-4 text-surface-400 pointer-events-none"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
            </div>

            <button
              onClick={() => setMobileFilterOpen(true)}
              className="lg:hidden btn btn-outline py-2.5 px-4 text-sm gap-2 flex-shrink-0"
            >
              <MenuIcon size={16} />
              فیلترها
              {activeFiltersCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-brand-600 text-white text-xs font-bold flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="flex gap-6">

          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24">
              <FiltersSidebar
                filters={filters}
                categories={categories}
                onChange={handleFiltersChange}
                onReset={handleReset}
              />
            </div>
          </aside>

          <main className="flex-1 min-w-0 space-y-5">

            <SortBar
              total={filtered.length}
              sort={sort}
              view={view}
              onSortChange={(s) => { setSort(s as SortOption); setPage(1) }}
              onViewChange={setView}
            />

            {activeFiltersCount > 0 && (
              <div className="flex flex-wrap gap-2" aria-label="فیلترهای فعال">
                {filters.categories.map((slug) => {
                  const cat = categories.find((c) => c.slug === slug)
                  return (
                    <button
                      key={slug}
                      onClick={() => handleFiltersChange({ ...filters, categories: filters.categories.filter((c) => c !== slug) })}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold hover:bg-brand-100 transition-colors"
                    >
                      {cat?.nameFa ?? slug}
                      <XIcon size={12} />
                    </button>
                  )
                })}
                {filters.inStock && (
                  <button
                    onClick={() => handleFiltersChange({ ...filters, inStock: false })}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-50 border border-green-200 text-green-700 text-xs font-semibold hover:bg-green-100 transition-colors"
                  >
                    موجود <XIcon size={12} />
                  </button>
                )}
                {filters.isNew && (
                  <button
                    onClick={() => handleFiltersChange({ ...filters, isNew: false })}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold hover:bg-blue-100 transition-colors"
                  >
                    جدید <XIcon size={12} />
                  </button>
                )}
              </div>
            )}

            {paginated.length > 0 ? (
              <div className={view === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4' : 'flex flex-col gap-4'}>
                {paginated.map((product, i) => (
                  <AnimateIn key={product.id} delay={i * 50}>
                    <ProductCard product={product} view={view} />
                  </AnimateIn>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-20 h-20 rounded-3xl bg-surface-100 flex items-center justify-center mb-5">
                  <svg viewBox="0 0 40 40" className="w-9 h-9 text-surface-300" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="20" cy="20" r="14" />
                    <path d="M15 20h10M20 15v10" strokeLinecap="round" />
                  </svg>
                </div>
                <p className="text-lg font-bold text-surface-700 mb-2">محصولی یافت نشد</p>
                <p className="text-sm text-surface-400 mb-6">فیلترها را تغییر دهید یا پاک کنید</p>
                <button onClick={handleReset} className="btn btn-primary px-6">پاک کردن فیلترها</button>
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-1 pt-4">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="btn btn-ghost py-2 px-3 text-sm disabled:opacity-40"
                  aria-label="صفحه قبل"
                >‹</button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    aria-current={page === p ? 'page' : undefined}
                    className={[
                      'min-w-[36px] h-9 rounded-xl text-sm font-semibold transition-all',
                      page === p ? 'bg-brand-600 text-white shadow-sm' : 'btn btn-ghost py-2 px-3 text-surface-600',
                    ].join(' ')}
                  >
                    {new Intl.NumberFormat('fa-IR').format(p)}
                  </button>
                ))}

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="btn btn-ghost py-2 px-3 text-sm disabled:opacity-40"
                  aria-label="صفحه بعد"
                >›</button>
              </div>
            )}

          </main>
        </div>
      </div>

      {mobileFilerOpen && (
        <>
          <div
            className="fixed inset-0 z-50 bg-surface-950/60 lg:hidden"
            onClick={() => setMobileFilterOpen(false)}
            aria-hidden="true"
          />
          <aside
            role="dialog"
            aria-modal="true"
            aria-label="فیلترهای جستجو"
            className="fixed inset-y-0 start-0 z-50 w-80 max-w-[90vw] bg-surface-50 lg:hidden flex flex-col overflow-hidden shadow-2xl"
          >
            <div className="flex items-center justify-between p-4 bg-white border-b border-surface-200">
              <h2 className="font-bold text-surface-900">فیلترها</h2>
              <button onClick={() => setMobileFilterOpen(false)} className="btn btn-ghost p-2" aria-label="بستن">
                <XIcon size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <FiltersSidebar
                filters={filters}
                categories={categories}
                onChange={handleFiltersChange}
                onReset={handleReset}
              />
            </div>
            <div className="p-4 border-t border-surface-200 bg-white">
              <button onClick={() => setMobileFilterOpen(false)} className="btn btn-primary w-full">
                نمایش {filtered.length} محصول
              </button>
            </div>
          </aside>
        </>
      )}
    </div>
  )
}
