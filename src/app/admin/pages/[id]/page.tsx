'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import type { Block, BlockType } from '@/lib/db/schema'
import { RichTextEditor } from '@/components/admin/rich-text-editor'

// ── Block definitions ──────────────────────────────────────────────────────────

const BLOCK_TYPES: { type: BlockType; label: string; icon: string; defaults: Record<string, unknown> }[] = [
  { type: 'hero',     label: 'Hero',       icon: '🦸', defaults: { title: '', subtitle: '', ctaText: '', ctaUrl: '' } },
  { type: 'text',     label: 'متن',        icon: '📝', defaults: { content: '' } },
  { type: 'image',    label: 'تصویر',      icon: '🖼️', defaults: { src: '', alt: '', caption: '' } },
  { type: 'gallery',  label: 'گالری',      icon: '🖼️', defaults: { images: [{ src: '', alt: '' }] } },
  { type: 'cta',      label: 'دکمه CTA',  icon: '🔗', defaults: { title: '', subtitle: '', btnText: '', btnUrl: '' } },
  { type: 'faq',      label: 'FAQ',        icon: '❓', defaults: { title: '', items: [{ q: '', a: '' }] } },
  { type: 'features', label: 'ویژگی‌ها',  icon: '⭐', defaults: { title: '', items: [{ icon: '✅', title: '', desc: '' }] } },
  { type: 'divider',  label: 'خط جداکننده', icon: '➖', defaults: {} },
]

function nanoid() {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID().slice(0, 8)
    : Math.random().toString(36).slice(2, 10)
}

// ── Block Editors ──────────────────────────────────────────────────────────────

function HeroEditor({ props, onChange }: { props: Record<string, unknown>; onChange: (p: Record<string, unknown>) => void }) {
  const p = props as { title?: string; subtitle?: string; ctaText?: string; ctaUrl?: string }
  return (
    <div className="space-y-3">
      <input className="input w-full text-sm" placeholder="عنوان اصلی" value={p.title ?? ''} onChange={(e) => onChange({ ...props, title: e.target.value })} />
      <textarea className="input w-full text-sm resize-none" rows={2} placeholder="زیرعنوان" value={p.subtitle ?? ''} onChange={(e) => onChange({ ...props, subtitle: e.target.value })} />
      <div className="grid grid-cols-2 gap-3">
        <input className="input text-sm" placeholder="متن دکمه" value={p.ctaText ?? ''} onChange={(e) => onChange({ ...props, ctaText: e.target.value })} />
        <input className="input text-sm font-mono" placeholder="لینک (/shop)" value={p.ctaUrl ?? ''} onChange={(e) => onChange({ ...props, ctaUrl: e.target.value })} />
      </div>
    </div>
  )
}

function TextEditor({ props, onChange }: { props: Record<string, unknown>; onChange: (p: Record<string, unknown>) => void }) {
  const p = props as { content?: string }
  return (
    <RichTextEditor
      value={p.content ?? ''}
      onChange={(content) => onChange({ ...props, content })}
      placeholder="متن صفحه را اینجا بنویسید..."
    />
  )
}

