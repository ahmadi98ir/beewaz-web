'use client'

import { useState } from 'react'
import { useCart }  from '@/stores/cart'
import { useToast } from '@/stores/toast'
import { formatPrice, discountPercent } from '@/lib/utils'
import type { Dictionary } from '@/lib/i18n'

// ─── Types ────────────────────────────────────────────────────────────────────

export type ProductVariant = {
  id: string
  name: string
  price: number | null
  stock: number
}

export type ProductData = {
  id: string
  slug: string
  sku: string
  nameFa: string
  descriptionFa: string | null
  price: number
  comparePrice: number | null
  stock: number
  categoryName: string | null
  categorySlug: string | null
  images: { url: string; alt: string | null; isPrimary: boolean }[]
  specs: { keyFa: string; valueFa: string }[]
  variants: ProductVariant[]
}

// ─── Gallery ─────────────────────────────────────────────────────────────────

function Gallery({ images, name }: { images: ProductData['images']; name: string }) {
  const [active, setActive] = useState(0)
  const sorted = [...images].sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0))

  const placeholder = (
    <div className="w-full aspect-square rounded-3xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
      <span className="text-6xl opacity-30">📦</span>
    </div>
  )

  if (!sorted.length) return placeholder

  return (
    <div className="flex flex-col gap-3">
      {/* تصویر اصلی */}
      <div className="relative aspect-square rounded-3xl overflow-hidden bg-white border border-white/10 shadow-xl">
        <img
          src={sorted[active]?.url ?? sorted[0]!.url}
          alt={sorted[active]?.alt ?? name}
          className="w-full h-full object-contain p-4"
        />
      </div>

      {/* بند انگشتی */}
      {sorted.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {sorted.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={[
                'flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all',
                active === i
                  ? 'border-indigo-500 shadow-md shadow-indigo-500/20'
                  : 'border-white/10 hover:border-white/30',
              ].join(' ')}
            >
              <img src={img.url} alt={img.alt ?? name} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Variant Selector ─────────────────────────────────────────────────────────

function VariantSelector({
  variants,
  selected,
  onSelect,
}: {
  variants: ProductVariant[]
  selected: string | null
  onSelect: (id: string) => void
}) {
  if (!variants.length) return null

  return (
    <div className="space-y-2">
      <p className="text-sm text-white/50 font-medium">انتخاب مدل</p>
      <div className="flex flex-wrap gap-2">
        {variants.map((v) => {
          const isSelected = selected === v.id
          const outOfStock = v.stock === 0
          return (
            <button
              key={v.id}
              onClick={() => !outOfStock && onSelect(v.id)}
              disabled={outOfStock}
              className={[
                'px-4 py-2 rounded-xl text-sm font-medium transition-all border',
                outOfStock
                  ? 'border-white/5 text-white/20 cursor-not-allowed line-through'
                  : isSelected
                  ? 'border-indigo-500 bg-indigo-500/20 text-white shadow-md shadow-indigo-500/20'
                  : 'border-white/10 text-white/60 hover:border-white/30 hover:text-white',
              ].join(' ')}
            >
              {v.name}
              {outOfStock && <span className="ms-1 text-xs">(ناموجود)</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Main Client Component ────────────────────────────────────────────────────

export function ProductClient({
  product,
  dict,
}: {
  product: ProductData
  dict: Dictionary
}) {
  const hasVariants = product.variants.length > 0
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    hasVariants ? (product.variants.find((v) => v.stock > 0)?.id ?? null) : null
  )

  const selectedVariant = hasVariants
    ? product.variants.find((v) => v.id === selectedVariantId) ?? null
    : null

  const activePrice        = selectedVariant?.price ?? product.price
  const activeComparePrice = product.comparePrice
  const activeStock        = selectedVariant?.stock ?? product.stock
  const inStock            = activeStock > 0

  const discount = activeComparePrice ? discountPercent(activeComparePrice, activePrice) : 0

  const { addItem }  = useCart()
  const toast        = useToast()

  function handleAddToCart() {
    addItem({
      id:              product.id + (selectedVariantId ?? ''),
      nameFa:          product.nameFa + (selectedVariant ? ` — ${selectedVariant.name}` : ''),
      price:           activePrice,
      slug:            product.slug,
      categorySlug:    product.categorySlug ?? 'products',
      sku:             product.sku,
      placeholderFrom: product.slug,
      placeholderTo:   product.slug,
    })
    toast.success(`${product.nameFa} به سبد اضافه شد`)
  }

  return (
    <div className="min-h-screen bg-[#070711]" dir="rtl">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

          {/* ── گالری تصاویر ─────────────────────────────────────────────── */}
          <Gallery images={product.images} name={product.nameFa} />

          {/* ── اطلاعات محصول ────────────────────────────────────────────── */}
          <div className="space-y-6">

            {/* دسته‌بندی */}
            {product.categoryName && (
              <p className="text-xs text-indigo-400 font-medium tracking-wide uppercase">
                {product.categoryName}
              </p>
            )}

            {/* نام */}
            <h1 className="text-2xl sm:text-3xl font-bold text-white leading-snug">
              {product.nameFa}
            </h1>

            {/* قیمت */}
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold text-white">
                {formatPrice(activePrice)}
              </span>
              {activeComparePrice && activeComparePrice > activePrice && (
                <>
                  <span className="text-sm text-white/30 line-through">
                    {formatPrice(activeComparePrice)}
                  </span>
                  {discount > 0 && (
                    <span className="px-2 py-0.5 rounded-lg bg-red-500/20 text-red-400 text-xs font-bold">
                      {discount}٪ تخفیف
                    </span>
                  )}
                </>
              )}
            </div>

            {/* وضعیت موجودی */}
            <div className={[
              'inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full',
              inStock
                ? 'bg-emerald-500/15 text-emerald-400'
                : 'bg-red-500/15 text-red-400',
            ].join(' ')}>
              <span className={`w-1.5 h-1.5 rounded-full ${inStock ? 'bg-emerald-400' : 'bg-red-400'}`} />
              {inStock ? dict.product.inStock : dict.product.outOfStock}
            </div>

            {/* انتخاب variant */}
            {hasVariants && (
              <VariantSelector
                variants={product.variants}
                selected={selectedVariantId}
                onSelect={setSelectedVariantId}
              />
            )}

            {/* دکمه سبد */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleAddToCart}
                disabled={!inStock || (hasVariants && !selectedVariantId)}
                className="flex-1 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-base transition-all shadow-lg shadow-indigo-600/25"
              >
                {inStock ? dict.product.addToCart : dict.product.outOfStock}
              </button>
            </div>

            {/* توضیحات */}
            {product.descriptionFa && (
              <div className="pt-2 border-t border-white/[0.06]">
                <p className="text-sm text-white/50 mb-2 font-medium">{dict.product.description}</p>
                <p className="text-sm text-white/70 leading-relaxed whitespace-pre-line">
                  {product.descriptionFa}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── مشخصات فنی ───────────────────────────────────────────────────── */}
        {product.specs.length > 0 && (
          <div className="mt-12">
            <h2 className="text-lg font-bold text-white mb-4">{dict.product.specs}</h2>
            <div className="rounded-2xl border border-white/[0.06] overflow-hidden">
              <table className="w-full">
                <tbody className="divide-y divide-white/[0.04]">
                  {product.specs.map((s, i) => (
                    <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-3 text-sm text-white/40 font-medium w-2/5">{s.keyFa}</td>
                      <td className="px-5 py-3 text-sm text-white/80">{s.valueFa}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
