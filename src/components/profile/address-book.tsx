'use client'

import { useState, useEffect, useCallback } from 'react'
import { MapPinIcon, CheckIcon } from '@/components/ui/icons'

type Address = {
  id: string
  title: string | null
  fullName: string | null
  province: string | null
  city: string | null
  street: string | null
  alley: string | null
  plaque: string | null
  unit: string | null
  postalCode: string | null
  isDefault: boolean
}

type FormState = {
  title: string; fullName: string; province: string; city: string
  street: string; alley: string; plaque: string; unit: string; postalCode: string
}

const EMPTY: FormState = {
  title: '', fullName: '', province: '', city: '',
  street: '', alley: '', plaque: '', unit: '', postalCode: '',
}

export function AddressBook() {
  const [list, setList] = useState<Address[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<string | null>(null)   // 'new' | شناسهٔ آدرس | null
  const [form, setForm] = useState<FormState>(EMPTY)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = useCallback(() => {
    setLoading(true)
    fetch('/api/profile/addresses')
      .then((r) => r.json())
      .then((d: { addresses?: Address[] }) => setList(d.addresses ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const startNew = () => { setForm(EMPTY); setEditing('new'); setError('') }
  const startEdit = (a: Address) => {
    setForm({
      title: a.title ?? '', fullName: a.fullName ?? '', province: a.province ?? '', city: a.city ?? '',
      street: a.street ?? '', alley: a.alley ?? '', plaque: a.plaque ?? '', unit: a.unit ?? '', postalCode: a.postalCode ?? '',
    })
    setEditing(a.id)
    setError('')
  }

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    if (saving) return
    setSaving(true); setError('')
    try {
      const isNew = editing === 'new'
      const res = await fetch(isNew ? '/api/profile/addresses' : `/api/profile/addresses/${editing}`, {
        method: isNew ? 'POST' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const d = await res.json() as { error?: string }
      if (!res.ok) { setError(d.error ?? 'خطا در ذخیره آدرس'); return }
      setEditing(null)
      load()
    } catch {
      setError('خطا در ارتباط با سرور')
    } finally {
      setSaving(false)
    }
  }

  const remove = async (id: string) => {
    if (!window.confirm('این آدرس حذف شود؟')) return
    await fetch(`/api/profile/addresses/${id}`, { method: 'DELETE' })
    load()
  }

  const makeDefault = async (id: string) => {
    await fetch(`/api/profile/addresses/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isDefault: true }),
    })
    load()
  }

  const set = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  return (
    <div className="bg-white rounded-2xl border border-surface-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-surface-100">
        <h2 className="text-base font-bold text-surface-800">آدرس‌های من</h2>
        {!editing && (
          <button onClick={startNew} className="btn btn-primary py-1.5 px-4 text-sm">+ افزودن آدرس</button>
        )}
      </div>

      {/* فرم افزودن/ویرایش */}
      {editing && (
        <form onSubmit={save} className="space-y-4">
          {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">{error}</p>}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-surface-700 mb-1.5">برچسب <span className="text-surface-400 font-normal">(اختیاری)</span></label>
              <input value={form.title} onChange={set('title')} className="input w-full" placeholder="مثال: خانه، محل کار" maxLength={50} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-surface-700 mb-1.5">نام گیرنده</label>
              <input value={form.fullName} onChange={set('fullName')} className="input w-full" placeholder="نام و نام‌خانوادگی" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-surface-700 mb-1.5">استان</label>
              <input value={form.province} onChange={set('province')} className="input w-full" placeholder="مثال: تهران" required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-surface-700 mb-1.5">شهر</label>
              <input value={form.city} onChange={set('city')} className="input w-full" placeholder="نام شهر" required />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-surface-700 mb-1.5">خیابان اصلی</label>
              <input value={form.street} onChange={set('street')} className="input w-full" placeholder="مثال: خیابان ولیعصر" required />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-surface-700 mb-1.5">کوچه / خیابان فرعی <span className="text-surface-400 font-normal">(اختیاری)</span></label>
              <input value={form.alley} onChange={set('alley')} className="input w-full" placeholder="کوچه گلستان" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-surface-700 mb-1.5">پلاک</label>
              <input value={form.plaque} onChange={set('plaque')} className="input w-full" placeholder="۱۲" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-surface-700 mb-1.5">واحد <span className="text-surface-400 font-normal">(اختیاری)</span></label>
              <input value={form.unit} onChange={set('unit')} className="input w-full" placeholder="۳" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-surface-700 mb-1.5">کد پستی</label>
              <input value={form.postalCode} onChange={set('postalCode')} className="input w-full" placeholder="۱۰ رقم" dir="ltr" inputMode="numeric" maxLength={10} />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="btn btn-primary py-2.5 px-6 text-sm flex-1">
              {saving ? 'در حال ذخیره...' : 'ذخیره آدرس'}
            </button>
            <button type="button" onClick={() => { setEditing(null); setError('') }} className="btn btn-ghost py-2.5 px-4 text-sm">
              انصراف
            </button>
          </div>
        </form>
      )}

      {/* لیست آدرس‌ها */}
      {!editing && (
        loading ? (
          <div className="py-10 flex justify-center">
            <div className="w-7 h-7 border-3 border-brand-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : list.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-14 h-14 rounded-2xl bg-surface-100 flex items-center justify-center mx-auto mb-3">
              <MapPinIcon size={24} className="text-surface-400" />
            </div>
            <p className="text-surface-500 text-sm">هنوز آدرسی ذخیره نشده است.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {list.map((a) => (
              <div key={a.id} className={`rounded-xl border p-4 ${a.isDefault ? 'border-brand-300 bg-brand-50/40' : 'border-surface-200 bg-surface-50'}`}>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    {a.title && <span className="font-bold text-surface-800 text-sm">{a.title}</span>}
                    {a.isDefault && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand-700 bg-brand-100 border border-brand-200 rounded-lg px-2 py-0.5">
                        <CheckIcon size={12} /> پیش‌فرض
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {!a.isDefault && (
                      <button onClick={() => makeDefault(a.id)} className="text-xs text-brand-600 hover:text-brand-700 font-semibold px-2 py-1">پیش‌فرض کن</button>
                    )}
                    <button onClick={() => startEdit(a)} className="text-xs text-surface-500 hover:text-surface-800 font-semibold px-2 py-1">ویرایش</button>
                    <button onClick={() => remove(a.id)} className="text-xs text-red-500 hover:text-red-600 font-semibold px-2 py-1">حذف</button>
                  </div>
                </div>
                <div className="text-sm text-surface-700 space-y-0.5">
                  {a.fullName && <p className="font-semibold text-surface-800">{a.fullName}</p>}
                  <p>{[a.province, a.city].filter(Boolean).join('، ')}</p>
                  <p>{[a.street, a.alley].filter(Boolean).join(' — ')}</p>
                  {(a.plaque || a.unit) && <p>پلاک {a.plaque}{a.unit ? ` — واحد ${a.unit}` : ''}</p>}
                  {a.postalCode && <p className="font-mono text-surface-500" dir="ltr">{a.postalCode}</p>}
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  )
}
