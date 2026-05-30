'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import Link from 'next/link'

interface Product {
  id: string; slug: string; name: string; modelCode: string | null
  status: string; basePrice: string | null; isFeatured: boolean
  ratingAvg: string; salesCount: number; imageUrl: string | null; createdAt: string
}
interface ApiResponse { products: Product[]; counts: Record<string, number> }

const STATUS_CFG: Record<string, { label: string; cls: string }> = {
  draft:        { label: 'پیش‌نویس',      cls: 'bg-surface-50 text-surface-500 border-surface-200' },
  active:       { label: 'فعال',          cls: 'bg-green-50 text-green-700 border-green-200' },
  archived:     { label: 'آرشیو',         cls: 'bg-surface-50 text-surface-400 border-surface-200' },
  out_of_stock: { label: 'ناموجود',       cls: 'bg-red-50 text-red-600 border-red-200' },
}
const TABS = [
  {key:'all',label:'همه'}, {key:'active',label:'فعال'}, {key:'draft',label:'پیش‌نویس'},
  {key:'out_of_stock',label:'ناموجود'}, {key:'archived',label:'آرشیو'}
]

function fmt(v: string | null) {
  if (!v) return '—'
  const n = parseInt(v)
  return `${(n/10).toLocaleString('fa-IR')} ت`
}