function BlockImageUploader({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [progress, setProgress] = useState<number | null>(null)
  const [errMsg, setErrMsg] = useState('')

  const upload = useCallback((file: File) => {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) { setErrMsg('فقط JPG، PNG یا WebP مجاز است'); return }
    if (file.size > 5 * 1024 * 1024) { setErrMsg('حجم فایل نباید بیشتر از ۵ مگابایت باشد'); return }
    setErrMsg('')
    setProgress(5)

    const fd = new FormData()
    fd.append('file', file)

    const xhr = new XMLHttpRequest()
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 90))
    }
    xhr.onload = () => {
      if (xhr.status === 200) {
        const { url } = JSON.parse(xhr.responseText) as { url: string }
        setProgress(100)
        setTimeout(() => { setProgress(null); onChange(url) }, 300)
      } else {
        const err = JSON.parse(xhr.responseText) as { error?: string }
        setErrMsg(err.error ?? 'خطا در آپلود')
        setProgress(null)
      }
    }
    xhr.onerror = () => { setErrMsg('خطا در اتصال'); setProgress(null) }
    xhr.open('POST', '/api/admin/upload')
    xhr.send(fd)
  }, [onChange])

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) upload(file)
    e.target.value = ''
  }

  const hasImage = value && (value.startsWith('/') || value.startsWith('http'))

  return (
    <div className="space-y-2">
      {hasImage ? (
        <div className="relative rounded-xl overflow-hidden border border-surface-200 bg-surface-50 aspect-video max-h-44 group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors" />
          <div className="absolute bottom-2 inset-x-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button type="button" onClick={() => inputRef.current?.click()} className="flex-1 px-3 py-1.5 rounded-lg bg-white/90 hover:bg-white text-surface-800 text-xs font-semibold transition-colors">
              تغییر تصویر
            </button>
            <button type="button" onClick={() => onChange('')} className="px-3 py-1.5 rounded-lg bg-red-500/90 hover:bg-red-500 text-white text-xs font-semibold transition-colors">
              حذف
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragEnter={(e) => { e.preventDefault(); setDragging(true) }}
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); const file = e.dataTransfer.files[0]; if (file) upload(file) }}
          onClick={() => !progress && inputRef.current?.click()}
          className={`relative flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed cursor-pointer transition-all py-6 px-4 select-none ${
            dragging ? 'border-brand-400 bg-brand-50' : 'border-surface-200 bg-surface-50 hover:border-brand-300 hover:bg-brand-50/40'
          }`}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={`w-6 h-6 ${dragging ? 'text-brand-600' : 'text-surface-400'}`}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
          <p className={`text-xs font-semibold ${dragging ? 'text-brand-700' : 'text-surface-500'}`}>
            {dragging ? 'رها کنید...' : 'برای آپلود کلیک کنید یا فایل را بکشید'}
          </p>
          <p className="text-[11px] text-surface-400">JPG، PNG، WebP — حداکثر ۵ مگابایت</p>
          {progress !== null && (
            <div className="absolute inset-x-3 bottom-2">
              <div className="h-1 rounded-full bg-surface-200 overflow-hidden">
                <div className="h-full rounded-full bg-brand-600 transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}
        </div>
      )}

      <input ref={inputRef} type="file" accept=".jpg,.jpeg,.png,.webp" className="hidden" onChange={onFileChange} />
      {errMsg && <p className="text-xs text-red-600">{errMsg}</p>}
      <input className="input w-full text-xs font-mono" dir="ltr" placeholder="یا آدرس تصویر (URL) را وارد کنید" value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  )
}

function ImageEditor({ props, onChange }: { props: Record<string, unknown>; onChange: (p: Record<string, unknown>) => void }) {
  const p = props as { src?: string; alt?: string; caption?: string }
  return (
    <div className="space-y-3">
      <BlockImageUploader value={p.src ?? ''} onChange={(url) => onChange({ ...props, src: url })} />
      <input className="input w-full text-sm" placeholder="متن جایگزین (alt)" value={p.alt ?? ''} onChange={(e) => onChange({ ...props, alt: e.target.value })} />
      <input className="input w-full text-sm" placeholder="کپشن (اختیاری)" value={p.caption ?? ''} onChange={(e) => onChange({ ...props, caption: e.target.value })} />
    </div>
  )
}

function CtaEditor({ props, onChange }: { props: Record<string, unknown>; onChange: (p: Record<string, unknown>) => void }) {
  const p = props as { title?: string; subtitle?: string; btnText?: string; btnUrl?: string }
  return (
    <div className="space-y-3">
      <input className="input w-full text-sm" placeholder="عنوان" value={p.title ?? ''} onChange={(e) => onChange({ ...props, title: e.target.value })} />
      <input className="input w-full text-sm" placeholder="زیرعنوان" value={p.subtitle ?? ''} onChange={(e) => onChange({ ...props, subtitle: e.target.value })} />
      <div className="grid grid-cols-2 gap-3">
        <input className="input text-sm" placeholder="متن دکمه" value={p.btnText ?? ''} onChange={(e) => onChange({ ...props, btnText: e.target.value })} />
        <input className="input text-sm font-mono" placeholder="لینک" value={p.btnUrl ?? ''} onChange={(e) => onChange({ ...props, btnUrl: e.target.value })} />
      </div>
    </div>
  )
}

