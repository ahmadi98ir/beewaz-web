'use client'

import { useState, useTransition, useRef, useEffect } from 'react'
import {
  createAttributeType, updateAttributeType, deleteAttributeType,
  createAttributeValue, updateAttributeValue, deleteAttributeValue,
} from '../actions'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AttrValue {
  id: string
  valueFa: string
  valueEn: string | null
  colorHex: string | null
  sortOrder: number
}

export interface AttrType {
  id: string
  nameFa: string
  slug: string
  inputType: string
  sortOrder: number
  values: AttrValue[]
}

// ─── Shared Styles ────────────────────────────────────────────────────────────

const inputCls = [
  'w-full rounded-xl px-3.5 py-2.5',
  'bg-[#1e1e3a] border border-[rgba(255,255,255,0.10)]',
  'text-white text-sm placeholder:text-white/25',
  'focus:outline-none focus:border-indigo-500/60 focus:bg-[#222240]',
  '[color-scheme:dark] transition-colors duration-150',
].join(' ')

const INPUT_TYPES = [
  { value: 'select',       label: 'لیست انتخابی' },
  { value: 'color_swatch', label: 'رنگ‌پلت' },
  { value: 'button',       label: 'دکمه‌ای' },
]

// ─── Type Modal ───────────────────────────────────────────────────────────────

