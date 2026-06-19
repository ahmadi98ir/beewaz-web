'use client'

import { useEffect, useState, useCallback } from 'react'

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

  const load = useCallback(async () => {
    setLoading(true)
    const r = await fetch('/api/admin/menu')
    if (r.ok) { const d = await r.json() as { items: MenuItemRow[] }; setItems(d.items) }
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
    <div className="flex-1 overflow-y-auto">
      <header className="bg-white border-b border-surface-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-black text-surface-900">مدیریت منوی سایت</h1>
          <p className="text-xs text-surface-400 mt-0.5">منوی هدر و ستون‌های فوتر</p>
        </div>
        <button onClick={() => openNew()} className="btn btn-accent px-5 py-2.5 text-sm flex items-center gap-2">
          <svg viewBox="0 0 20 20" className="w-4 h-4" fill="currentColor"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd"/></svg>
          آیتم جدید
        </button>
      </header>

      <div className="px-6 pt-4 flex gap-2 border-b border-surface-200">
        {Object.entries(LOCATIONS).map(([v, l]) => (
          <button
            key={v}
            onClick={() => setTab(v)}
            className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors ${tab === v ? 'bg-white text-brand-600 border border-surface-200 border-b-white -mb-px' : 'text-surface-500 hover:text-surface-800'}`}
          >
            {l}
          </button>
        ))}
      </div>

      <div className="p-6">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : topItems.length === 0 ? (
          <p className="text-center text-surface-500 py-16">هیچ آیتمی برای این بخش ثبت نشده.</p>
        ) : (
          <div className="space-y-3">
            {topItems.map((item) => (
              <div key={item.id} className={`bg-white rounded-xl border ${item.active ? 'border-surface-200' : 'border-surface-100 opacity-60'}`}>
                <div className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="font-bold text-surface-900">{item.label}</p>
                    <p className="text-xs text-surface-400 font-mono" dir="ltr">{item.href}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {tab === 'header' && (
                      <button onClick={() => openNew(item.id)} className="text-xs font-semibold text-brand-600 hover:underline px-2">+ زیرمنو</button>
                    )}
                    <button
                      onClick={() => void toggle(item.id, !item.active)}
                      className={`text-xs font-semibold py-1.5 px-3 rounded-lg transition-colors ${item.active ? 'bg-green-50 text-green-700 hover:bg-green-100' : 'bg-surface-100 text-surface-500 hover:bg-surface-200'}`}
                    >
                      {item.active ? '✅ فعال' : '⏸️ غیرفعال'}
                    </button>
                    <button onClick={() => void remove(item.id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <svg viewBox="0 0 20 20" className="w-4 h-4" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zm-1 6a1 1 0 012 0v5a1 1 0 01-2 0V8zm4 0a1 1 0 012 0v5a1 1 0 01-2 0V8z" clipRule="evenodd"/></svg>
                    </button>
                  </div>
                </div>
                {childrenOf(item.id).length > 0 && (
                  <div className="border-t border-surface-100 px-4 py-2 space-y-2">
                    {childrenOf(item.id).map((child) => (
                      <div key={child.id} className={`flex items-center justify-between py-1.5 ${child.active ? '' : 'opacity-50'}`}>
                        <div>
                          <p className="text-sm font-semibold text-surface-800">{child.label}</p>
                          <p className="text-xs text-surface-400 font-mono" dir="ltr">{child.href}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => void toggle(child.id, !child.active)} className="text-xs text-surface-500 hover:text-surface-800">
                            {child.active ? '✅' : '⏸️'}
                          </button>
                          <button onClick={() => void remove(child.id)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h2 className="font-black text-surface-900 mb-5">
              {form.parentId ? 'زیرمنوی جدید' : 'آیتم جدید'} — {LOCATIONS[form.location]}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-surface-700 mb-1.5">عنوان</label>
                <input autoFocus value={form.label} onChange={(e) => setForm((p) => ({ ...p, label: e.target.value }))} className="input w-full" placeholder="مثال: حسگرها" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-surface-700 mb-1.5">آدرس (href)</label>
                <input value={form.href} onChange={(e) => setForm((p) => ({ ...p, href: e.target.value }))} className="input w-full font-mono text-sm" placeholder="/shop/sensors" dir="ltr" />
              </div>
              {form.location === 'header' && (
                <div>
                  <label className="block text-sm font-semibold text-surface-700 mb-1.5">توضیح کوتاه (اختیاری — برای زیرمنو)</label>
                  <input value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} className="input w-full" />
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-surface-700 mb-1.5">ترتیب نمایش</label>
                <input type="number" value={form.sortOrder} onChange={(e) => setForm((p) => ({ ...p, sortOrder: Number(e.target.value) }))} className="input w-full" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowNew(false)} className="btn btn-outline flex-1">انصراف</button>
              <button onClick={() => void create()} disabled={saving || !form.label || !form.href} className="btn btn-accent flex-1">
                {saving ? 'در حال ذخیره...' : 'افزودن'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
