import Link from 'next/link'
import { ShoppingCartIcon, HeartIcon } from '@/components/ui/icons'
import { formatPrice, discountPercent } from '@/lib/utils'
import type { MockProduct } from '@/lib/mock-data'

type Props = {
  product: MockProduct
  view?: 'grid' | 'list'
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1" aria-label={`امتیاز ${rating} از ۵`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          viewBox="0 0 12 12"
          className={`w-3 h-3 ${i < Math.floor(rating) ? 'text-amber-400' : 'text-surface-200'}`}
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M6 0l1.5 4H12L8.5 7l1.5 4L6 9l-4 2 1.5-4L0 4h4.5z" />
        </svg>
      ))}
    </div>
  )
}

export function ProductCard({ product, view = 'grid' }: Props) {
  const hasDiscount = !!product.comparePrice
  const discount = hasDiscount
    ? discountPercent(product.price, product.comparePrice!)
    : 0
  const isLowStock = product.stock > 0 && product.stock <= 5

  if (view === 'list') {
    return (
      <div className="card hover-lift flex flex-col sm:flex-row overflow-hidden group">
        {/* تصویر */}
        <Link href={`/shop/${product.categorySlug}/${product.slug}`} className="flex-shrink-0 sm:w-52">
          <ProductImage product={product} className="aspect-square sm:aspect-auto sm:h-full" />
        </Link>

        {/* محتوا */}
        <div className="flex flex-col flex-1 p-5 gap-3">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="text-xs font-semibold text-brand-600 mb-1 block">
                {product.categoryName}
              </span>
              <Link href={`/shop/${product.categorySlug}/${product.slug}`}>
                <h3 className="font-bold text-surface-900 hover:text-brand-600 transition-colors leading-snug">
                  {product.nameFa}
                </h3>
              </Link>
            </div>
            <span className="text-xs text-surface-400 font-mono flex-shrink-0">{product.sku}</span>
          </div>

          <p className="text-sm text-surface-500 leading-relaxed line-clamp-2">
            {product.descriptionFa}
          </p>

          <div className="flex items-center gap-3">
            <StarRating rating={product.rating} />
            <span className="text-xs text-surface-400">({product.reviewCount} نظر)</span>
          </div>

          <div className="flex items-center justify-between mt-auto pt-3 border-t border-surface-100">
            <div>
              <div className="text-xl font-black text-surface-900">
                {formatPrice(product.price)}
              </div>
              {hasDiscount && (
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-sm text-surface-400 line-through">
                    {formatPrice(product.comparePrice!)}
                  </span>
                  <span className="badge badge-brand text-xs">{discount}٪ تخفیف</span>
                </div>
              )}
            </div>
            <button className="btn btn-primary py-2.5 px-5 text-sm gap-2">
              <ShoppingCartIcon size={16} />
              افزودن به سبد
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="card hover-lift group relative flex flex-col">

      {/* ── تصویر محصول ──────────────────────────────────────────── */}
      <div className="relative overflow-hidden">
        <Link href={`/shop/${product.categorySlug}/${product.slug}`} tabIndex={-1}>
          <ProductImage product={product} className="aspect-square" />
        </Link>

        {/* Badges */}
        <div className="absolute top-3 start-3 flex flex-col gap-1.5">
          {product.isNew && (
            <span className="inline-flex px-2.5 py-1 text-xs font-bold rounded-lg bg-surface-900 text-white">
              جدید
            </span>
          )}
          {hasDiscount && (
            <span className="inline-flex px-2.5 py-1 text-xs font-bold rounded-lg bg-brand-600 text-white">
              {discount}٪ تخفیف
            </span>
          )}
        </div>

        {/* دکمه علاقه‌مندی */}
        <button
          className="absolute top-3 end-3 w-8 h-8 rounded-xl bg-white/90 backdrop-blur-sm flex items-center justify-center text-surface-400 hover:text-brand-600 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
          aria-label="افزودن به علاقه‌مندی‌ها"
        >
          <HeartIcon size={16} />
        </button>

        {/* دکمه افزودن به سبد — روی تصویر هنگام hover */}
        <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-250">
          <button className="btn btn-primary w-full py-2.5 text-sm gap-2 shadow-lg shadow-brand-600/30">
            <ShoppingCartIcon size={15} />
            افزودن به سبد
          </button>
        </div>

        {/* موجودی پایین */}
        {isLowStock && (
          <div className="absolute bottom-3 start-3 end-3 group-hover:opacity-0 transition-opacity">
            <div className="bg-amber-50 text-amber-700 text-xs font-semibold text-center py-1.5 px-3 rounded-lg border border-amber-200">
              فقط {product.stock} عدد باقی مانده
            </div>
          </div>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] flex items-center justify-center">
            <span className="bg-surface-900 text-white text-sm font-bold px-5 py-2 rounded-xl">
              ناموجود
            </span>
          </div>
        )}
      </div>

      {/* ── اطلاعات محصول ────────────────────────────────────────── */}
      <div className="p-4 flex flex-col flex-1 gap-2">
        {/* دسته‌بندی */}
        <span className="text-xs font-semibold text-brand-600">
          {product.categoryName}
        </span>

        {/* نام محصول */}
        <Link href={`/shop/${product.categorySlug}/${product.slug}`}>
          <h3 className="text-sm font-bold text-surface-900 hover:text-brand-600 transition-colors leading-snug line-clamp-2">
            {product.nameFa}
          </h3>
        </Link>

        {/* امتیاز */}
        <div className="flex items-center gap-2">
          <StarRating rating={product.rating} />
          <span className="text-xs text-surface-400">({product.reviewCount})</span>
        </div>

        {/* قیمت */}
        <div className="mt-auto pt-2 border-t border-surface-50">
          {hasDiscount && (
            <span className="text-xs text-surface-400 line-through block">
              {formatPrice(product.comparePrice!)}
            </span>
          )}
          <span className={`font-black ${hasDiscount ? 'text-brand-600 text-base' : 'text-surface-900 text-base'}`}>
            {formatPrice(product.price)}
          </span>
        </div>
      </div>

    </div>
  )
}

// ── Placeholder image ───────────────────────────────────────────────────────

function ProductImage({
  product,
  className = '',
}: {
  product: MockProduct
  className?: string
}) {
  return (
    <div
      className={`w-full relative transition-transform duration-500 group-hover:scale-105 ${className}`}
      style={{
        background: `linear-gradient(135deg, ${product.placeholderFrom} 0%, ${product.placeholderTo} 100%)`,
      }}
    >
      {/* SKU code به عنوان visual placeholder */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4">
        <div className="w-16 h-16 rounded-2xl bg-white/60 backdrop-blur-sm flex items-center justify-center shadow-sm">
          <span className="text-2xl font-black text-surface-400 select-none">
            {product.sku.replace('BW-', '')}
          </span>
        </div>
        <span className="text-xs font-mono text-surface-400/70 text-center leading-tight select-none">
          {product.sku}
        </span>
      </div>
    </div>
  )
}