function TypeModal({
  initial, onClose, onSave,
}: {
  initial?: AttrType | null
  onClose: () => void
  onSave: (data: { nameFa: string; slug: string; inputType: string; sortOrder: number }) => Promise<string | null>
}) {
  const [nameFa, setNameFa]       = useState(initial?.nameFa ?? '')
  const [slug, setSlug]           = useState(initial?.slug ?? '')
  const [inputType, setInputType] = useState(initial?.inputType ?? 'select')
  const [sortOrder, setSortOrder] = useState(initial?.sortOrder ?? 0)
  const [error, setError]         = useState('')
  const [pending, startTransition] = useTransition()
  const nameRef = useRef<HTMLInputElement>(null)

  useEffect(() => { nameRef.current?.focus() }, [])

  function slugify(str: string) {
    return str.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-').replace(/^-|-$/g, '')
  }

  function handleNameChange(v: string) {
    setNameFa(v)
    if (!initial) setSlug(slugify(v))
  }

  function submit() {
    setError('')
    startTransition(async () => {
      const err = await onSave({ nameFa, slug, inputType, sortOrder })
      if (err) setError(err)
      else onClose()
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-md bg-[#0f0f22] border border-white/[0.10] rounded-2xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
          <h3 className="text-white font-bold">{initial ? 'ویرایش ویژگی' : 'ویژگی جدید'}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/[0.06] hover:bg-white/[0.10] flex items-center justify-center text-white/50 transition-colors">
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-white/60 uppercase tracking-wide">نام ویژگی <span className="text-red-400">*</span></label>
            <input ref={nameRef} value={nameFa} onChange={(e) => handleNameChange(e.target.value)} placeholder="مثلاً: رنگ" className={inputCls} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-white/60 uppercase tracking-wide">اسلاگ <span className="text-red-400">*</span></label>
            <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="color" className={inputCls} dir="ltr" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-white/60 uppercase tracking-wide">نوع نمایش</label>
            <select value={inputType} onChange={(e) => setInputType(e.target.value)} className={inputCls}>
              {INPUT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-white/60 uppercase tracking-wide">ترتیب نمایش</label>
            <input type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} className={inputCls} dir="ltr" />
          </div>
          {error && <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 px-6 pb-5">
          <button
            onClick={submit}
            disabled={pending || !nameFa.trim() || !slug.trim()}
            className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-bold transition-all"
          >
            {pending ? 'در حال ذخیره...' : 'ذخیره'}
          </button>
          <button onClick={onClose} className="px-4 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.10] text-white/60 text-sm transition-colors">
            انصراف
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Value Row (inline edit) ──────────────────────────────────────────────────

function ValueRow({
  value, isColorType,
  onUpdate, onDelete,
}: {
  value: AttrValue
  isColorType: boolean
  onUpdate: (id: string, data: Partial<AttrValue>) => void
  onDelete: (id: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [valueFa, setValueFa]   = useState(value.valueFa)
  const [valueEn, setValueEn]   = useState(value.valueEn ?? '')
  const [colorHex, setColorHex] = useState(value.colorHex ?? '#6366f1')
  const [pending, start]        = useTransition()

  function save() {
    start(async () => {
      const res = await updateAttributeValue(value.id, {
        valueFa, valueEn, colorHex: isColorType ? colorHex : undefined, sortOrder: value.sortOrder,
      })
      if (res.success) {
        onUpdate(value.id, { valueFa, valueEn: valueEn || null, colorHex: isColorType ? colorHex : null })
        setEditing(false)
      }
    })
  }

  function remove() {
    start(async () => {
      const res = await deleteAttributeValue(value.id)
      if (res.success) onDelete(value.id)
    })
  }

  if (editing) {
    return (
      <div className="flex items-center gap-2 px-4 py-2.5 bg-indigo-500/5 border-b border-white/[0.04]">
        {isColorType && (
          <input type="color" value={colorHex} onChange={(e) => setColorHex(e.target.value)}
            className="w-9 h-9 rounded-lg border border-white/10 bg-[#1e1e3a] cursor-pointer flex-shrink-0 p-0.5" />
        )}
        <input value={valueFa} onChange={(e) => setValueFa(e.target.value)}
          placeholder="نام فارسی" className={inputCls + ' py-2'} />
        <input value={valueEn} onChange={(e) => setValueEn(e.target.value)}
          placeholder="نام انگلیسی" className={inputCls + ' py-2'} dir="ltr" />
        <button onClick={save} disabled={pending || !valueFa.trim()}
          className="px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold transition-all whitespace-nowrap">
          {pending ? '...' : 'ذخیره'}
        </button>
        <button onClick={() => setEditing(false)}
          className="px-3 py-2 rounded-lg bg-white/[0.06] hover:bg-white/[0.10] text-white/50 text-xs transition-colors whitespace-nowrap">
          لغو
        </button>
      </div>
    )
  }

  return (
    <div className="group flex items-center gap-3 px-4 py-2.5 border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
      {isColorType && (
        <span className="w-5 h-5 rounded-full border border-white/20 flex-shrink-0"
          style={{ background: value.colorHex ?? '#888' }} />
      )}
      <span className="flex-1 text-sm text-white/80">{value.valueFa}</span>
      {value.valueEn && <span className="text-xs text-white/30 font-mono">{value.valueEn}</span>}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => setEditing(true)}
          className="w-7 h-7 rounded-lg bg-white/[0.06] hover:bg-white/[0.10] flex items-center justify-center text-white/50 hover:text-white transition-all">
          <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
            <path d="M11.013 1.427a1.75 1.75 0 012.474 0l1.086 1.086a1.75 1.75 0 010 2.474l-8.61 8.61c-.21.21-.47.364-.756.445l-3.251.93a.75.75 0 01-.927-.928l.929-3.25c.081-.286.235-.547.445-.757l8.61-8.61zm1.414 1.06a.25.25 0 00-.354 0L10.811 3.75l1.439 1.44 1.263-1.263a.25.25 0 000-.354l-1.086-1.086zM11.189 6.25L9.75 4.81 3.34 11.22a.25.25 0 00-.068.108l-.618 2.160 2.160-.618a.25.25 0 00.108-.068l6.41-6.41-.143-.142z" />
          </svg>
        </button>
        <button onClick={remove} disabled={pending}
          className="w-7 h-7 rounded-lg bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center text-red-400/60 hover:text-red-400 transition-all">
          <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
            <path d="M6.5 1.75a.25.25 0 01.25-.25h2.5a.25.25 0 01.25.25V3h-3V1.75zm4.5 0V3h2.25a.75.75 0 010 1.5H2.75a.75.75 0 010-1.5H5V1.75C5 .784 5.784 0 6.75 0h2.5C10.216 0 11 .784 11 1.75zM4.496 6.675a.75.75 0 10-1.492.15l.66 6.6A1.75 1.75 0 005.41 15h5.178a1.75 1.75 0 001.746-1.577l.66-6.6a.75.75 0 00-1.492-.149l-.66 6.6a.25.25 0 01-.249.226H5.41a.25.25 0 01-.249-.226l-.66-6.6-.005.001z" />
          </svg>
        </button>
      </div>
    </div>
  )
}

// ─── Add Value Form ───────────────────────────────────────────────────────────

function AddValueForm({ typeId, isColorType, onAdd }: {
  typeId: string
  isColorType: boolean
  onAdd: (v: AttrValue) => void
}) {
  const [valueFa, setValueFa]   = useState('')
  const [valueEn, setValueEn]   = useState('')
  const [colorHex, setColorHex] = useState('#6366f1')
  const [error, setError]       = useState('')
  const [pending, start]        = useTransition()
  const inputRef = useRef<HTMLInputElement>(null)

  function submit() {
    if (!valueFa.trim()) return
    setError('')
    start(async () => {
      const res = await createAttributeValue({
        typeId, valueFa, valueEn: valueEn || undefined,
        colorHex: isColorType ? colorHex : undefined,
        sortOrder: 0,
      })
      if (res.success) {
        onAdd({ id: res.id, valueFa, valueEn: valueEn || null, colorHex: isColorType ? colorHex : null, sortOrder: 0 })
        setValueFa(''); setValueEn('')
        inputRef.current?.focus()
      } else {
        setError(res.error)
      }
    })
  }

  return (
    <div className="px-4 py-3 bg-white/[0.02] border-t border-white/[0.06] space-y-2">
      <div className="flex items-center gap-2">
        {isColorType && (
          <input type="color" value={colorHex} onChange={(e) => setColorHex(e.target.value)}
            className="w-9 h-9 rounded-lg border border-white/10 bg-[#1e1e3a] cursor-pointer flex-shrink-0 p-0.5" />
        )}
        <input ref={inputRef} value={valueFa} onChange={(e) => setValueFa(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder="نام فارسی مقدار..." className={inputCls + ' py-2'} />
        <input value={valueEn} onChange={(e) => setValueEn(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder="نام انگلیسی (اختیاری)" className={inputCls + ' py-2'} dir="ltr" />
        <button onClick={submit} disabled={pending || !valueFa.trim()}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5">
          <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
            <path d="M7.75 2a.75.75 0 01.75.75V7h4.25a.75.75 0 010 1.5H8.5v4.25a.75.75 0 01-1.5 0V8.5H2.75a.75.75 0 010-1.5H7V2.75A.75.75 0 017.75 2z" />
          </svg>
          افزودن
        </button>
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}

// ─── Values Panel ─────────────────────────────────────────────────────────────

function ValuesPanel({ type, onClose }: { type: AttrType; onClose: () => void }) {
  const [values, setValues] = useState<AttrValue[]>(type.values)
  const isColorType = type.inputType === 'color_swatch'

  function handleAdd(v: AttrValue) {
    setValues((p) => [...p, v])
  }
  function handleUpdate(id: string, data: Partial<AttrValue>) {
    setValues((p) => p.map((v) => v.id === id ? { ...v, ...data } : v))
  }
  function handleDelete(id: string) {
    setValues((p) => p.filter((v) => v.id !== id))
  }

  return (
    <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
            <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4 text-indigo-400">
              <path d="M2 2.75A.75.75 0 012.75 2h10.5a.75.75 0 010 1.5H2.75A.75.75 0 012 2.75zm0 5A.75.75 0 012.75 7h10.5a.75.75 0 010 1.5H2.75A.75.75 0 012 7.75zm0 5a.75.75 0 01.75-.75h5.5a.75.75 0 010 1.5h-5.5a.75.75 0 01-.75-.75z" />
            </svg>
          </span>
          <div>
            <h3 className="text-white font-bold text-sm">مقادیر: {type.nameFa}</h3>
            <p className="text-white/30 text-xs">{values.length} مقدار تعریف شده</p>
          </div>
        </div>
        <button onClick={onClose}
          className="w-8 h-8 rounded-lg bg-white/[0.06] hover:bg-white/[0.10] flex items-center justify-center text-white/40 hover:text-white/70 transition-colors">
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
          </svg>
        </button>
      </div>

      {/* Values list */}
      <div className="divide-y divide-transparent">
        {values.length === 0 ? (
          <div className="px-6 py-8 text-center text-white/25 text-sm">
            هنوز مقداری تعریف نشده — از فرم زیر اضافه کنید
          </div>
        ) : (
          values.map((v) => (
            <ValueRow key={v.id} value={v} isColorType={isColorType}
              onUpdate={handleUpdate} onDelete={handleDelete} />
          ))
        )}
      </div>

      {/* Add value form */}
      <AddValueForm typeId={type.id} isColorType={isColorType} onAdd={handleAdd} />
    </div>
  )
}

// ─── Main Client Component ────────────────────────────────────────────────────

export function AttributesClient({ initial }: { initial: AttrType[] }) {
  const [types, setTypes]           = useState<AttrType[]>(initial)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [modalType, setModalType]   = useState<AttrType | 'new' | null>(null)
  const [modalOpen, setModalOpen]   = useState(false)
  const [, startDelete]             = useTransition()

  const selectedType = types.find((t) => t.id === selectedId) ?? null

  // ─── Type CRUD ─────────────────────────────────────────────────────────────

  async function handleSaveType(data: { nameFa: string; slug: string; inputType: string; sortOrder: number }): Promise<string | null> {
    const current = modalType
    if (current === 'new') {
      const res = await createAttributeType(data)
      if (!res.success) return res.error
      setTypes((p) => [...p, { id: res.id, ...data, values: [] }])
    } else if (current !== null) {
      const res = await updateAttributeType(current.id, data)
      if (!res.success) return res.error
      setTypes((p) => p.map((t) => t.id === current.id ? { ...t, ...data } : t))
    }
    return null
  }

  function handleDeleteType(id: string) {
    if (!confirm('آیا از حذف این ویژگی و تمام مقادیر آن اطمینان دارید؟')) return
    startDelete(async () => {
      const res = await deleteAttributeType(id)
      if (res.success) {
        setTypes((p) => p.filter((t) => t.id !== id))
        if (selectedId === id) setSelectedId(null)
      }
    })
  }

  const INPUT_TYPE_LABELS: Record<string, string> = {
    select: 'لیست انتخابی', color_swatch: 'رنگ‌پلت', button: 'دکمه‌ای',
  }

  return (
    <>
      {/* ─── Attribute Types Table ────────────────────────────────────────── */}
      <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center text-white/60">
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path d="M10 1a6 6 0 00-3.815 10.631C7.237 12.5 8 13.443 8 14.456v.644a.75.75 0 00.572.729 6.016 6.016 0 002.856 0A.75.75 0 0012 15.1v-.644c0-1.013.762-1.957 1.815-2.825A6 6 0 0010 1zM8.863 17.414a.75.75 0 00-.226 1.483 9.066 9.066 0 002.726 0 .75.75 0 00-.226-1.483 7.553 7.553 0 01-2.274 0z" />
              </svg>
            </span>
            <div>
              <h2 className="text-white font-bold text-sm">ویژگی‌های محصول</h2>
              <p className="text-white/40 text-xs">{types.length} ویژگی تعریف شده</p>
            </div>
          </div>
          <button
            onClick={() => { setModalType('new'); setModalOpen(true) }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-all"
          >
            <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
              <path d="M7.75 2a.75.75 0 01.75.75V7h4.25a.75.75 0 010 1.5H8.5v4.25a.75.75 0 01-1.5 0V8.5H2.75a.75.75 0 010-1.5H7V2.75A.75.75 0 017.75 2z" />
            </svg>
            ویژگی جدید
          </button>
        </div>

        {/* Table */}
        {types.length === 0 ? (
          <div className="px-6 py-16 text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.04] flex items-center justify-center mx-auto">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-8 h-8 text-white/20">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
              </svg>
            </div>
            <p className="text-white/30 text-sm">هنوز هیچ ویژگی‌ای تعریف نشده</p>
            <p className="text-white/20 text-xs">برای افزودن اولین ویژگی روی «ویژگی جدید» کلیک کنید</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  {['نام ویژگی', 'اسلاگ', 'نوع نمایش', 'تعداد مقادیر', 'عملیات'].map((h) => (
                    <th key={h} className="px-5 py-3 text-right text-[11px] font-semibold text-white/30 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {types.map((type) => (
                  <tr
                    key={type.id}
                    className={`border-b border-white/[0.04] transition-colors cursor-pointer ${
                      selectedId === type.id
                        ? 'bg-indigo-500/10'
                        : 'hover:bg-white/[0.02]'
                    }`}
                    onClick={() => setSelectedId(selectedId === type.id ? null : type.id)}
                  >
                    <td className="px-5 py-3.5">
                      <span className="text-sm font-semibold text-white">{type.nameFa}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="font-mono text-xs text-white/40 bg-white/[0.05] px-2 py-1 rounded-md">{type.slug}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        type.inputType === 'color_swatch'
                          ? 'bg-pink-500/15 text-pink-300'
                          : type.inputType === 'button'
                          ? 'bg-amber-500/15 text-amber-300'
                          : 'bg-indigo-500/15 text-indigo-300'
                      }`}>
                        {INPUT_TYPE_LABELS[type.inputType] ?? type.inputType}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-sm text-white/60">{type.values.length} مقدار</span>
                    </td>
                    <td className="px-5 py-3.5" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedId(selectedId === type.id ? null : type.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                            selectedId === type.id
                              ? 'bg-indigo-500/20 text-indigo-300'
                              : 'bg-white/[0.05] text-white/50 hover:bg-white/[0.10] hover:text-white'
                          }`}
                        >
                          {selectedId === type.id ? 'بستن' : 'مقادیر'}
                        </button>
                        <button
                          onClick={() => { setModalType(type); setModalOpen(true) }}
                          className="w-7 h-7 rounded-lg bg-white/[0.05] hover:bg-white/[0.10] flex items-center justify-center text-white/40 hover:text-white transition-all"
                        >
                          <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
                            <path d="M11.013 1.427a1.75 1.75 0 012.474 0l1.086 1.086a1.75 1.75 0 010 2.474l-8.61 8.61c-.21.21-.47.364-.756.445l-3.251.93a.75.75 0 01-.927-.928l.929-3.25c.081-.286.235-.547.445-.757l8.61-8.61zm1.414 1.06a.25.25 0 00-.354 0L10.811 3.75l1.439 1.44 1.263-1.263a.25.25 0 000-.354l-1.086-1.086zM11.189 6.25L9.75 4.81 3.34 11.22a.25.25 0 00-.068.108l-.618 2.160 2.160-.618a.25.25 0 00.108-.068l6.41-6.41-.143-.142z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteType(type.id)}
                          className="w-7 h-7 rounded-lg bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center text-red-400/50 hover:text-red-400 transition-all"
                        >
                          <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
                            <path d="M6.5 1.75a.25.25 0 01.25-.25h2.5a.25.25 0 01.25.25V3h-3V1.75zm4.5 0V3h2.25a.75.75 0 010 1.5H2.75a.75.75 0 010-1.5H5V1.75C5 .784 5.784 0 6.75 0h2.5C10.216 0 11 .784 11 1.75zM4.496 6.675a.75.75 0 10-1.492.15l.66 6.6A1.75 1.75 0 005.41 15h5.178a1.75 1.75 0 001.746-1.577l.66-6.6a.75.75 0 00-1.492-.149l-.66 6.6a.25.25 0 01-.249.226H5.41a.25.25 0 01-.249-.226l-.66-6.6-.005.001z" />
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

      {/* ─── Values Panel ──────────────────────────────────────────────────── */}
      {selectedType && (
        <ValuesPanel
          type={selectedType}
          onClose={() => setSelectedId(null)}
        />
      )}

      {/* ─── Type Modal ────────────────────────────────────────────────────── */}
      {modalOpen && (
        <TypeModal
          initial={modalType === 'new' ? null : modalType}
          onClose={() => setModalOpen(false)}
          onSave={handleSaveType}
        />
      )}
    </>
  )
}
