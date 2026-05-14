'use client'

import { useState, useEffect, useCallback } from 'react'

// ── Types ─────────────────────────────────────────────────────────────────────

interface ContentBlock {
  id: string
  page: string
  key: string
  valueFa: string | null
  type: string
  label: string
  hint: string | null
  isActive: boolean
  position: number
}

const PAGE_LABELS: Record<string, { label: string; icon: string; desc: string }> = {
  global:  { label: 'سراسری',      icon: '🌐', desc: 'نوار اطلاع‌رسانی، هدر و فوتر' },
  home:    { label: 'صفحه اصلی',   icon: '🏠', desc: 'Hero، محصولات ویژه، CTA، مراحل' },
  about:   { label: 'درباره ما',   icon: '🏢', desc: 'داستان، تیم، آمار شرکت' },
  contact: { label: 'تماس با ما', icon: '📞', desc: 'اطلاعات تماس، فرم پیام' },
  shop:    { label: 'فروشگاه',     icon: '🛒', desc: 'بنرها، دسته‌بندی‌های ویژه' },
}

// ── Field ─────────────────────────────────────────────────────────────────────

function ContentField({
  block,
  value,
  onChange,
}: {
  block: ContentBlock
  value: string
  onChange: (key: string, val: string) => void
}) {
  if (block.type === 'boolean') {
    return (
      <div className="flex items-center justify-between bg-surface-50 rounded-xl p-4">
        <div>
          <p className="text-sm font-semibold text-surface-800">{block.label}</p>
          {block.hint && <p className="text-xs text-surface-400 mt-0.5">{block.hint}</p>}
        </div>
        <button
          type="button"
          onClick={() => onChange(block.key, value === 'true' ? 'false' : 'true')}
          className={[
            'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
            value === 'true' ? 'bg-brand-500' : 'bg-surface-200',
          ].join(' ')}
        >
          <span className={['inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform', value === 'true' ? 'translate-x-6' : 'translate-x-1'].join(' ')} />
        </button>
      </div>
    )
  }

  if (block.type === 'color') {
    return (
      <div>
        <label className="block text-sm font-semibold text-surface-700 mb-1.5">{block.label}</label>
        <div className="flex gap-2 items-center">
          <input type="color" value={value || '#f59e0b'} onChange={(e) => onChange(block.key, e.target.value)} className="h-10 w-14 rounded-lg border border-surface-200 cursor-pointer p-1" />
          <input type="text" value={value} onChange={(e) => onChange(block.key, e.target.value)} className="input flex-1 font-mono text-sm" placeholder="#f59e0b" />
        </div>
      </div>
    )
  }

  if (block.type === 'image') {
    return (
      <div>
        <label className="block text-sm font-semibold text-surface-700 mb-1.5">{block.label}</label>
        <div className="flex gap-2">
          <input type="text" value={value} onChange={(e) => onChange(block.key, e.target.value)} className="input flex-1 text-sm" dir="ltr" placeholder="https://... یا /images/..." />
          {value && (
            <img src={value} alt="" className="h-10 w-16 rounded-lg object-cover border border-surface-200 flex-shrink-0" onError={(e) => { (e.target as HTMLImageElement).style.display='none' }} />
          )}
        </div>
        {block.hint && <p className="text-xs text-surface-400 mt-1">{block.hint}</p>}
      </div>
    )
  }

  if (block.type === 'json') {
    return (
      <div>
        <label className="block text-sm font-semibold text-surface-700 mb-1.5">{block.label}</label>
        <textarea
          value={value}
          onChange={(e) => onChange(block.key, e.target.value)}
          rows={6}
          className="input w-full font-mono text-xs resize-y"
          dir="ltr"
          spellCheck={false}
        />
        {block.hint && <p className="text-xs text-surface-400 mt-1">{block.hint}</p>}
      </div>
    )
  }

  if (block.type === 'richtext' || block.key.includes('text') || block.key.includes('subtitle') || block.key.includes('story')) {
    return (
      <div>
        <label className="block text-sm font-semibold text-surface-700 mb-1.5">{block.label}</label>
        <textarea
          value={value}
          onChange={(e) => onChange(block.key, e.target.value)}
          rows={4}
          className="input w-full resize-y text-sm"
        />
        {block.hint && <p className="text-xs text-surface-400 mt-1">{block.hint}</p>}
      </div>
    )
  }

  return (
    <div>
      <label className="block text-sm font-semibold text-surface-700 mb-1.5">{block.label}</label>
      <input
        type={block.type === 'url' ? 'url' : 'text'}
        value={value}
        onChange={(e) => onChange(block.key, e.target.value)}
        className="input w-full text-sm"
        dir={block.type === 'url' ? 'ltr' : undefined}
        placeholder={block.hint ?? undefined}
      />
      {block.hint && <p className="text-xs text-surface-400 mt-1">{block.hint}</p>}
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function AdminContentPage() {
  const [activePage, setActivePage] = useState('global')
  const [blocks, setBlocks] = useState<ContentBlock[]>([])
  const [values, setValues] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'error'>('idle')
  const [initializing, setInitializing] = useState(false)

  const loadContent = useCallback(async (page: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/page-content?page=${page}`)
      const data = await res.json()
      if (data.content) {
        setBlocks(data.content)
        const vals: Record<string, string> = {}
        for (const b of data.content as ContentBlock[]) {
          vals[b.key] = b.valueFa ?? ''
        }
        setValues(vals)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadContent(activePage) }, [activePage, loadContent])

  const handleChange = (key: string, val: string) => {
    setValues((p) => ({ ...p, [key]: val }))
    setSaveStatus('idle')
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/page-content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ page: activePage, updates: values }),
      })
      setSaveStatus(res.ok ? 'saved' : 'error')
      if (res.ok) setTimeout(() => setSaveStatus('idle'), 3000)
    } catch {
      setSaveStatus('error')
    } finally {
      setSaving(false)
    }
  }

  const handleInit = async () => {
    setInitializing(true)
    try {
      await fetch('/api/admin/page-content', { method: 'POST' })
      await loadContent(activePage)
    } finally {
      setInitializing(false)
    }
  }

  const pageInfo = PAGE_LABELS[activePage] ?? { label: activePage, icon: '📄', desc: '' }

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <header className="bg-white border-b border-surface-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div>
          <h1 className="text-lg font-black text-surface-900">محتوای صفحات</h1>
          <p className="text-xs text-surface-400 mt-0.5">ویرایش متون، تصاویر و بنرهای هر صفحه</p>
        </div>
        <div className="flex items-center gap-3">
          {blocks.length === 0 && !loading && (
            <button onClick={handleInit} disabled={initializing} className="btn btn-outline text-sm py-2 px-4">
              {initializing ? 'در حال راه‌اندازی...' : '⚡ راه‌اندازی اولیه'}
            </button>
          )}
          <button onClick={handleSave} disabled={saving || blocks.length === 0} className="btn btn-primary py-2 px-5 text-sm">
            {saving ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ذخیره...
              </span>
            ) : '💾 ذخیره'}
          </button>
          {saveStatus === 'saved' && <span className="text-green-600 text-sm font-semibold">✓ ذخیره شد</span>}
          {saveStatus === 'error' && <span className="text-red-500 text-sm font-semibold">✗ خطا</span>}
        </div>
      </header>

      <div className="flex min-h-0">
        {/* Page nav */}
        <nav className="w-52 flex-shrink-0 border-l border-surface-200 bg-white p-3 space-y-1 sticky top-16 self-start">
          {Object.entries(PAGE_LABELS).map(([p, info]) => (
            <button
              key={p}
              onClick={() => setActivePage(p)}
              className={[
                'w-full flex items-start gap-2.5 px-3 py-2.5 rounded-xl text-sm text-start transition-all',
                activePage === p ? 'bg-brand-50 text-brand-700 font-semibold' : 'text-surface-600 hover:bg-surface-50',
              ].join(' ')}
            >
              <span className="text-base mt-0.5">{info.icon}</span>
              <div>
                <p className="font-medium">{info.label}</p>
                <p className="text-[10px] text-surface-400 leading-tight">{info.desc}</p>
              </div>
            </button>
          ))}
        </nav>

        {/* Content */}
        <div className="flex-1 p-6">
          {loading ? (
            <div className="flex items-center justify-center h-48 text-surface-400 text-sm">در حال بارگذاری...</div>
          ) : blocks.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
              <div className="text-5xl">{pageInfo.icon}</div>
              <p className="text-surface-500 text-sm">محتوایی برای این صفحه تعریف نشده</p>
              <button onClick={handleInit} disabled={initializing} className="btn btn-primary">
                {initializing ? 'در حال راه‌اندازی...' : 'راه‌اندازی محتوای پیش‌فرض'}
              </button>
            </div>
          ) : (
            <div className="max-w-2xl space-y-4">
              {/* Page header */}
              <div className="flex items-center gap-3 mb-6">
                <span className="text-2xl">{pageInfo.icon}</span>
                <div>
                  <h2 className="text-base font-black text-surface-900">{pageInfo.label}</h2>
                  <p className="text-xs text-surface-400">{pageInfo.desc} — {blocks.length} بلاک</p>
                </div>
              </div>

              {/* Group by key prefix */}
              {(() => {
                const grouped: Record<string, ContentBlock[]> = {}
                for (const b of blocks) {
                  const prefix = b.key.split('_')[0] ?? 'other'
                  if (!grouped[prefix]) grouped[prefix] = []
                  grouped[prefix].push(b)
                }
                return Object.entries(grouped).map(([prefix, items]) => (
                  <div key={prefix} className="bg-white rounded-2xl border border-surface-200 p-6 space-y-5">
                    <h3 className="text-sm font-bold text-surface-700 uppercase tracking-wide border-b border-surface-100 pb-3">
                      {prefix}
                    </h3>
                    {items.map((b) => (
                      <ContentField
                        key={b.key}
                        block={b}
                        value={values[b.key] ?? ''}
                        onChange={handleChange}
                      />
                    ))}
                  </div>
                ))
              })()}

              <div className="flex justify-end pt-2">
                <button onClick={handleSave} disabled={saving} className="btn btn-primary py-2.5 px-6">
                  {saving ? 'در حال ذخیره...' : '💾 ذخیره تغییرات'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
