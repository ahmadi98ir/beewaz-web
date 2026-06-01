'use client'

import { useEffect, useState, useCallback } from 'react'
import { toFaDigits, toEnDigits } from '@/lib/utils'

interface InvProduct {
  id: string
  nameFa: string
  sku: string
  stock: number
  status: string
}

export default function InventoryPage() {
  const [products, setProducts] = useState<InvProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [lowOnly, setLowOnly] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [editVal, setEditVal] = useState('')
  const [saving, setSaving] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set('q', search)
    if (lowOnly) params.set('low', 'true')
    const res = await fetch(`/api/admin/inventory?${params}`)
    const data = await res.json()
    setProducts(data.products ?? [])
    setLoading(false)
  }, [search, lowOnly])

  useEffect(() => {
    const t = setTimeout(fetchData, 300)
    return () => clearTimeout(t)
  }, [fetchData])

  async function saveStock(id: string) {
    const stock = parseInt(toEnDigits(editVal), 10)
    if (isNaN(stock) || stock < 0) { setEditId(null); return }
    setSaving(true)
    await fetch('/api/admin/inventory', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, stock }),
    })
    setSaving(false)
    setEditId(null)
    fetchData()
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <header className="bg-white border-b border-surface-200 px-6 py-4">
        <h1 className="text-lg font-black text-surface-900">موجودی انبار</h1>
        <p className="text-xs text-surface-400 mt-0.5">مدیریت موجودی محصولات</p>
      </header>

      <div className="p-6">
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="جستجوی نام یا SKU..."
            className="input w-64 text-sm"
          />
          <label className="flex items-center gap-2 text-sm text-surface-600 cursor-pointer">
            <input type="checkbox" checked={lowOnly} onChange={(e) => setLowOnly(e.target.checked)} />
            فقط موجودی کم (≤ ۵)
          </label>
        </div>

        <div className="bg-white rounded-2xl border border-surface-200 overflow-hidden">
          {loading ? (
            <div className="text-center py-12 text-surface-400">در حال بارگذاری...</div>
          ) : products.length === 0 ? (
            <div className="text-center py-12 text-surface-400 text-sm">محصولی یافت نشد.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-surface-50 text-surface-500 text-xs">
                <tr>
                  {['محصول', 'SKU', 'موجودی', 'عملیات'].map((h) => (
                    <th key={h} className="text-start px-5 py-3 font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-surface-50">
                    <td className="px-5 py-3 font-semibold text-surface-900">{p.nameFa}</td>
                    <td className="px-5 py-3 font-mono text-xs text-surface-500" dir="ltr">{p.sku}</td>
                    <td className="px-5 py-3">
                      {editId === p.id ? (
                        <input
                          value={editVal}
                          onChange={(e) => setEditVal(e.target.value)}
                          autoFocus
                          dir="ltr"
                          className="input w-24 text-sm py-1"
                          onKeyDown={(e) => { if (e.key === 'Enter') saveStock(p.id) }}
                        />
                      ) : (
                        <span className={`font-bold ${p.stock <= 5 ? 'text-red-600' : 'text-surface-900'}`}>
                          {toFaDigits(p.stock)}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      {editId === p.id ? (
                        <div className="flex gap-2">
                          <button onClick={() => saveStock(p.id)} disabled={saving}
                            className="text-xs font-bold text-green-600 hover:text-green-700">ذخیره</button>
                          <button onClick={() => setEditId(null)}
                            className="text-xs font-semibold text-surface-400">انصراف</button>
                        </div>
                      ) : (
                        <button
                          onClick={() => { setEditId(p.id); setEditVal(String(p.stock)) }}
                          className="text-xs font-semibold text-brand-600 hover:text-brand-700"
                        >
                          ویرایش موجودی
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
