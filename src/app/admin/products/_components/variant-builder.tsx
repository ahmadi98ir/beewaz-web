'use client'

import { useEffect, useState, useCallback } from 'react'
import { useFormContext, useFieldArray, Controller } from 'react-hook-form'
import type { ProductFormValues, VariantRow } from './schema'
import { inputCls } from './form-card'

// input کوچک داخل جدول — بدون سفید شدن هنگام focus/autofill
const matrixInputCls = [
  'w-full rounded-lg px-2.5 py-1.5 text-xs text-white',
  'bg-[#1a1a32] border border-[rgba(255,255,255,0.08)]',
  'placeholder:text-white/20',
  'focus:outline-none focus:border-indigo-500/50 focus:bg-[#1e1e3a]',
  '[&:-webkit-autofill]:[box-shadow:0_0_0_1000px_#1a1a32_inset]',
  '[&:-webkit-autofill]:[-webkit-text-fill-color:rgb(255_255_255)]',
  '[color-scheme:dark]',
  'transition-colors duration-150',
].join(' ')

const matrixInputErrCls = matrixInputCls.replace('border-[rgba(255,255,255,0.08)]', 'border-red-500/50')

// ─── Types ────────────────────────────────────────────────────────────────────

interface AttributeValue {
  id: string
  valueFa: string
  colorHex: string | null
}

interface AttributeType {
  id: string
  nameFa: string
  slug: string
  inputType: string
  values: AttributeValue[]
}

// ─── Cartesian product helper ─────────────────────────────────────────────────

function cartesian(arrays: AttributeValue[][]): AttributeValue[][] {
  return arrays.reduce<AttributeValue[][]>(
    (acc, curr) => acc.flatMap((a) => curr.map((b) => [...a, b])),
    [[]]
  )
}

// ─── Attribute Selector ───────────────────────────────────────────────────────

function AttributeValuePill({
  value, selected, onClick,
}: {
  value: AttributeValue
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
        selected
          ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300'
          : 'bg-white/[0.04] border-white/[0.10] text-white/50 hover:text-white/80 hover:border-white/20'
      }`}
    >
      {value.colorHex && (
        <span
          className="w-3 h-3 rounded-full border border-white/20 flex-shrink-0"
          style={{ background: value.colorHex }}
        />
      )}
      {value.valueFa}
    </button>
  )
}

// ─── Variant row in matrix table ─────────────────────────────────────────────

function VariantMatrixRow({ index }: { index: number }) {
  const { register, control, watch, formState: { errors } } = useFormContext<ProductFormValues>()
  const row = watch(`variants.${index}`)!
  if (!row) return null
  const rowErrors = errors.variants?.[index]

  return (
    <tr className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
      {/* نام ترکیب */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2 flex-wrap">
          {row.label.split(' / ').map((part, i) => (
            <span key={i} className="px-2 py-0.5 rounded-md bg-white/[0.06] text-white/70 text-xs font-medium">
              {part}
            </span>
          ))}
        </div>
      </td>

      {/* SKU */}
      <td className="px-3 py-3 w-36">
        <input
          {...register(`variants.${index}.sku`)}
          placeholder="اختیاری"
          className={rowErrors?.sku ? matrixInputErrCls : matrixInputCls}
          dir="ltr"
        />
      </td>

      {/* قیمت */}
      <td className="px-3 py-3 w-36">
        <div className="relative">
          <input
            {...register(`variants.${index}.price`)}
            type="number"
            placeholder="ریال"
            className={rowErrors?.price ? matrixInputErrCls : matrixInputCls}
            dir="ltr"
          />
          {rowErrors?.price && (
            <span className="absolute -bottom-4 right-0 text-[10px] text-red-400">{rowErrors.price.message}</span>
          )}
        </div>
      </td>

      {/* موجودی */}
      <td className="px-3 py-3 w-28">
        <input
          {...register(`variants.${index}.stock`)}
          type="number"
          placeholder="۰"
          className={rowErrors?.stock ? matrixInputErrCls : matrixInputCls}
          dir="ltr"
        />
      </td>

      {/* فعال */}
      <td className="px-3 py-3 w-16 text-center">
        <Controller
          control={control}
          name={`variants.${index}.isActive`}
          render={({ field }) => (
            <button
              type="button"
              onClick={() => field.onChange(!field.value)}
              className={`w-9 h-5 rounded-full transition-colors relative ${field.value ? 'bg-indigo-500' : 'bg-white/[0.12]'}`}
            >
              <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${field.value ? 'translate-x-0.5' : 'translate-x-4'}`} />
            </button>
          )}
        />
      </td>
    </tr>
  )
}

// ─── Main Variant Builder ─────────────────────────────────────────────────────

