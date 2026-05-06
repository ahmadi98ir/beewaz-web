'use client'

import { useState } from 'react'
import Link from 'next/link'
import { mockProducts } from '@/lib/mock-data'
import type { MockProduct } from '@/lib/mock-data'
import { formatPrice } from '@/lib/utils'
import { SearchIcon, CheckIcon, XIcon } from '@/components/ui/icons'

export default function AdminProductsPage() {
  const [search, setSearch] = useState('')
  const [products, setProducts] = useState(mockProducts)
  const [categoryFilter, setCategoryFilter] = useState('all')

  const categories = ['all', ...Array.from(new Set(mockProducts.map(p => p.categorySlug)))]

  const filtered = products.filter(p => {
    const matchCat = categoryFilter === 'all' || p.categorySlug === categoryFilter
    const matchSearch = !search || p.nameFa.includes(search) || p.sku.includes(search)
    return matchCat && matchSearch
  })

  const toggleFeatured = (id: string) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, isFeatured: !p.isFeatured } : p))
  }

  const categoryLabels: Record<string, string> = {
    all: 'همه دسته‌ها',
    sensors: 'حسگرها',
    'central-alarm': 'دزدگیر مرکزی',
    sirens: 'سیرن و آژیر',
    control: 'تجهیزات کنترل',
    boosters: 'تقویت‌کننده',
    accessories: 'لوازم جانبی',
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <header className="bg-white border-b border-surface-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-black text-surface-900">مدیریت محصولات</h1>
          <p className="text-xs text-surface-400 mt-0.5">{products.length} محصول ثبت شده</p>
        </div>
        <Link href="/admin/products/new" className="btn btn-accent py-2.5 px-4 text-sm gap-2">
          <span className="text-lg leading-none">+</span>
          محصول جدید
        </Link>
      </header>

      <div className="p-6">
        <div className="bg-white rounded-2xl border border-surface-200 overflow-hidden">
          {/* Controls */}
          <div className="flex items-center gap-4 p-4 border-b border-surface-100 flex-wrap">
            <div className="flex gap-0.5 bg-surface-50 p-1 rounded-xl flex-wrap">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${categoryFilter === cat ? 'bg-white text-surface-900 shadow-sm border border-surface-200' : 'text-surface-500 hover:text-surface-700'}`}
                >
                  {categoryLabels[cat] ?? cat}
                </button>
              ))}
            </div>
            <div className="relative ms-auto">
              <SearchIcon size={14} className="absolute start-3 top-1/2 -translate-y-1/2 text-surface-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="نام یا کد محصول..."
                className="ps-9 pe-4 py-2 text-sm border border-surface-200 rounded-xl w-48 focus:outline-none focus:border-brand-600 transition-colors"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface-50 text-surface-500 text-xs">
                <tr>
                  {['محصول', 'SKU', 'دسته', 'قیمت', 'موجودی', 'ویژه', 'وضعیت', ''].map(h => (
                    <th key={h} className="text-start px-5 py-3 font-semibold whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {filtered.map((product) => (
                  <tr key={product.id} className="hover:bg-surface-50 transition-colors">
                    {/* محصول */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center"
                          style={{ background: `linear-gradient(135deg, ${product.placeholderFrom}, ${product.placeholderTo})` }}
                        >
                          <span className="text-[10px] font-black text-surface-400">{product.sku.replace('BW-', '')}</span>
                        </div>
                        <span className="font-semibold text-surface-900 line-clamp-1 max-w-48">{product.nameFa}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-mono text-xs text-surface-500">{product.sku}</td>
                    <td className="px-5 py-4 text-surface-600 text-xs">{product.categoryName}</td>
                    <td className="px-5 py-4">
                      <p className="font-bold text-surface-900 whitespace-nowrap">{formatPrice(product.price)}</p>
                      {product.comparePrice && (
                        <p className="text-xs text-surface-400 line-through">{formatPrice(product.comparePrice)}</p>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold border ${product.stock > 10 ? 'bg-green-50 text-green-700 border-green-200' : product.stock > 0 ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                        {product.stock > 0 ? `${product.stock} عدد` : 'ناموجود'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => toggleFeatured(product.id)}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${product.isFeatured ? 'text-white' : 'bg-surface-100 text-surface-400 hover:text-accent-500'}`}
                        style={product.isFeatured ? { background: '#F97316' } : undefined}
                        title={product.isFeatured ? 'حذف از ویژه' : 'افزودن به ویژه'}
                      >
                        <CheckIcon size={14} />
                      </button>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold border ${product.isNew ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-surface-100 text-surface-600 border-surface-200'}`}>
                        {product.isNew ? 'جدید' : 'عادی'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/products/${product.id}`}
                          className="text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors px-3 py-1.5 rounded-lg hover:bg-brand-50"
                        >
                          ویرایش
                        </Link>
                        <Link
                          href={`/shop/${product.categorySlug}/${product.slug}`}
                          target="_blank"
                          className="text-xs text-surface-400 hover:text-surface-600 transition-colors px-3 py-1.5 rounded-lg hover:bg-surface-100"
                        >
                          مشاهده
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