export default function ProductsPage() {
  const [data, setData] = useState<ApiResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('all')
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [addOpen, setAddOpen] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const fetchProducts = useCallback(async (status: string, q: string) => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ status, limit: '100' })
      if (q) params.set('q', q)
      const res = await fetch(`/api/admin/products?${params}`)
      if (!res.ok) { setError('خطا در دریافت محصولات'); return }
      setData(await res.json() as ApiResponse)
    } catch { setError('خطا در ارتباط با سرور') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchProducts(activeTab, search) }, [fetchProducts, activeTab, search])

  const handleSearch = (v: string) => {
    setSearchInput(v)
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => setSearch(v), 400)
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`محصول «${name}» حذف شود؟`)) return
    await fetch(`/api/admin/products/${id}`, { method: 'DELETE' })
    fetchProducts(activeTab, search)
  }

  const handleToggleFeatured = async (id: string, current: boolean) => {
    await fetch(`/api/admin/products/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isFeatured: !current }),
    })
    fetchProducts(activeTab, search)
  }

  const prods = data?.products ?? []
  const counts = data?.counts ?? {}

  return (
    <div className="flex-1 overflow-y-auto">
      <header className="bg-white border-b border-surface-200 px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-lg font-black text-surface-900">مدیریت محصولات</h1>
            <p className="text-xs text-surface-400 mt-0.5">{(counts.all ?? 0).toLocaleString('fa-IR')} محصول</p>
          </div>
          <button onClick={() => setAddOpen(true)} className="btn btn-primary flex items-center gap-2 text-sm py-2.5 px-4">
            <svg viewBox="0 0 20 20" className="w-4 h-4" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            محصول جدید
          </button>
        </div>
      </header>

      <div className="p-6 space-y-5">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center bg-surface-50 border border-surface-100 rounded-xl p-1 gap-0.5">
            {TABS.map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeTab === tab.key ? 'bg-white text-surface-900 shadow-sm border border-surface-100' : 'text-surface-500 hover:text-surface-700'}`}>
                {tab.label} {counts[tab.key] !== undefined && <span className="opacity-60 mr-1">{counts[tab.key]}</span>}
              </button>
            ))}
          </div>
          <div className="flex-1" />
          <div className="relative">
            <svg viewBox="0 0 20 20" className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400 pointer-events-none" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
            <input type="text" value={searchInput} onChange={e => handleSearch(e.target.value)}
              placeholder="نام یا کد مدل..." className="pr-9 pl-4 py-2 text-sm bg-white border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-300 w-48" />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-surface-200 overflow-hidden">
          {error ? (
            <div className="py-16 text-center">
              <p className="text-red-500 font-semibold">{error}</p>
              <button onClick={() => fetchProducts(activeTab, search)} className="btn btn-outline mt-4 text-sm">تلاش مجدد</button>
            </div>
          ) : prods.length === 0 && !loading ? (
            <div className="py-16 text-center">
              <p className="text-surface-400 font-semibold">محصولی یافت نشد</p>
              <button onClick={() => setAddOpen(true)} className="btn btn-outline mt-4 text-sm">افزودن محصول</button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-surface-50 border-b border-surface-100">
                  <tr>
                    {['','نام محصول','کد مدل','قیمت پایه','وضعیت','فروش','امتیاز','ویژه','عملیات'].map(h => (
                      <th key={h} className="text-start px-4 py-3 text-xs font-bold text-surface-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-50">
                  {prods.map(p => (
                    <tr key={p.id} className="hover:bg-surface-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="w-10 h-10 rounded-xl bg-surface-100 overflow-hidden flex-shrink-0">
                          {p.imageUrl ? <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" /> :
                            <div className="w-full h-full flex items-center justify-center text-surface-300 text-lg">📦</div>}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/admin/products/${p.id}`} className="font-semibold text-surface-900 hover:text-brand-600 transition-colors">{p.name}</Link>
                        <p className="text-xs text-surface-400 font-mono">{p.slug}</p>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-surface-500 font-bold">{p.modelCode ?? '—'}</td>
                      <td className="px-4 py-3 font-bold text-surface-900">{fmt(p.basePrice)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border ${STATUS_CFG[p.status]?.cls ?? ''}`}>
                          {STATUS_CFG[p.status]?.label ?? p.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-surface-500">{p.salesCount.toLocaleString('fa-IR')}</td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1 text-amber-500 font-bold text-xs">
                          ⭐ {parseFloat(p.ratingAvg).toLocaleString('fa-IR')}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => handleToggleFeatured(p.id, p.isFeatured)}
                          className={`w-9 h-5 rounded-full transition-colors relative ${p.isFeatured ? 'bg-brand-500' : 'bg-surface-200'}`}>
                          <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${p.isFeatured ? 'right-0.5' : 'left-0.5'}`} />
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Link href={`/admin/products/${p.id}`}
                            className="p-1.5 rounded-lg hover:bg-brand-50 text-surface-400 hover:text-brand-600 transition-colors">
                            <svg viewBox="0 0 20 20" className="w-4 h-4" fill="currentColor">
                              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                            </svg>
                          </Link>
                          <a href={`/shop/products/${p.slug}`} target="_blank"
                            className="p-1.5 rounded-lg hover:bg-surface-100 text-surface-400 hover:text-surface-600 transition-colors">
                            <svg viewBox="0 0 20 20" className="w-4 h-4" fill="currentColor">
                              <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                              <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                            </svg>
                          </a>
                          <button onClick={() => handleDelete(p.id, p.name)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-surface-400 hover:text-red-500 transition-colors">
                            <svg viewBox="0 0 20 20" className="w-4 h-4" fill="currentColor">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {addOpen && <AddProductModal onClose={() => setAddOpen(false)} onSaved={() => { setAddOpen(false); fetchProducts(activeTab, search) }} />}
    </div>
  )
}

function AddProductModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({ name: '', slug: '', modelCode: '', shortDescription: '', basePrice: '', status: 'draft' })
  const [saving, setSaving] = useState(false); const [err, setErr] = useState('')

  const slugify = (s: string) => s.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.slug) { setErr('نام و slug الزامی است'); return }
    setSaving(true); setErr('')
    const res = await fetch('/api/admin/products', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, basePrice: form.basePrice ? parseInt(form.basePrice) * 10 : undefined }),
    })
    if (res.ok) { onSaved() } else {
      const j = await res.json() as { error?: string }
      setErr(j.error ?? 'خطا')
    }
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 m-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-black text-surface-900">محصول جدید</h2>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-surface-100 text-surface-400">✕</button>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-surface-600 mb-1.5">نام محصول <span className="text-red-500">*</span></label>
            <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value, slug: slugify(e.target.value) })}
              placeholder="دزدگیر خانگی BH10" className="w-full px-3.5 py-2.5 text-sm border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-300" required />
          </div>
          <div>
            <label className="block text-xs font-semibold text-surface-600 mb-1.5">Slug <span className="text-red-500">*</span></label>
            <input type="text" value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })}
              className="w-full px-3.5 py-2.5 text-sm border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-300 font-mono" dir="ltr" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-surface-600 mb-1.5">کد مدل</label>
              <input type="text" value={form.modelCode} onChange={e => setForm({ ...form, modelCode: e.target.value })}
                placeholder="BH10" className="w-full px-3.5 py-2.5 text-sm border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-300 font-mono" dir="ltr" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-surface-600 mb-1.5">قیمت (تومان)</label>
              <input type="number" value={form.basePrice} onChange={e => setForm({ ...form, basePrice: e.target.value })}
                placeholder="2500000" className="w-full px-3.5 py-2.5 text-sm border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-300" dir="ltr" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-surface-600 mb-1.5">وضعیت اولیه</label>
            <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
              className="w-full px-3.5 py-2.5 text-sm border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-300 bg-white">
              <option value="draft">پیش‌نویس</option>
              <option value="active">فعال (منتشر شود)</option>
            </select>
          </div>
          {err && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{err}</p>}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 btn btn-outline py-2.5">انصراف</button>
            <button type="submit" disabled={saving} className="flex-1 btn btn-primary py-2.5 disabled:opacity-50">
              {saving ? 'در حال ذخیره...' : 'ایجاد محصول'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