export function VariantBuilder() {
  const { watch, setValue, control, formState: { errors } } = useFormContext<ProductFormValues>()
  const { fields, replace } = useFieldArray({ control, name: 'variants' })

  const [attributeTypes, setAttributeTypes] = useState<AttributeType[]>([])
  const [loading, setLoading] = useState(true)
  // انتخاب‌های کاربر: typeId -> Set of valueIds
  const [selections, setSelections] = useState<Record<string, Set<string>>>({})

  const hasVariants = watch('hasVariants')

  useEffect(() => {
    fetch('/api/admin/attributes')
      .then((r) => r.json())
      .then((d: { attributes?: AttributeType[] }) => {
        setAttributeTypes(d.attributes ?? [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  // بازسازی ماتریس هر بار که selections تغییر کند
  const rebuildMatrix = useCallback((sels: Record<string, Set<string>>, types: AttributeType[]) => {
    const activeGroups = types
      .map((t) => ({
        type: t,
        chosen: t.values.filter((v) => sels[t.id]?.has(v.id)),
      }))
      .filter((g) => g.chosen.length > 0)

    if (activeGroups.length === 0) {
      replace([])
      return
    }

    const combos = cartesian(activeGroups.map((g) => g.chosen))
    const rows: VariantRow[] = combos.map((combo) => ({
      key:               combo.map((v) => v.id).join('|'),
      label:             combo.map((v) => v.valueFa).join(' / '),
      attributeValueIds: combo.map((v) => v.id),
      sku:               '',
      price:             0,
      comparePrice:      undefined,
      stock:             0,
      isActive:          true,
    }))

    // ادغام با مقادیر قدیمی (حفظ price/stock وارد شده قبلی)
    const oldMap = new Map(fields.map((f) => [f.key, f]))
    const merged = rows.map((r) => {
      const old = oldMap.get(r.key)
      return old ? { ...r, price: old.price, stock: old.stock, sku: old.sku ?? '', isActive: old.isActive } : r
    })
    replace(merged)
  }, [fields, replace])

  function toggleValue(typeId: string, valueId: string) {
    setSelections((prev) => {
      const next = { ...prev }
      const set = new Set(next[typeId] ?? [])
      if (set.has(valueId)) set.delete(valueId)
      else set.add(valueId)
      next[typeId] = set
      rebuildMatrix(next, attributeTypes)
      return next
    })
  }

  if (!hasVariants) return null

  return (
    <div className="space-y-6">
      {/* انتخاب ویژگی‌ها */}
      {loading ? (
        <div className="text-white/30 text-sm animate-pulse">در حال بارگذاری ویژگی‌ها...</div>
      ) : attributeTypes.length === 0 ? (
        <div className="text-center py-8 text-white/30 text-sm">
          هنوز هیچ ویژگی‌ای تعریف نشده.
          <br />
          <span className="text-xs mt-1 block">از بخش تنظیمات → ویژگی‌ها، رنگ و سایز اضافه کنید.</span>
        </div>
      ) : (
        <div className="space-y-4">
          {attributeTypes.map((type) => (
            <div key={type.id}>
              <p className="text-xs font-semibold text-white/50 uppercase tracking-wide mb-2">{type.nameFa}</p>
              <div className="flex flex-wrap gap-2">
                {type.values.map((v) => (
                  <AttributeValuePill
                    key={v.id}
                    value={v}
                    selected={selections[type.id]?.has(v.id) ?? false}
                    onClick={() => toggleValue(type.id, v.id)}
                  />
                ))}
                {type.values.length === 0 && (
                  <span className="text-xs text-white/25">مقداری برای این ویژگی تعریف نشده</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ماتریس Variant */}
      {fields.length > 0 && (
        <div className="rounded-xl border border-white/[0.08] overflow-hidden">
          <div className="px-4 py-2.5 bg-white/[0.03] border-b border-white/[0.06] flex items-center justify-between">
            <p className="text-xs font-semibold text-white/50">
              ماتریس Variant — {fields.length} ترکیب
            </p>
            <button
              type="button"
              onClick={() => {
                replace(fields.map((f) => ({ ...f, price: fields[0]?.price ?? 0, stock: fields[0]?.stock ?? 0 })))
              }}
              className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              یکسان‌سازی قیمت‌ها
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  {['ترکیب', 'SKU', 'قیمت (ریال)', 'موجودی', 'فعال'].map((h) => (
                    <th key={h} className="px-4 py-2.5 text-right text-[11px] font-semibold text-white/30 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {fields.map((_, i) => (
                  <VariantMatrixRow key={fields[i]!.key} index={i} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {errors.variants && typeof errors.variants.message === 'string' && (
        <p className="text-xs text-red-400">{errors.variants.message}</p>
      )}
    </div>
  )
}
