'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useQuickView } from '@/stores/quick-view'
import { useCart } from '@/stores/cart'
import { useToast } from '@/stores/toast'
import { XIcon, ShoppingCartIcon } from '@/components/ui/icons'
import { formatPrice, discountPercent } from '@/lib/utils'
import { ProductSvgIcon } from '@/components/shop/product-svg-icon'

function StarRating({ rating, count }: { rating: number; count: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <svg
            key={i}
            viewBox="0 0 12 12"
            className={`w-3.5 h-3.5 ${i < Math.floor(rating) ? 'text-amber-400' : 'text-surface-200'}`}
            fill="currentColor"
          >
            <path d="M6 0l1.5 4H12L8.5 7l1.5 4L6 9l-4 2 1.5-4L0 4h4.5z" />
          </svg>
        ))}
      </div>
      <span className="text-xs text-surface-500">
        {rating} ({new Intl.NumberFormat('fa-IR').format(count)} نظر)
      </span>
    </div>
  )
}

export function QuickViewModal() {
  const { product, hide } = useQuickView()
  const addItem = useCart((s) => s.addItem)
  const toast = useToast()

  useEffect(() => {
    if (!product) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') hide() }
    document.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [product, hide])

  if (!product) return null

  const hasDiscount = !!product.comparePrice
  const discount = hasDiscount ? discountPercent(product.price, product.comparePrice!) : 0

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      slug: product.slug,
      categorySlug: product.categorySlug,
      nameFa: product.nameFa,
      sku: product.sku,
      price: product.price,
      comparePrice: product.comparePrice,
      placeholderFrom: product.placeholderFrom,
      placeholderTo: product.placeholderTo,
    })
    toast.success(`${product.nameFa} به سبد اضافه شد`)
    hide()
  }

  return (
    <>
      <div
        className="fixed inset-0 z-[100] bg-surface-950/60 animate-fade-in"
        onClick={hide}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={product.nameFa}
        className="fixed inset-0 z-[101] flex items-center justify-center p-4"
      >
        <div
          className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slide-up shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col sm:flex-row">
            {/* Product image area */}
            <div
              className="sm:w-64 flex-shrink-0 aspect-square sm:aspect-auto rounded-t-3xl sm:rounded-t-none sm:rounded-s-3xl flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, ${product.placeholderFrom} 0%, ${product.placeholderTo} 100%)`,
              }}
            >
              <ProductSvgIcon categorySlug={product.categorySlug} size={96} />
            </div>

            {/* Info */}
            <div className="flex-1 p-6 flex flex-col gap-4 min-w-0">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-xs font-semibold text-brand-600 mb-1 block">
                    {product.categoryName}
                  </span>
                  <h2 className="text-lg font-black text-surface-900 leading-snug">
                    {product.nameFa}
                  </h2>
                </div>
                <button
                  onClick={hide}
                  className="flex-shrink-0 p-2 rounded-xl hover:bg-surface-100 transition-colors text-surface-400"
                  aria-label="بستن"
                >
                  <XIcon size={18} />
                </button>
              </div>

              <StarRating rating={product.rating} count={product.reviewCount} />

              <p className="text-sm text-surface-600 leading-relaxed">{product.descriptionFa}</p>

              {product.specs.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {product.specs.map((spec) => (
                    <div key={spec.key} className="bg-surface-50 rounded-xl px-3 py-2">
                      <p className="text-xs text-surface-400 mb-0.5">{spec.key}</p>
                      <p className="text-sm font-semibold text-surface-800">{spec.value}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Price + CTA */}
              <div className="flex items-center justify-between gap-4 pt-4 border-t border-surface-100 mt-auto flex-wrap">
                <div>
                  {hasDiscount && (
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm text-surface-400 line-through">
                        {formatPrice(product.comparePrice!)}
                      </span>
                      <span className="badge badge-brand text-xs">{discount}٪ تخفیف</span>
                    </div>
                  )}
                  <span className="text-2xl font-black text-surface-900">
                    {formatPrice(product.price)}
                  </span>
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    onClick={handleAddToCart}
                    disabled={product.stock === 0}
                    className="btn btn-primary gap-2 text-sm py-2.5"
                  >
                    <ShoppingCartIcon size={16} />
                    {product.stock === 0 ? 'ناموجود' : 'افزودن به سبد'}
                  </button>
                  <Link
                    href={`/shop/${product.categorySlug}/${product.slug}`}
                    onClick={hide}
                    className="btn btn-ghost text-sm py-2 text-center"
                  >
                    مشاهده کامل محصول
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
