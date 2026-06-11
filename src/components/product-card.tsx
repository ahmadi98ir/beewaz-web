import Link from 'next/link'
import { formatPrice, discountPercent } from '@/lib/utils'

export type ProductCardData = {
  id: string
  slug: string
  nameFa: string
  price: number
  comparePrice: number | null
  stock: number
  categoryName: string | null
  imageUrl: string | null
}

export function ProductCard({
  product,
  lang,
}: {
  product: ProductCardData
  lang: string
}) {
  const discount = product.comparePrice
    ? discountPercent(product.price, product.comparePrice)
    : 0
  const inStock = product.stock > 0

  return (
    <Link
      href={`/${lang}/product/${product.slug}`}
      className="group flex flex-col rounded-2xl bg-white/[0.03] border border-white/[0.07] hover:border-indigo-500/30 hover:bg-white/[0.05] transition-all duration-200 overflow-hidden"
    >
      {/* تصویر */}
      <div className="relative aspect-square bg-white/[0.04] overflow-hidden">
        {product.imageUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={product.imageUrl}
            alt={product.nameFa}
            className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-5xl opacity-20">📦</span>
          </div>
        )}

        {/* badge تخفیف */}
        {discount > 0 && (
          <span className="absolute top-2 right-2 px-2 py-0.5 rounded-lg bg-red-500/90 text-white text-[10px] font-bold">
            {discount}٪
          </span>
        )}

        {/* ناموجود overlay */}
        {!inStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-xs text-white/70 font-medium bg-black/60 px-2 py-1 rounded-lg">ناموجود</span>
          </div>
        )}
      </div>

      {/* اطلاعات */}
      <div className="flex flex-col gap-2 p-3 flex-1">
        {/* دسته‌بندی */}
        {product.categoryName && (
          <p className="text-[10px] text-indigo-400/80 font-medium truncate">
            {product.categoryName}
          </p>
        )}

        {/* نام */}
        <p className="text-sm text-white/85 font-medium leading-snug line-clamp-2 flex-1">
          {product.nameFa}
        </p>

        {/* قیمت */}
        <div className="flex items-center gap-2 mt-auto pt-1">
          <span className="text-sm font-bold text-white">
            {formatPrice(product.price)}
          </span>
          {product.comparePrice && product.comparePrice > product.price && (
            <span className="text-xs text-white/30 line-through">
              {formatPrice(product.comparePrice)}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
