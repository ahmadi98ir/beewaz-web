'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Page {
  id: string; slug: string; titleFa: string
  status: string; publishedAt: string | null; updatedAt: string
}

function fa(d: string) {
  return new Intl.DateTimeFormat('fa-IR', { dateStyle: 'short' }).format(new Date(d))
}

export default function PagesListPage() {
  const router = useRouter()
  const [pages,   setPages]   = useState<Page[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newSlug,  setNewSlug]  = useState('')
  const [showNew,  setShowNew]  = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const r = await fetch('/api/admin/pages')
    if (r.ok) { const d = await r.json() as { pages: Page[] }; setPages(d.pages) }
    setLoading(false)
  }, [])

  useEffect(() => { void load() }, [load])

  const slugify = (s: string) =>
    s.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w؀-ۿ-]/g, '')

  const create = async () => {
    if (!newTitle.trim() || creating) return
    setCreating(true)
    const r = await fetch('/api/admin/pages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ titleFa: newTitle.trim(), slug: newSlug || slugify(newTitle) }),
    })
    if (r.ok) {
      const d = await r.json() as { page: Page }
      router.push(`/admin/pages/${d.page.id}`)
    }
    setCreating(false)
  }

  const deletePage = async (id: string) => {
    if (!confirm('آیا از حذف این صفحه مطمئنید؟')) return
    const prev = pages
    setPages((p) => p.filter((x) => x.id !== id))
    try {
      const res = await fetch(`/api/admin/pages/${id}`, { method: 'DELETE' })
      if (!res.ok) setPages(prev)
    } catch {
      setPages(prev)
    }
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <header className="bg-white border-b border-surface-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-black text-surface-900">مدیریت صفحات</h1>
          <p className="text-xs text-surface-400 mt-0.5">ساخت و ویرایش صفحات سایت</p>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="btn btn-accent px-5 py-2.5 text-sm flex items-center gap-2"
        >
          <svg viewBox="0 0 20 20" className="w-4 h-4" fill="currentColor"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd"/></svg>
          صفحه جدید
        </button>
      </header>

      <div className="p-6">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : pages.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-surface-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg viewBox="0 0 24 24" className="w-8 h-8 text-surface-400" fill="none" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            </div>
            <p className="text-surface-600 font-semibold mb-1">هنوز صفحه‌ای نساخته‌اید</p>
            <p className="text-surface-400 text-sm mb-6">اولین صفحه سایت را بسازید</p>
            <button onClick={() => setShowNew(true)} className="btn btn-accent px-6">ساخت صفحه اول</button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-surface-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-surface-50 text-surface-500 text-xs">
                <tr>
                  {['عنوان صفحه', 'آدرس (slug)', 'وضعیت', 'آخرین ویرایش', 'عملیات'].map((h) => (
                    <th key={h} className="text-start px-5 py-3 font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {pages.map((page) => (
                  <tr key={page.id} className="hover:bg-surface-50 transition-colors">
                    <td className="px-5 py-4 font-semibold text-surface-900">{page.titleFa}</td>
                    <td className="px-5 py-4 font-mono text-xs text-surface-500">/{page.slug}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                        page.status === 'published'
                          ? 'bg-green-50 text-green-700 border-green-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {page.status === 'published' ? 'منتشرشده' : 'پیش‌نویس'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-surface-400 text-xs">{fa(page.updatedAt)}</td>
                    <td className="px-5 py-4 flex items-center gap-3">
                      <Link
                        href={`/admin/pages/${page.id}`}
                        className="text-brand-600 hover:text-brand-700 text-xs font-semibold"
                      >
                        ویرایش
                      </Link>
                      {page.status === 'published' ? (
                        <Link
                          href={`/p/${page.slug}`}
                          target="_blank"
                          className="text-surface-400 hover:text-surface-600 text-xs font-semibold"
                        >
                          مشاهده
                        </Link>
                      ) : (
                        <Link
                          href={`/admin/pages/${page.id}/preview`}
                          target="_blank"
                          className="text-surface-400 hover:text-surface-600 text-xs font-semibold"
                        >
                          پیش‌نمایش
                        </Link>
                      )}
                      <button
                        onClick={() => deletePage(page.id)}
                        className="text-red-500 hover:text-red-700 text-xs font-semibold"
                      >
                        حذف
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* modal ساخت صفحه جدید */}
      {showNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h2 className="font-black text-surface-900 mb-5">صفحه جدید</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-surface-700 mb-1.5">عنوان صفحه</label>
                <input
                  autoFocus
                  value={newTitle}
                  onChange={(e) => {
                    setNewTitle(e.target.value)
                    setNewSlug(slugify(e.target.value))
                  }}
                  placeholder="مثال: درباره ما"
                  className="input w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-surface-700 mb-1.5">آدرس (slug)</label>
                <div className="flex items-center gap-1">
                  <span className="text-surface-400 text-sm">beewaz.ir/p/</span>
                  <input
                    value={newSlug}
                    onChange={(e) => setNewSlug(slugify(e.target.value))}
                    placeholder="about"
                    className="input flex-1 font-mono text-sm"
                    dir="ltr"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowNew(false)} className="btn btn-outline flex-1">انصراف</button>
              <button
                onClick={create}
                disabled={creating || !newTitle.trim()}
                className="btn btn-accent flex-1"
              >
                {creating ? 'در حال ساخت...' : 'ساخت و ویرایش'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
