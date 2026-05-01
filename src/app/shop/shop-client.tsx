'use client'

import { useState, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { FiltersSidebar } from '@/components/shop/filters-sidebar'
import { SortBar } from '@/components/shop/sort-bar'
import { ProductCard } from '@/components/shop/product-card'
import { AnimateIn } from '@/components/ui/animate-in'
import { XIcon, MenuIcon } from '@/components/ui/icons'
import { mockProducts } from '@/lib/mock-data'

type Filters = {
  categories: string[]
  minPrice: string
  maxPrice: string
  inStock: boolean
  isNew: boolean
}

type SortOption = 'newest' | 'price_asc' | 'price_desc' | 'rating'
type ViewMode = 'grid' | 'list'

const INITIAL_FILTERS: Filters = {
  categories: [],
  minPrice: '',
  maxPrice: '',
  inStock: false,
  isNew: false,
}

const ITEMS_PER_PAGE = 12

export function ShopClient() {
  const [filters, setFilters] = useState<Filters>(INITIAL_FILTERS)
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

  // فیلتر و مرتب‌سازی محصولات
  const filtered = useMemo(() => {
    let list = [...mockProducts]

    // دسته‌بندی
    if (filters.categories.length > 0) {
      list = list.filter((p) => filters.categories.includes(p.categorySlug))
    }
    // بازه قیمت
    if (filters.minPrice) list = list.filter((p) => p.price >= Number(filters.minPrice))
    if (filters.maxPrice) list = list.filter((p) => p.price <= Number(filters.maxPrice))
    // موجودی
    if (filters.inStock) list = list.filter((p) => p.stock > 0)
    // جدید
    if (filters.isNew) list = list.filter((p) => p.isNew)

    // مرتب‌سازی
    switch (sort) {
      case 'price_asc':  list.sort((a, b) => a.price - b.price); break
      case 'price_desc': list.sort((a, b) => b.price - a.price); break
      case 'rating':     list.sort((a, b) => b.rating - a.rating); break
      default:           list.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0))
    }

    return list
  }, [filters, sort])

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  const activeFiltersCount =
    filters.categories.length +
    (filters.minPrice ? 1 : 0) +
    (filters.maxPrice ? 1 : 0) +
    (filters.inStock ? 1 : 0) +
    (filters.isNew ? 1 : 0)

  return (
    <div className="min-h-screen bg-surface-50">

      {/* ── Breadcrumb ────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-surface-200">
        <div className="container-main py-3">
          <nav className="flex items-center gap-2 text-sm" aria-label="مسیر صفحه">
            <Link href="/" className="text-surface-500 hover:text-brand-600 transition-colors">
              خانه
            </Link>
            <span className="text-surface-300">/</span>
            <span className="text-surface-900 font-medium">فروشگاه</span>
          </nav>
        </div>
      </div>

      <div className="container-main py-8">

        {/* ── Page Header ───────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-surface-900">فروشگاه بیواز</h1>
            <p className="text-sm text-surface-500 mt-1">کامل‌ترین مجموعه تجهیزات امنیتی</p>
          </div>

          {/* دکمه فیلتر موبایل */}
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden btn btn-outline py-2.5 px-4 text-sm gap-2"
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

        <div className="flex gap-6">

          {/* ── Sidebar — دسکتاپ ──────────────────────────────────────────────── */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24">
              <FiltersSidebar
                filters={filters}
                onChange={handleFiltersChange}
                onReset={handleReset}
              />
            </div>
          </aside>

          {/* ── محتوای اصلی ───────────────────────────────────────────────────── */}
          <main className="flex-1 min-w-0 space-y-5">

            {/* Sort Bar */}
            <SortBar
              total={filtered.length}
              sort={sort}
              view={view}
              onSortChange={(s) => { setSort(s); setPage(1) }}
              onViewChange={setView}
            />

            {/* Active Filter Tags */}
            {activeFiltersCount > 0 && (
              <div className="flex flex-wrap gap-2" aria-label="فیلترهای فعال">
                {filters.categories.map((slug) => {
                  const cat = mockProducts.find((p) => p.categorySlug === slug)
                  return (
                    <button
                      key={slug}
                      onClick={() => handleFiltersChange({ ...filters, categories: filters.categories.filter((c) => c !== slug) })}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold hover:bg-brand-100 transition-colors"
                    >
                      {cat?.categoryName}
                      <XIcon size={12} />
                    </button>
                  )
                })}
                {filters.inStock && (
                  <button
                    onClick={() => handleFiltersChange({ ...filters, inStock: false })}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-50 border border-green-200 text-green-700 text-xs font-semibold hover:bg-green-100 transition-colors"
                  >
                    موجود
                    <XIcon size={12} />
                  </button>
                )}
                {filters.isNew && (
                  <button
                    onClick={() => handleFiltersChange({ ...filters, isNew: false })}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold hover:bg-blue-100 transition-colors"
                  >
                    جدید
                    <XIcon size={12} />
                  </button>
                )}
              </div>
            )}

            {/* Product Grid */}
            {paginated.length > 0 ? (
              <div
                className={
                  view === 'grid'
                    ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4'
                    : 'flex flex-col gap-4'
                }
              >
                {paginated.map((product, i) => (
                  <AnimateIn key={product.id} delay={i * 50}>
                    <ProductCard product={product} view={view} />
                  </AnimateIn>
                ))}
              </div>
            ) : (
              /* Empty State */
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-20 h-20 rounded-3xl bg-surface-100 flex items-center justify-center mb-5">
                  <svg viewBox="0 0 40 40" className="w-9 h-9 text-surface-300" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="20" cy="20" r="14" />
                    <path d="M15 20h10M20 15v10" strokeLinecap="round" />
                  </svg>
                </div>
                <p className="text-lg font-bold text-surface-700 mb-2">محصولی یافت نشد</p>
                <p className="text-sm text-surface-400 mb-6">فیلترها را تغییر دهید یا پاک کنید</p>
                <button onClick={handleReset} className="btn btn-primary px-6">
                  پاک کردن فیلترها
                </button>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-1 pt-4">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="btn btn-ghost py-2 px-3 text-sm disabled:opacity-40"
                  aria-label="صفحه قبل"
                >
                  ‹
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    aria-current={page === p ? 'page' : undefined}
                    className={[
                      'min-w-[36px] h-9 rounded-xl text-sm font-semibold transition-all',
                      page === p
                        ? 'bg-brand-600 text-white shadow-sm'
                        : 'btn btn-ghost py-2 px-3 text-surface-600',
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
                >
                  ›
                </button>
              </div>
            )}

          </main>
        </div>
      </div>

      {/* ── Mobile Filter Drawer ──────────────────────────────────────────── */}
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
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="btn btn-ghost p-2"
                aria-label="بستن"
              >
                <XIcon size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <FiltersSidebar
                filters={filters}
                onChange={handleFiltersChange}
                onReset={handleReset}
              />
            </div>
            <div className="p-4 border-t border-surface-200 bg-white">
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="btn btn-primary w-full"
              >
                نمایش {filtered.length} محصول
              </button>
            </div>
          </aside>
        </>
      )}

    </div>
  )
}
