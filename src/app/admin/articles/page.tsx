'use client'

import { useEffect, useState } from 'react'
import { SearchIcon } from '@/components/ui/icons'

type ArticleCategory = 'blog' | 'knowledge_base'
type ArticleStatus = 'draft' | 'published' | 'archived'
type TypeFilter = 'all' | ArticleCategory

interface Article {
  id: string
  category: ArticleCategory
  status: ArticleStatus
  titleFa: string
  slug: string
  excerptFa: string | null
  readingTime: number | null
  tags: string[]
  publishedAt: string | null
  createdAt: string
  authorId: string | null
  authorName: string | null
}

const categoryLabel: Record<ArticleCategory, { text: string; cls: string }> = {
  knowledge_base: { text: 'پایگاه دانش', cls: 'bg-blue-50 text-blue-700 border-blue-200' },
  blog:           { text: 'وبلاگ',       cls: 'bg-purple-50 text-purple-700 border-purple-200' },
}

const statusLabel: Record<ArticleStatus, { text: string; cls: string }> = {
  draft:     { text: 'پیش‌نویس', cls: 'bg-surface-100 text-surface-600 border-surface-200' },
  published: { text: 'منتشر شده', cls: 'bg-green-50 text-green-700 border-green-200' },
  archived:  { text: 'آرشیو',    cls: 'bg-amber-50 text-amber-700 border-amber-200' },
}

export default function AdminArticlesPage() {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadArticles = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/articles')
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'خطا در بارگیری'); return }
      setArticles(data.articles || [])
    } catch {
      setError('خطای شبکه')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadArticles() }, [])

  const deleteArticle = async (id: string) => {
    if (!confirm('آیا از حذف این مقاله مطمئنید؟')) return
    const prev = articles
    setArticles(a => a.filter(x => x.id !== id))
    try {
      const res = await fetch(`/api/admin/articles/${id}`, { method: 'DELETE' })
      if (!res.ok) setArticles(prev)
    } catch {
      setArticles(prev)
    }
  }

  const filtered = articles.filter((a) => {
    const matchType = typeFilter === 'all' || a.category === typeFilter
    const matchSearch = !search || a.titleFa.includes(search) || a.authorName?.includes(search)
    return matchType && matchSearch
  })

  const tabs: { key: TypeFilter; label: string }[] = [
    { key: 'all',            label: `همه (${articles.length})` },
    { key: 'knowledge_base', label: `پایگاه دانش (${articles.filter(a => a.category === 'knowledge_base').length})` },
    { key: 'blog',           label: `وبلاگ (${articles.filter(a => a.category === 'blog').length})` },
  ]

  return (
    <div className="flex-1 overflow-y-auto">
      <header className="bg-white border-b border-surface-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-black text-surface-900">مدیریت مقالات</h1>
          <p className="text-xs text-surface-400 mt-0.5">{articles.length} مقاله ثبت شده</p>
        </div>
        <button className="btn btn-primary py-2.5 px-4 text-sm gap-2" disabled>
          <span className="text-lg leading-none">+</span>
          مقاله جدید
        </button>
      </header>

      <div className="p-6">
        <div className="bg-white rounded-2xl border border-surface-200 overflow-hidden">
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

          {loading ? (
            <div className="text-center py-12 text-surface-400">در حال بارگیری...</div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600 text-sm">{error}</p>
              <button onClick={loadArticles} className="mt-3 btn btn-outline text-xs py-2 px-4">تلاش مجدد</button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-surface-50 text-surface-500 text-xs">
                    <tr>
                      {['مقاله', 'نوع', 'نویسنده', 'وضعیت', 'زمان مطالعه', 'تاریخ', ''].map((h) => (
                        <th key={h} className="text-start px-5 py-3 font-semibold whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-100">
                    {filtered.map((article) => {
                      const cat = categoryLabel[article.category]
                      const st = statusLabel[article.status]
                      return (
                        <tr key={article.id} className="hover:bg-surface-50 transition-colors">
                          <td className="px-5 py-4">
                            <div>
                              <p className="font-semibold text-surface-900 line-clamp-1 max-w-64">{article.titleFa}</p>
                              {article.excerptFa && (
                                <p className="text-xs text-surface-400 mt-0.5 line-clamp-1 max-w-64">{article.excerptFa}</p>
                              )}
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold border ${cat.cls}`}>
                              {cat.text}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-surface-600 text-xs">{article.authorName ?? '—'}</td>
                          <td className="px-5 py-4">
                            <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold border ${st.cls}`}>
                              {st.text}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-surface-600 text-xs">
                            {article.readingTime ? `${article.readingTime} دقیقه` : '—'}
                          </td>
                          <td className="px-5 py-4 text-surface-400 text-xs whitespace-nowrap">
                            {new Intl.DateTimeFormat('fa-IR', { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(article.createdAt))}
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-1">
                              <button className="text-xs font-semibold text-brand-600 hover:text-brand-700 px-3 py-1.5 rounded-lg hover:bg-brand-50 transition-colors">
                                ویرایش
                              </button>
                              <button
                                onClick={() => deleteArticle(article.id)}
                                className="text-xs text-red-500 hover:text-red-700 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                              >
                                حذف
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
                {filtered.length === 0 && (
                  <div className="text-center py-12 text-surface-400 text-sm">
                    {articles.length === 0 ? 'هنوز مقاله‌ای ثبت نشده.' : 'مقاله‌ای با این فیلتر یافت نشد.'}
                  </div>
                )}
              </div>

              <div className="px-5 py-3 border-t border-surface-100 bg-surface-50 flex items-center justify-between text-sm">
                <span className="text-surface-500">{filtered.length} مقاله</span>
                <span className="text-xs text-surface-400">
                  {articles.filter(a => a.status === 'published').length} مقاله منتشر شده
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
