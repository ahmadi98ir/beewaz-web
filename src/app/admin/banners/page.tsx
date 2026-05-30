'use client'

import { useEffect, useState, useCallback } from 'react'
import Image from 'next/image'

interface Banner {
  id: string; name: string; image: string; link: string | null
  target: string; position: string; orderIdx: number; active: boolean; createdAt: string
}

const POSITIONS: Record<string, string> = {
  home_hero: 'صفحه اصلی (Hero)',
  shop_top:  'بالای فروشگاه',
  sidebar:   'سایدبار',
  popup:     'پاپ‌آپ',
}

export default function BannersPage() {
  const [banners,  setBanners]  = useState<Banner[]>([])
  const [loading,  setLoading]  = useState(true)
  const [showNew,  setShowNew]  = useState(false)
  const [saving,   setSaving]   = useState(false)
  const [form, setForm] = useState({ name: '', image: '', link: '', target: '_self', position: 'home_hero' })

  const load = useCallback(async () => {
    setLoading(true)
    const r = await fetch('/api/admin/banners')
    if (r.ok) { const d = await r.json() as { banners: Banner[] }; setBanners(d.banners) }
    setLoading(false)
  }, [])

  useEffect(() => { void load() }, [load])

  const create = async () => {
    if (!form.name || !form.image || saving) return
    setSaving(true)
    const r = await fetch('/api/admin/banners', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (r.ok) { await load(); setShowNew(false); setForm({ name: '', image: '', link: '', target: '_self', position: 'home_hero' }) }
    setSaving(false)
  }

  const toggle = async (id: string, active: boolean) => {
    await fetch(`/api/admin/banners/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active }),
    })
    setBanners((p) => p.map((b) => b.id === id ? { ...b, active } : b))
  }

  const remove = async (id: string) => {
    if (!confirm('این بنر حذف شود؟')) return
    await fetch(`/api/admin/banners/${id}`, { method: 'DELETE' })
    setBanners((p) => p.filter((b) => b.id !== id))
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <header className="bg-white border-b border-surface-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-black text-surface-900">مدیریت بنرها</h1>
          <p className="text-xs text-surface-400 mt-0.5">بنرها و تصاویر تبلیغاتی سایت</p>
        </div>
        <button onClick={() => setShowNew(true)} className="btn btn-accent px-5 py-2.5 text-sm flex items-center gap-2">
          <svg viewBox="0 0 20 20" className="w-4 h-4" fill="currentColor"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd"/></svg>
          بنر جدید
        </button>
      </header>

      <div className="p-6">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : banners.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-surface-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg viewBox="0 0 24 24" className="w-8 h-8 text-surface-400" fill="none" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
            </div>
            <p className="text-surface-600 font-semibold">هنوز بنری اضافه نشده</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {banners.map((b) => (
              <div key={b.id} className={`bg-white rounded-2xl border overflow-hidden ${b.active ? 'border-surface-200' : 'border-surface-100 opacity-60'}`}>
                <div className="relative h-40 bg-surface-100">
                  {b.image ? (
                    <Image src={b.image} alt={b.name} fill className="object-cover" unoptimized />
                  ) : (
                    <div className="flex items-center justify-center h-full text-surface-300">تصویر</div>
                  )}
                  <div className="absolute top-2 start-2">
                    <span className="text-[10px] font-bold bg-white/90 px-2 py-0.5 rounded-full text-surface-700">
                      {POSITIONS[b.position] ?? b.position}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <p className="font-bold text-surface-900 mb-1">{b.name}</p>
                  {b.link && <p className="text-xs text-surface-400 font-mono mb-3 truncate">{b.link}</p>}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => void toggle(b.id, !b.active)}
                      className={`flex-1 text-xs font-semibold py-2 rounded-lg transition-colors ${b.active ? 'bg-green-50 text-green-700 hover:bg-green-100' : 'bg-surface-100 text-surface-500 hover:bg-surface-200'}`}
                    >
                      {b.active ? '✅ فعال' : '⏸️ غیرفعال'}
                    </button>
                    <button
                      onClick={() => void remove(b.id)}
                      className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <svg viewBox="0 0 20 20" className="w-4 h-4" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zm-1 6a1 1 0 012 0v5a1 1 0 01-2 0V8zm4 0a1 1 0 012 0v5a1 1 0 01-2 0V8z" clipRule="evenodd"/></svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h2 className="font-black text-surface-900 mb-5">بنر جدید</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-surface-700 mb-1.5">نام بنر</label>
                <input autoFocus value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} className="input w-full" placeholder="مثال: بنر تابستانه" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-surface-700 mb-1.5">آدرس تصویر (URL)</label>
                <input value={form.image} onChange={(e) => setForm((p) => ({ ...p, image: e.target.value }))} className="input w-full font-mono text-sm" placeholder="https://..." dir="ltr" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-surface-700 mb-1.5">لینک (اختیاری)</label>
                <input value={form.link} onChange={(e) => setForm((p) => ({ ...p, link: e.target.value }))} className="input w-full font-mono text-sm" placeholder="/shop" dir="ltr" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-surface-700 mb-1.5">موقعیت نمایش</label>
                <select value={form.position} onChange={(e) => setForm((p) => ({ ...p, position: e.target.value }))} className="input w-full">
                  {Object.entries(POSITIONS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowNew(false)} className="btn btn-outline flex-1">انصراف</button>
              <button onClick={() => void create()} disabled={saving || !form.name || !form.image} className="btn btn-accent flex-1">
                {saving ? 'در حال ذخیره...' : 'افزودن بنر'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
