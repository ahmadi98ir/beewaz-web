'use client'

import { useState } from 'react'
import Link from 'next/link'
import { mockArticles } from '@/lib/mock-articles'
import { SearchIcon } from '@/components/ui/icons'

type TypeFilter = 'all' | 'knowledge_base' | 'blog'

export default function AdminArticlesPage() {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')
  const [articles, setArticles] = useState(mockArticles)

  const filtered = articles.filter((a) => {
    const matchType = typeFilter === 'all' || a.type === typeFilter
    const matchSearch = !search || a.title.includes(search) || a.author.includes(search)
    return matchType && matchSearch
  })

  const toggleFeatured = (id: string) => {
    setArticles((prev) => prev.map((a) => a.id === id ? { ...a, isFeatured: !a.isFeatured } : a))
  }

  const tabs: { key: TypeFilter; label: string }[] = [
    { key: 'all', label: `همه (${articles.length})` },
    { key: 'knowledge_base', label: `پایگاه دانش (${articles.filter(a => a.type === 'knowledge_base').length})` },
    { key: 'blog', label: `وبلاگ (${articles.filter(a => a.type === 'blog').length})` },
  ]

  return (
    <div className="flex-1 overflow-y-auto">
      <header className="bg-white border-b border-surface-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-black text-surface-900">مدیریت مقالات</h1>
          <p className="text-xs text-surface-400 mt-0.5">{articles.length} مقاله ثبت شده</p>
        </div>
        <button className="btn btn-primary py-2.5 px-4 text-sm gap-2">
          <span className="text-lg leading-none">+</span>
          مقاله جدید
        </button>
      </header>

      <div className="p-6">
        <div className="bg-white rounded-2xl border border-surface-200 overflow-hidden">
          {/* Controls */}
          <div className="flex items-center justify-between gap-4 p-4 border-b border-surface-100 flex-wrap">
            <div className="flex gap-0.5 bg-surface-50 p-1 rounded-xl flex-wrap">
              {tabs.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setTypeFilter(key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${typeFilter === key ? 'bg-white text-surface-900 shadow-sm border border-surface-200' : 'text-surface-500 hover:text-surface-700'}`}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="relative">
              <SearchIcon size={14} className="absolute start-3 top-1/2 -translate-y-1/2 text-surface-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="جستجوی مقاله..."
                className="ps-9 pe-4 py-2 text-sm border border-surface-200 rounded-xl w-52 focus:outline-none focus:border-brand-600 transition-colors"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface-50 text-surface-500 text-xs">
                <tr>
                  {['مقاله', 'نوع', 'دسته', 'نویسنده', 'بازدید', 'زمان', 'ویژه', ''].map((h) => (
                    <th key={h} className="text-start px-5 py-3 font-semibold whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {filtered.map((article) => (
                  <tr key={article.id} className="hover:bg-surface-50 transition-colors">
                    {/* Title */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-xl flex-shrink-0"
                          style={{ background: `linear-gradient(135deg, ${article.from}, ${article.to})` }}
                        />
                        <span className="font-semibold text-surface-900 line-clamp-1 max-w-52">{article.title}</span>
                      </div>
                    </td>
                    {/* Type */}
                    <td className="px-5 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold border ${article.type === 'knowledge_base' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-purple-50 text-purple-700 border-purple-200'}`}>
                        {article.type === 'knowledge_base' ? 'پایگاه دانش' : 'وبلاگ'}
                      </span>
                    </td>
                    {/* Category */}
                    <td className="px-5 py-4 text-surface-600 text-xs">{article.categoryName}</td>
                    {/* Author */}
                    <td className="px-5 py-4 text-surface-600 text-xs">{article.author}</td>
                    {/* Views */}
                    <td className="px-5 py-4 text-surface-600 text-xs">
                      {article.views.toLocaleString('fa-IR')}
                    </td>
                    {/* Read time */}
                    <td className="px-5 py-4 text-surface-600 text-xs">{article.readTime} دقیقه</td>
                    {/* Featured */}
                    <td className="px-5 py-4">
                      <button
                        onClick={() => toggleFeatured(article.id)}
                        title={article.isFeatured ? 'حذف از ویژه' : 'افزودن به ویژه'}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${article.isFeatured ? 'bg-amber-400 text-white' : 'bg-surface-100 text-surface-400 hover:bg-amber-50 hover:text-amber-500'}`}
                      >
                        ★
                      </button>
                    </td>
                    {/* Actions */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1">
                        <button className="text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors px-3 py-1.5 rounded-lg hover:bg-brand-50">
                          ویرایش
                        </button>
                        <Link
                          href={article.type === 'knowledge_base'
                            ? `/knowledge-base/${article.categorySlug}/${article.slug}`
                            : `/blog/${article.slug}`}
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
            {filtered.length === 0 && (
              <div className="text-center py-12 text-surface-400 text-sm">مقاله‌ای یافت نشد.</div>
            )}
          </div>

          <div className="px-5 py-3 border-t border-surface-100 bg-surface-50 flex items-center justify-between text-sm">
            <span className="text-surface-500">{filtered.length} مقاله</span>
            <span className="text-xs text-surface-400">
              {articles.filter(a => a.isFeatured).length} مقاله ویژه
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