function GalleryEditor({ props, onChange }: { props: Record<string, unknown>; onChange: (p: Record<string, unknown>) => void }) {
  const p = props as { images?: { src: string; alt?: string }[] }
  const images = p.images ?? []
  const setImages = (next: { src: string; alt?: string }[]) => onChange({ ...props, images: next })
  return (
    <div className="space-y-3">
      {images.map((img, i) => (
        <div key={i} className="border border-surface-100 rounded-xl p-3 space-y-2">
          <div className="flex items-start gap-2">
            <div className="flex-1">
              <BlockImageUploader value={img.src} onChange={(url) => setImages(images.map((it, j) => (j === i ? { ...it, src: url } : it)))} />
            </div>
            <button onClick={() => setImages(images.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600 px-2 pt-2">✕</button>
          </div>
          <input className="input w-full text-sm" placeholder="alt" value={img.alt ?? ''} onChange={(e) => setImages(images.map((it, j) => (j === i ? { ...it, alt: e.target.value } : it)))} />
        </div>
      ))}
      <button onClick={() => setImages([...images, { src: '', alt: '' }])} className="text-xs text-brand-600 hover:text-brand-700 font-semibold">+ افزودن تصویر</button>
    </div>
  )
}

function FaqEditor({ props, onChange }: { props: Record<string, unknown>; onChange: (p: Record<string, unknown>) => void }) {
  const p = props as { title?: string; items?: { q: string; a: string }[] }
  const items = p.items ?? []
  const setItems = (next: { q: string; a: string }[]) => onChange({ ...props, items: next })
  return (
    <div className="space-y-3">
      <input className="input w-full text-sm" placeholder="عنوان بخش (اختیاری)" value={p.title ?? ''} onChange={(e) => onChange({ ...props, title: e.target.value })} />
      {items.map((item, i) => (
        <div key={i} className="border border-surface-100 rounded-xl p-3 space-y-2">
          <div className="flex items-center gap-2">
            <input className="input flex-1 text-sm" placeholder="سؤال" value={item.q} onChange={(e) => setItems(items.map((it, j) => (j === i ? { ...it, q: e.target.value } : it)))} />
            <button onClick={() => setItems(items.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600 px-2">✕</button>
          </div>
          <textarea className="input w-full text-sm resize-none" rows={2} placeholder="پاسخ" value={item.a} onChange={(e) => setItems(items.map((it, j) => (j === i ? { ...it, a: e.target.value } : it)))} />
        </div>
      ))}
      <button onClick={() => setItems([...items, { q: '', a: '' }])} className="text-xs text-brand-600 hover:text-brand-700 font-semibold">+ افزودن سؤال</button>
    </div>
  )
}

function FeaturesEditor({ props, onChange }: { props: Record<string, unknown>; onChange: (p: Record<string, unknown>) => void }) {
  const p = props as { title?: string; items?: { icon?: string; title: string; desc?: string }[] }
  const items = p.items ?? []
  const setItems = (next: { icon?: string; title: string; desc?: string }[]) => onChange({ ...props, items: next })
  return (
    <div className="space-y-3">
      <input className="input w-full text-sm" placeholder="عنوان بخش (اختیاری)" value={p.title ?? ''} onChange={(e) => onChange({ ...props, title: e.target.value })} />
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <input className="input w-14 text-sm text-center" placeholder="🔧" value={item.icon ?? ''} onChange={(e) => setItems(items.map((it, j) => (j === i ? { ...it, icon: e.target.value } : it)))} />
          <input className="input flex-1 text-sm" placeholder="عنوان" value={item.title} onChange={(e) => setItems(items.map((it, j) => (j === i ? { ...it, title: e.target.value } : it)))} />
          <input className="input flex-1 text-sm" placeholder="توضیح" value={item.desc ?? ''} onChange={(e) => setItems(items.map((it, j) => (j === i ? { ...it, desc: e.target.value } : it)))} />
          <button onClick={() => setItems(items.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600 px-2">✕</button>
        </div>
      ))}
      <button onClick={() => setItems([...items, { icon: '✅', title: '', desc: '' }])} className="text-xs text-brand-600 hover:text-brand-700 font-semibold">+ افزودن ویژگی</button>
    </div>
  )
}

function BlockEditor({ block, onChange, onDelete, onMove, isFirst, isLast }: {
  block: Block
  onChange: (b: Block) => void
  onDelete: () => void
  onMove: (dir: 'up' | 'down') => void
  isFirst: boolean; isLast: boolean
}) {
  const def = BLOCK_TYPES.find((b) => b.type === block.type)
  const [collapsed, setCollapsed] = useState(false)

  const renderEditor = () => {
    switch (block.type) {
      case 'hero':    return <HeroEditor  props={block.props} onChange={(p) => onChange({ ...block, props: p })} />
      case 'text':    return <TextEditor  props={block.props} onChange={(p) => onChange({ ...block, props: p })} />
      case 'image':    return <ImageEditor    props={block.props} onChange={(p) => onChange({ ...block, props: p })} />
      case 'gallery':  return <GalleryEditor  props={block.props} onChange={(p) => onChange({ ...block, props: p })} />
      case 'cta':      return <CtaEditor      props={block.props} onChange={(p) => onChange({ ...block, props: p })} />
      case 'faq':      return <FaqEditor      props={block.props} onChange={(p) => onChange({ ...block, props: p })} />
      case 'features': return <FeaturesEditor props={block.props} onChange={(p) => onChange({ ...block, props: p })} />
      case 'divider':  return <p className="text-sm text-surface-400 text-center py-2">─── خط جداکننده ───</p>
      default:         return <p className="text-xs text-surface-400">ویرایشگر این بلاک در دست ساخت است</p>
    }
  }

  return (
    <div className="bg-white border border-surface-200 rounded-2xl overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3 bg-surface-50 border-b border-surface-100">
        <span className="text-lg">{def?.icon}</span>
        <span className="font-semibold text-surface-800 text-sm flex-1">{def?.label}</span>
        <div className="flex items-center gap-1">
          {!isFirst && (
            <button onClick={() => onMove('up')} className="p-1.5 text-surface-400 hover:text-surface-700 hover:bg-white rounded-lg transition-colors" title="بالاتر">↑</button>
          )}
          {!isLast && (
            <button onClick={() => onMove('down')} className="p-1.5 text-surface-400 hover:text-surface-700 hover:bg-white rounded-lg transition-colors" title="پایین‌تر">↓</button>
          )}
          <button onClick={() => setCollapsed((c) => !c)} className="p-1.5 text-surface-400 hover:text-surface-700 hover:bg-white rounded-lg transition-colors">
            {collapsed ? '▼' : '▲'}
          </button>
          <button onClick={onDelete} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="حذف">
            <svg viewBox="0 0 20 20" className="w-4 h-4" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zm-1 6a1 1 0 012 0v5a1 1 0 01-2 0V8zm4 0a1 1 0 012 0v5a1 1 0 01-2 0V8z" clipRule="evenodd"/></svg>
          </button>
        </div>
      </div>
      {!collapsed && <div className="p-4">{renderEditor()}</div>}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

interface PageData {
  id: string; slug: string; titleFa: string; status: string
  blocks: Block[]; metaTitle: string | null; metaDesc: string | null; ogImage: string | null
}

export default function PageEditorPage() {
  const { id } = useParams<{ id: string }>()
  const router  = useRouter()

  const [page,    setPage]    = useState<PageData | null>(null)
  const [blocks,  setBlocks]  = useState<Block[]>([])
  const [title,   setTitle]   = useState('')
  const [slug,    setSlug]    = useState('')
  const [metaTitle, setMetaTitle] = useState('')
  const [metaDesc,  setMetaDesc]  = useState('')
  const [ogImage,   setOgImage]   = useState('')
  const [saving,    setSaving]    = useState(false)
  const [saved,     setSaved]     = useState(false)
  const [tab,       setTab]       = useState<'content' | 'seo'>('content')
  const [showAdd,   setShowAdd]   = useState(false)
  const [showAi,    setShowAi]    = useState(false)
  const [aiTopic,   setAiTopic]   = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError,   setAiError]   = useState('')

  useEffect(() => {
    fetch(`/api/admin/pages/${id}`)
      .then((r) => r.ok ? r.json() as Promise<{ page: PageData }> : null)
      .then((d) => {
        if (!d) { router.push('/admin/pages'); return }
        setPage(d.page)
        setBlocks(d.page.blocks ?? [])
        setTitle(d.page.titleFa)
        setSlug(d.page.slug)
        setMetaTitle(d.page.metaTitle ?? '')
        setMetaDesc(d.page.metaDesc ?? '')
        setOgImage(d.page.ogImage ?? '')
      })
  }, [id, router])

  const save = async (status?: 'draft' | 'published') => {
    if (saving) return
    setSaving(true)
    const r = await fetch(`/api/admin/pages/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        titleFa: title, slug, blocks,
        metaTitle: metaTitle || undefined,
        metaDesc:  metaDesc  || undefined,
        ogImage:   ogImage   || undefined,
        ...(status && { status }),
      }),
    })
    if (r.ok) { setSaved(true); setTimeout(() => setSaved(false), 2000) }
    setSaving(false)
  }

  const generateWithAi = async () => {
    if (!aiTopic.trim() || aiLoading) return
    setAiLoading(true)
    setAiError('')
    try {
      const r = await fetch(`/api/admin/pages/${id}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: aiTopic.trim() }),
      })
      const d = await r.json() as { blocks?: Block[]; metaTitle?: string; metaDesc?: string; error?: string }
      if (!r.ok || !d.blocks) { setAiError(d.error ?? 'خطا در تولید محتوا'); return }
      setBlocks((prev) => [...prev, ...d.blocks as Block[]])
      if (d.metaTitle && !metaTitle) setMetaTitle(d.metaTitle)
      if (d.metaDesc && !metaDesc) setMetaDesc(d.metaDesc)
      setShowAi(false)
      setAiTopic('')
    } catch {
      setAiError('خطا در ارتباط با سرور')
    } finally {
      setAiLoading(false)
    }
  }

  const addBlock = (type: BlockType) => {
    const def = BLOCK_TYPES.find((b) => b.type === type)!
    setBlocks((prev) => [...prev, { id: nanoid(), type, props: { ...def.defaults } }])
    setShowAdd(false)
  }

  const updateBlock = (idx: number, block: Block) =>
    setBlocks((prev) => prev.map((b, i) => (i === idx ? block : b)))

  const deleteBlock = (idx: number) =>
    setBlocks((prev) => prev.filter((_, i) => i !== idx))

  const moveBlock = (idx: number, dir: 'up' | 'down') => {
    setBlocks((prev) => {
      const next = [...prev]
      const swap = dir === 'up' ? idx - 1 : idx + 1
      const tmp = next[idx] as Block
      next[idx] = next[swap] as Block
      next[swap] = tmp
      return next
    })
  }

  if (!page) return (
    <div className="flex-1 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <header className="bg-white border-b border-surface-200 px-6 py-3 flex items-center gap-4 sticky top-0 z-10">
        <Link href="/admin/pages" className="text-surface-400 hover:text-surface-700 transition-colors">
          <svg viewBox="0 0 20 20" className="w-5 h-5" fill="currentColor"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
        </Link>
        <div className="flex-1">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-base font-black text-surface-900 bg-transparent border-0 outline-none w-full"
            placeholder="عنوان صفحه..."
          />
          <div className="flex items-center gap-1 text-xs text-surface-400">
            <span>beewaz.ir/p/</span>
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="font-mono bg-transparent border-0 outline-none text-surface-400"
              dir="ltr"
            />
          </div>
        </div>
        <span className={`text-xs px-2 py-1 rounded-lg ${page.status === 'published' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
          {page.status === 'published' ? 'منتشرشده' : 'پیش‌نویس'}
        </span>
        {saved && <span className="text-xs text-green-600 font-semibold">✅ ذخیره شد</span>}
        <Link href={`/admin/pages/${id}/preview`} target="_blank" className="btn btn-outline text-sm py-2 px-4">
          پیش‌نمایش
        </Link>
        <button onClick={() => void save()} disabled={saving} className="btn btn-outline text-sm py-2 px-4">
          {saving ? 'ذخیره...' : 'ذخیره پیش‌نویس'}
        </button>
        <button onClick={() => void save('published')} disabled={saving} className="btn btn-accent text-sm py-2 px-4">
          انتشار
        </button>
      </header>

      <div className="p-6 max-w-3xl mx-auto space-y-4">
        {/* Tabs */}
        <div className="flex gap-1 bg-surface-100 rounded-xl p-1 w-fit">
          {(['content', 'seo'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${tab === t ? 'bg-white text-surface-900 shadow-sm' : 'text-surface-500 hover:text-surface-700'}`}
            >
              {t === 'content' ? 'محتوا' : 'SEO'}
            </button>
          ))}
        </div>

        {tab === 'content' && (
          <>
            {/* تولید محتوا با هوش مصنوعی */}
            {showAi ? (
              <div className="bg-gradient-to-br from-brand-50 to-white border-2 border-brand-200 rounded-2xl p-5 space-y-3">
                <p className="text-sm font-semibold text-surface-800">✨ موضوع صفحه را بنویس تا هوش مصنوعی محتوا را برایت بسازد:</p>
                <textarea
                  className="input w-full text-sm resize-none"
                  rows={2}
                  placeholder="مثلاً: راهنمای انتخاب دزدگیر مرکزی برای آپارتمان"
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                />
                {aiError && <p className="text-xs text-red-600">{aiError}</p>}
                <div className="flex items-center gap-2">
                  <button onClick={() => void generateWithAi()} disabled={aiLoading || !aiTopic.trim()} className="btn btn-accent text-sm py-2 px-4">
                    {aiLoading ? 'در حال تولید...' : 'تولید محتوا'}
                  </button>
                  <button onClick={() => { setShowAi(false); setAiError('') }} className="text-xs text-surface-400 hover:text-surface-600">انصراف</button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowAi(true)}
                className="w-full border-2 border-dashed border-brand-300 bg-brand-50/40 rounded-2xl py-4 text-brand-600 hover:bg-brand-50 transition-all flex items-center justify-center gap-2 text-sm font-semibold"
              >
                ✨ تولید محتوا با هوش مصنوعی
              </button>
            )}

            {/* بلاک‌ها */}
            <div className="space-y-3">
              {blocks.map((block, idx) => (
                <BlockEditor
                  key={block.id}
                  block={block}
                  onChange={(b) => updateBlock(idx, b)}
                  onDelete={() => deleteBlock(idx)}
                  onMove={(dir) => moveBlock(idx, dir)}
                  isFirst={idx === 0}
                  isLast={idx === blocks.length - 1}
                />
              ))}
            </div>

            {/* افزودن بلاک */}
            {showAdd ? (
              <div className="bg-white border-2 border-dashed border-brand-300 rounded-2xl p-5">
                <p className="text-sm font-semibold text-surface-700 mb-3">نوع بلاک را انتخاب کنید:</p>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {BLOCK_TYPES.map((bt) => (
                    <button
                      key={bt.type}
                      onClick={() => addBlock(bt.type)}
                      className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-surface-200 hover:border-brand-400 hover:bg-brand-50 transition-all text-center"
                    >
                      <span className="text-2xl">{bt.icon}</span>
                      <span className="text-xs font-semibold text-surface-700">{bt.label}</span>
                    </button>
                  ))}
                </div>
                <button onClick={() => setShowAdd(false)} className="mt-3 text-xs text-surface-400 hover:text-surface-600 w-full text-center">انصراف</button>
              </div>
            ) : (
              <button
                onClick={() => setShowAdd(true)}
                className="w-full border-2 border-dashed border-surface-200 rounded-2xl py-5 text-surface-400 hover:border-brand-400 hover:text-brand-600 transition-all flex items-center justify-center gap-2 text-sm font-semibold"
              >
                <svg viewBox="0 0 20 20" className="w-5 h-5" fill="currentColor"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd"/></svg>
                افزودن بلاک جدید
              </button>
            )}
          </>
        )}

        {tab === 'seo' && (
          <div className="bg-white rounded-2xl border border-surface-200 p-6 space-y-4">
            <h2 className="font-bold text-surface-900">تنظیمات SEO</h2>
            <div>
              <label className="block text-sm font-semibold text-surface-700 mb-1.5">عنوان صفحه (meta title)</label>
              <input value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} className="input w-full text-sm" placeholder="عنوانی که در گوگل نمایش داده می‌شود" maxLength={60} />
              <p className="text-xs text-surface-400 mt-1">{metaTitle.length}/60 کاراکتر</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-surface-700 mb-1.5">توضیحات متا (meta description)</label>
              <textarea value={metaDesc} onChange={(e) => setMetaDesc(e.target.value)} className="input w-full text-sm resize-none" rows={3} placeholder="توضیح کوتاه صفحه برای موتورهای جستجو" maxLength={160} />
              <p className="text-xs text-surface-400 mt-1">{metaDesc.length}/160 کاراکتر</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-surface-700 mb-1.5">تصویر Open Graph (og:image)</label>
              <input value={ogImage} onChange={(e) => setOgImage(e.target.value)} className="input w-full text-sm font-mono" dir="ltr" placeholder="https://cdn.beewaz.ir/..." />
              <p className="text-xs text-surface-400 mt-1">تصویری که هنگام اشتراک‌گذاری لینک در شبکه‌های اجتماعی نمایش داده می‌شود</p>
            </div>
            <button onClick={() => void save()} disabled={saving} className="btn btn-primary w-full">ذخیره SEO</button>
          </div>
        )}
      </div>
    </div>
  )
}
