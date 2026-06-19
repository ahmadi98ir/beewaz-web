'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'

interface MenuItemRow {
  id: string; location: string; parentId: string | null
  label: string; href: string; description: string | null
  sortOrder: number; active: boolean
}

const LOCATIONS: Record<string, string> = {
  header:           'هدر — منوی اصلی',
  footer_shop:      'فوتر — ستون فروشگاه',
  footer_knowledge: 'فوتر — ستون پایگاه دانش',
  footer_company:   'فوتر — ستون شرکت',
}

const emptyForm = { location: 'header', parentId: '' as string, label: '', href: '', description: '', sortOrder: 0 }

export default function MenuPage() {
  const [items,   setItems]   = useState<MenuItemRow[]>([])
  const [loading, setLoading] = useState(true)
  const [tab,     setTab]     = useState<string>('header')
  const [showNew, setShowNew] = useState(false)
  const [saving,  setSaving]  = useState(false)
  const [form,    setForm]    = useState(emptyForm)
  const [error,   setError]   = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const r = await fetch('/api/admin/menu')
      if (r.ok) {
        const d = await r.json() as { items: MenuItemRow[] }
        setItems(d.items)
      } else {
        setError(`خطا در دریافت منو (${r.status})`)
      }
    } catch {
      setError('ارتباط با سرور برقرار نشد')
    }
    setLoading(false)
  }, [])

  useEffect(() => { void load() }, [load])

  const tabItems = items.filter((i) => i.location === tab)
  const topItems = tabItems.filter((i) => i.parentId === null)
  const childrenOf = (parentId: string) => tabItems.filter((i) => i.parentId === parentId)

  const openNew = (parentId?: string) => {
    setForm({ ...emptyForm, location: tab, parentId: parentId ?? '' })
    setShowNew(true)
  }

  const create = async () => {
    if (!form.label || !form.href || saving) return
    setSaving(true)
    const r = await fetch('/api/admin/menu', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, parentId: form.parentId || null }),
    })
    if (r.ok) { await load(); setShowNew(false); setForm(emptyForm) }
    setSaving(false)
  }

  const toggle = async (id: string, active: boolean) => {
    await fetch(`/api/admin/menu/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active }),
    })
    setItems((p) => p.map((i) => i.id === id ? { ...i, active } : i))
  }

  const remove = async (id: string) => {
    if (!confirm('این آیتم (و زیرمنوهای آن) حذف شود؟')) return
    const children = items.filter((i) => i.parentId === id)
    await Promise.all([id, ...children.map((c) => c.id)].map((cid) =>
      fetch(`/api/admin/menu/${cid}`, { method: 'DELETE' })
    ))
    await load()
  }

  return (
    <div className="min-h-full bg-[#070711]">
      {/* ─── Header ──────────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-10 bg-[#070711]/90 backdrop-blur-md border-b border-white/[0.06]">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link
            href="/admin/dashboard"
            className="w-8 h-8 rounded-lg bg-white/[0.06] hover:bg-white/[0.10] flex items-center justify-center text-white/50 hover:text-white transition-all"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
            </svg>
          </Link>
          <div className="flex-1">
            <h1 className="text-white font-bold text-lg">مدیریت منوی سایت</h1>
            <p className="text-white/30 text-xs">منوی هدر و ستون‌های فوتر</p>
          </div>
          <button
            onClick={() => openNew()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-sm font-bold transition-colors"
          >
            <svg viewBox="0 0 20 20" className="w-4 h-4" fill="currentColor"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd"/></svg>
            آیتم جدید
          </button>
        </div>

        <div className="max-w-4xl mx-auto px-6 flex gap-1 overflow-x-auto">
          {Object.entries(LOCATIONS).map(([v, l]) => (
            <button
              key={v}
              onClick={() => setTab(v)}
              className={`px-4 py-2.5 text-sm font-semibold whitespace-nowrap transition-colors border-b-2 ${
                tab === v ? 'text-white border-brand-500' : 'text-white/40 border-transparent hover:text-white/70'
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Error banner ────────────────────────────────────────────────── */}
      {error && (
        <div className="max-w-4xl mx-auto px-6 pt-6">
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4">
            <p className="text-red-400 font-bold text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* ─── Content ─────────────────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-6 py-6">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : topItems.length === 0 ? (
          <div className="text-center py-16 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
            <p className="text-white/40">هیچ آیتمی برای این بخش ثبت نشده.</p>
            <button onClick={() => openNew()} className="mt-4 text-sm font-semibold text-brand-400 hover:text-brand-300">
              + افزودن اولین آیتم
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {topItems.map((item) => (
              <div key={item.id} className={`rounded-2xl border border-white/[0.06] bg-white/[0.03] ${item.active ? '' : 'opacity-50'}`}>
                <div className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="font-bold text-white">{item.label}</p>
                    <p className="text-xs text-white/30 font-mono" dir="ltr">{item.href}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {tab === 'header' && (
                      <button onClick={() => openNew(item.id)} className="text-xs font-semibold text-brand-400 hover:text-brand-300 px-2">+ زیرمنو</button>
                    )}
                    <button
                      onClick={() => void toggle(item.id, !item.active)}
                      className={`text-xs font-semibold py-1.5 px-3 rounded-lg transition-colors ${item.active ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20' : 'bg-white/[0.06] text-white/40 hover:bg-white/[0.10]'}`}
                    >
                      {item.active ? '✅ فعال' : '⏸️ غیرفعال'}
                    </button>
                    <button onClick={() => void remove(item.id)} className="p-2 text-red-400/70 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                      <svg viewBox="0 0 20 20" className="w-4 h-4" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zm-1 6a1 1 0 012 0v5a1 1 0 01-2 0V8zm4 0a1 1 0 012 0v5a1 1 0 01-2 0V8z" clipRule="evenodd"/></svg>
                    </button>
                  </div>
                </div>
                {childrenOf(item.id).length > 0 && (
                  <div className="border-t border-white/[0.06] px-4 py-2 space-y-2">
                    {childrenOf(item.id).map((child) => (
                      <div key={child.id} className={`flex items-center justify-between py-1.5 ${child.active ? '' : 'opacity-50'}`}>
                        <div>
                          <p className="text-sm font-semibold text-white/80">{child.label}</p>
                          <p className="text-xs text-white/30 font-mono" dir="ltr">{child.href}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => void toggle(child.id, !child.active)} className="text-xs text-white/40 hover:text-white/80">
                            {child.active ? '✅' : '⏸️'}
                          </button>
                          <button onClick={() => void remove(child.id)} className="p-1.5 text-red-400/70 hover:text-red-400 hover:bg-red-500/10 rounded-lg">
                            <svg viewBox="0 0 20 20" className="w-3.5 h-3.5" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zm-1 6a1 1 0 012 0v5a1 1 0 01-2 0V8zm4 0a1 1 0 012 0v5a1 1 0 01-2 0V8z" clipRule="evenodd"/></svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {showNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="bg-[#0d0d1a] border border-white/[0.08] rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h2 className="font-black text-white mb-5">
              {form.parentId ? 'زیرمنوی جدید' : 'آیتم جدید'} — {LOCATIONS[form.location]}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-white/60 mb-1.5">عنوان</label>
                <input
                  autoFocus
                  value={form.label}
                  onChange={(e) => setForm((p) => ({ ...p, label: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="مثال: حسگرها"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-white/60 mb-1.5">آدرس (href)</label>
                <input
                  value={form.href}
                  onChange={(e) => setForm((p) => ({ ...p, href: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white placeholder-white/30 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="/shop/sensors"
                  dir="ltr"
                />
              </div>
              {form.location === 'header' && (
                <div>
                  <label className="block text-sm font-semibold text-white/60 mb-1.5">توضیح کوتاه (اختیاری — برای زیرمنو)</label>
                  <input
                    value={form.description}
                    onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-white/60 mb-1.5">ترتیب نمایش</label>
                <input
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) => setForm((p) => ({ ...p, sortOrder: Number(e.target.value) }))}
                  className="w-full px-3 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowNew(false)} className="flex-1 py-2.5 rounded-xl border border-white/[0.08] text-white/70 hover:bg-white/[0.05] font-semibold transition-colors">
                انصراف
              </button>
              <button
                onClick={() => void create()}
                disabled={saving || !form.label || !form.href}
                className="flex-1 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-40 text-white font-bold transition-colors"
              >
                {saving ? 'در حال ذخیره...' : 'افزودن'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
