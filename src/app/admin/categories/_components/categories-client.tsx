'use client'

import { useState, useTransition } from 'react'
import { saveCategory, updateCategory, deleteCategory } from '../actions'

export interface CatRow {
  id: string; nameFa: string; slug: string
  parentId: string | null; icon: string | null; sortOrder: number
}

function slugify(s: string) {
  return s.toLowerCase()
    .replace(/[؀-ۿ\s]+/g, '-').replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-').replace(/^-|-$/g, '')
}

// ─── Category Form (inline) ───────────────────────────────────────────────────

function CategoryForm({
  initial,
  parents,
  onDone,
  onCancel,
}: {
  initial?: CatRow
  parents: CatRow[]
  onDone: (row: CatRow) => void
  onCancel: () => void
}) {
  const [nameFa,   setNameFa]   = useState(initial?.nameFa   ?? '')
  const [slug,     setSlug]     = useState(initial?.slug      ?? '')
  const [parentId, setParentId] = useState(initial?.parentId  ?? '')
  const [icon,     setIcon]     = useState(initial?.icon      ?? '')
  const [error,    setError]    = useState('')
  const [pending,  startTr]     = useTransition()

  function handleNameChange(v: string) {
    setNameFa(v)
    if (!initial) setSlug(slugify(v) || '')
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const data = { nameFa, slug, parentId: parentId || null, icon }
    startTr(async () => {
      const res = initial
        ? await updateCategory(initial.id, data)
        : await saveCategory(data)
      if (res.success) {
        onDone({ id: initial?.id ?? crypto.randomUUID(), nameFa, slug, parentId: parentId || null, icon: icon || null, sortOrder: initial?.sortOrder ?? 0 })
      } else {
        setError(res.error ?? 'خطا')
      }
    })
  }

  const inp = 'w-full px-3 py-2 rounded-xl bg-white/[0.05] border border-white/[0.10] text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-indigo-500/50 transition-colors'

  return (
    <form onSubmit={handleSubmit} className="p-4 rounded-2xl bg-white/[0.04] border border-white/[0.08] space-y-3">
      <p className="text-white/70 text-sm font-semibold">{initial ? 'ویرایش دسته‌بندی' : 'دسته‌بندی جدید'}</p>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-[10px] text-white/35 uppercase font-bold">نام</label>
          <input value={nameFa} onChange={(e) => handleNameChange(e.target.value)} placeholder="مثال: لوازم خانگی" className={inp} required />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] text-white/35 uppercase font-bold">اسلاگ (URL)</label>
          <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="home-appliances" className={inp} dir="ltr" required />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-[10px] text-white/35 uppercase font-bold">دسته والد (اختیاری)</label>
          <select value={parentId} onChange={(e) => setParentId(e.target.value)} className={inp}>
            <option value="">بدون والد (دسته ریشه)</option>
            {parents.filter((p) => p.id !== initial?.id).map((p) => (
              <option key={p.id} value={p.id}>{p.nameFa}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] text-white/35 uppercase font-bold">آیکون (emoji)</label>
          <input value={icon} onChange={(e) => setIcon(e.target.value)} placeholder="🏠" maxLength={4} className={inp} />
        </div>
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}

      <div className="flex gap-2 pt-1">
        <button type="submit" disabled={pending}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white text-xs font-bold transition-colors">
          {pending ? 'در حال ذخیره...' : (initial ? 'بروزرسانی' : 'افزودن')}
        </button>
        <button type="button" onClick={onCancel}
          className="px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.10] text-white/50 text-xs font-medium transition-colors">
          انصراف
        </button>
      </div>
    </form>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function CategoriesClient({ initialRows }: { initialRows: CatRow[] }) {
  const [rows,      setRows]     = useState(initialRows)
  const [adding,    setAdding]   = useState(false)
  const [editing,   setEditing]  = useState<string | null>(null)
  const [deleting,  setDeleting] = useState<string | null>(null)
  const [pending,   startTr]     = useTransition()

  const parentMap = new Map(rows.map((r) => [r.id, r.nameFa]))

  function onDoneAdd(row: CatRow) {
    setRows((p) => [...p, row])
    setAdding(false)
  }

  function onDoneEdit(row: CatRow) {
    setRows((p) => p.map((r) => r.id === row.id ? row : r))
    setEditing(null)
  }

  function handleDelete(id: string) {
    startTr(async () => {
      const res = await deleteCategory(id)
      if (res.success) {
        setRows((p) => p.filter((r) => r.id !== id))
      }
      setDeleting(null)
    })
  }

  return (
    <div className="space-y-4">
      {/* Add form */}
      {adding ? (
        <CategoryForm parents={rows} onDone={onDoneAdd} onCancel={() => setAdding(false)} />
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold transition-colors"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          دسته‌بندی جدید
        </button>
      )}

      {/* Table */}
      {rows.length === 0 ? (
        <div className="flex flex-col items-center py-16 gap-3">
          <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-2xl">📂</div>
          <p className="text-white/30 text-sm">هنوز دسته‌بندی‌ای ندارید</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-white/[0.06] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                {['آیکون', 'نام', 'اسلاگ', 'والد', ''].map((h) => (
                  <th key={h} className="text-right text-[10px] font-bold text-white/25 uppercase tracking-wider px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {rows.map((row) => (
                editing === row.id ? (
                  <tr key={row.id}>
                    <td colSpan={5} className="p-3">
                      <CategoryForm initial={row} parents={rows} onDone={onDoneEdit} onCancel={() => setEditing(null)} />
                    </td>
                  </tr>
                ) : (
                  <tr key={row.id} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3 text-xl">{row.icon ?? '📁'}</td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-white/80 font-medium">{row.nameFa}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-mono text-white/35" dir="ltr">{row.slug}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-white/35">{row.parentId ? (parentMap.get(row.parentId) ?? '—') : '—'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setEditing(row.id)}
                          className="px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.10] text-white/50 hover:text-white text-xs transition-colors">
                          ویرایش
                        </button>
                        {deleting === row.id ? (
                          <div className="flex items-center gap-1.5">
                            <button onClick={() => handleDelete(row.id)} disabled={pending}
                              className="px-3 py-1.5 rounded-lg bg-red-500/80 hover:bg-red-500 text-white text-xs disabled:opacity-60 transition-colors">
                              تأیید حذف
                            </button>
                            <button onClick={() => setDeleting(null)}
                              className="px-3 py-1.5 rounded-lg bg-white/[0.06] text-white/50 text-xs transition-colors">
                              لغو
                            </button>
                          </div>
                        ) : (
                          <button onClick={() => setDeleting(row.id)}
                            className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs transition-colors">
                            حذف
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
