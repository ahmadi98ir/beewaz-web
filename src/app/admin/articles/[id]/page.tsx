'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

interface Article {
  id: string; titleFa: string; slug: string; excerptFa: string | null
  bodyFa: string | null; category: string | null; status: string
  metaTitle: string | null; metaDesc: string | null
  tags: string[]; readingTime: number | null; publishedAt: string | null
}

const CATEGORIES = [
  { value: 'blog',           label: 'وبلاگ' },
  { value: 'knowledge_base', label: 'پایگاه دانش' },
]

function estimateReadTime(text: string) {
  return Math.max(1, Math.ceil(text.trim().split(/\s+/).length / 200))
}

export default function ArticleEditorPage() {
  const { id }  = useParams<{ id: string }>()
  const router  = useRouter()

  const [article, setArticle] = useState<Article | null>(null)
  const [tab,     setTab]     = useState<'write' | 'seo'>('write')
  const [saving,  setSaving]  = useState(false)
  const [saved,   setSaved]   = useState(false)

  // فرم
  const [title,    setTitle]    = useState('')
  const [slug,     setSlug]     = useState('')
  const [excerpt,  setExcerpt]  = useState('')
  const [body,     setBody]     = useState('')
  const [category, setCategory] = useState('blog')
  const [tagInput, setTagInput] = useState('')
  const [tags,     setTags]     = useState<string[]>([])
  const [metaTitle, setMetaTitle] = useState('')
  const [metaDesc,  setMetaDesc]  = useState('')

  useEffect(() => {
    if (id === 'new') { setArticle({ id: 'new', titleFa: '', slug: '', excerptFa: '', bodyFa: '', category: 'blog', status: 'draft', metaTitle: null, metaDesc: null, tags: [], readingTime: null, publishedAt: null }); return }
    fetch(`/api/admin/articles/${id}`)
      .then((r) => r.ok ? r.json() as Promise<{ article: Article }> : null)
      .then((d) => {
        if (!d) { router.push('/admin/articles'); return }
        const a = d.article
        setArticle(a)
        setTitle(a.titleFa); setSlug(a.slug)
        setExcerpt(a.excerptFa ?? ''); setBody(a.bodyFa ?? '')
        setCategory(a.category ?? 'blog')
        setTags(a.tags ?? [])
        setMetaTitle(a.metaTitle ?? ''); setMetaDesc(a.metaDesc ?? '')
      })
  }, [id, router])

  const slugify = (s: string) =>
    s.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w؀-ۿ-]/g, '')

  const save = async (status?: string) => {
    if (saving) return
    setSaving(true)

    const payload = {
      titleFa:     title,
      slug:        slug || slugify(title),
      excerptFa:   excerpt || undefined,
      bodyFa:      body,
      category,
      tags,
      readingTime: estimateReadTime(body),
      metaTitle:   metaTitle || undefined,
      metaDesc:    metaDesc  || undefined,
      ...(status && { status }),
    }

    let r: Response
    if (id === 'new') {
      r = await fetch('/api/admin/articles', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (r.ok) {
        const d = await r.json() as { article: Article }
        router.replace(`/admin/articles/${d.article.id}`)
        return
      }
    } else {
      r = await fetch(`/api/admin/articles/${id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    }

    if (r.ok) { setSaved(true); setTimeout(() => setSaved(false), 2500) }
    setSaving(false)
  }

  const addTag = () => {
    const t = tagInput.trim()
    if (t && !tags.includes(t)) setTags((p) => [...p, t])
    setTagInput('')
  }

  if (!article) return (
    <div className="flex-1 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="flex-1 overflow-y-auto flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-surface-200 px-6 py-3 flex items-center gap-4 sticky top-0 z-10">
        <Link href="/admin/articles" className="text-surface-400 hover:text-surface-700 transition-colors">
          <svg viewBox="0 0 20 20" className="w-5 h-5" fill="currentColor"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
        </Link>
        <div className="flex-1">
          <input
            value={title}
            onChange={(e) => { setTitle(e.target.value); if (!slug) setSlug(slugify(e.target.value)) }}
            className="text-base font-black text-surface-900 bg-transparent border-0 outline-none w-full"
            placeholder="عنوان مقاله..."
          />
          <div className="flex items-center gap-1 text-xs text-surface-400">
            <span>bz360.ir/blog/</span>
            <input
              value={slug}
              onChange={(e) => setSlug(slugify(e.target.value))}
              className="font-mono bg-transparent border-0 outline-none text-surface-400"
              dir="ltr"
            />
          </div>
        </div>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="input text-sm py-2 px-3">
          {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
        {saved && <span className="text-xs text-green-600 font-semibold">✅ ذخیره شد</span>}
        <button onClick={() => void save()} disabled={saving} className="btn btn-outline text-sm py-2 px-4">
          {saving ? '...' : 'پیش‌نویس'}
        </button>
        <button onClick={() => void save('published')} disabled={saving} className="btn btn-accent text-sm py-2 px-4">
          انتشار
        </button>
      </header>

      <div className="flex flex-1 min-h-0">
        {/* ویرایشگر اصلی */}
        <div className="flex-1 p-6 space-y-4 overflow-y-auto">
          {/* تب */}
          <div className="flex gap-1 bg-surface-100 rounded-xl p-1 w-fit">
            {(['write', 'seo'] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${tab === t ? 'bg-white text-surface-900 shadow-sm' : 'text-surface-500 hover:text-surface-700'}`}>
                {t === 'write' ? '✏️ نوشتن' : '🔍 SEO'}
              </button>
            ))}
          </div>

          {tab === 'write' && (
            <>
              {/* خلاصه */}
              <div>
                <label className="block text-xs font-semibold text-surface-500 mb-1.5">خلاصه مقاله</label>
                <textarea
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  className="input w-full text-sm resize-none"
                  rows={2}
                  placeholder="یک یا دو جمله معرفی..."
                  maxLength={300}
                />
              </div>

              {/* متن اصلی */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-surface-500">متن مقاله</label>
                  <span className="text-xs text-surface-400">~{estimateReadTime(body)} دقیقه مطالعه</span>
                </div>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="input w-full text-sm resize-none font-mono leading-relaxed"
                  rows={24}
                  placeholder="محتوای مقاله را اینجا بنویسید... (HTML پشتیبانی می‌شود)"
                />
              </div>
            </>
          )}

          {tab === 'seo' && (
            <div className="bg-white rounded-2xl border border-surface-200 p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-surface-700 mb-1.5">عنوان SEO</label>
                <input value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} className="input w-full text-sm" placeholder="عنوان در گوگل" maxLength={60} />
                <p className="text-xs text-surface-400 mt-1">{metaTitle.length}/60</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-surface-700 mb-1.5">توضیحات متا</label>
                <textarea value={metaDesc} onChange={(e) => setMetaDesc(e.target.value)} className="input w-full text-sm resize-none" rows={3} placeholder="توضیح کوتاه برای موتور جستجو" maxLength={160} />
                <p className="text-xs text-surface-400 mt-1">{metaDesc.length}/160</p>
              </div>
              <button onClick={() => void save()} disabled={saving} className="btn btn-primary w-full">ذخیره SEO</button>
            </div>
          )}
        </div>

        {/* سایدبار */}
        <aside className="w-64 border-s border-surface-200 p-5 space-y-5 overflow-y-auto bg-surface-50">
          {/* تگ‌ها */}
          <div>
            <h3 className="text-xs font-bold text-surface-500 uppercase tracking-wide mb-2">تگ‌ها</h3>
            <div className="flex gap-2 mb-2">
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }}
                className="input flex-1 text-xs py-1.5"
                placeholder="تگ جدید..."
              />
              <button onClick={addTag} className="btn btn-outline text-xs py-1.5 px-2">+</button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {tags.map((t) => (
                <span key={t} className="inline-flex items-center gap-1 bg-brand-50 text-brand-700 border border-brand-200 rounded-lg px-2 py-0.5 text-xs">
                  {t}
                  <button onClick={() => setTags((p) => p.filter((x) => x !== t))} className="hover:text-red-500">×</button>
                </span>
              ))}
            </div>
          </div>

          {/* آمار */}
          <div>
            <h3 className="text-xs font-bold text-surface-500 uppercase tracking-wide mb-2">آمار</h3>
            <div className="space-y-1.5 text-xs text-surface-600">
              <div className="flex justify-between"><span>تعداد کلمات</span><span className="font-bold">{body.trim().split(/\s+/).filter(Boolean).length}</span></div>
              <div className="flex justify-between"><span>زمان مطالعه</span><span className="font-bold">~{estimateReadTime(body)} دقیقه</span></div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
