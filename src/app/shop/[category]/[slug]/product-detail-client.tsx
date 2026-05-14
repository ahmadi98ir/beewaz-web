'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useCart } from '@/stores/cart'
import { ProductCard } from '@/components/shop/product-card'
import { AnimateIn } from '@/components/ui/animate-in'
import { ShoppingCartIcon, HeartIcon, ShieldIcon, CheckIcon, PhoneIcon } from '@/components/ui/icons'
import { formatPrice, discountPercent } from '@/lib/utils'
import type { ShopProduct } from '@/lib/shop-product'

type Props = {
  product: ShopProduct
  related: ShopProduct[]
}

// ── گالری ─────────────────────────────────────────────────────────────────────

function ProductGallery({ product }: { product: ShopProduct }) {
  const [selected, setSelected] = useState(0)

  if (product.images.length > 0) {
    return (
      <div className="flex gap-4">
        {product.images.length > 1 && (
          <div className="flex flex-col gap-2 w-16 flex-shrink-0">
            {product.images.map((img, i) => (
              <button
                key={i}
                onClick={() => setSelected(i)}
                className={`w-16 h-16 rounded-xl border-2 overflow-hidden transition-all duration-150 ${
                  selected === i ? 'border-brand-600 shadow-sm shadow-brand-600/20' : 'border-surface-200 hover:border-surface-300'
                }`}
              >
                <img src={img.url} alt={img.alt ?? product.nameFa} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
        <div className="flex-1 aspect-square rounded-2xl overflow-hidden relative bg-white border border-surface-100">
          <img
            src={product.images[selected]?.url ?? product.images[0]!.url}
            alt={product.images[selected]?.alt ?? product.nameFa}
            className="w-full h-full object-contain p-4"
          />
          {product.isNew && (
            <div className="absolute top-4 start-4 px-3 py-1.5 rounded-lg bg-surface-900 text-white text-xs font-bold">
              جدید
            </div>
          )}
        </div>
      </div>
    )
  }

  // fallback gradient
  const variants = [
    { from: product.placeholderFrom, to: product.placeholderTo },
    { from: product.placeholderTo, to: product.placeholderFrom },
    { from: '#f8fafc', to: product.placeholderFrom },
  ]
  return (
    <div className="flex gap-4">
      <div className="flex flex-col gap-2 w-16 flex-shrink-0">
        {variants.map((v, i) => (
          <button
            key={i}
            onClick={() => setSelected(i)}
            className={`w-16 h-16 rounded-xl border-2 overflow-hidden transition-all duration-150 ${
              selected === i ? 'border-brand-600 shadow-sm shadow-brand-600/20' : 'border-surface-200 hover:border-surface-300'
            }`}
          >
            <div className="w-full h-full" style={{ background: `linear-gradient(135deg, ${v.from}, ${v.to})` }} />
          </button>
        ))}
      </div>
      <div
        className="flex-1 aspect-square rounded-2xl overflow-hidden relative"
        style={{ background: `linear-gradient(135deg, ${variants[selected]!.from}, ${variants[selected]!.to})` }}
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
          <div className="w-28 h-28 rounded-3xl bg-white/50 backdrop-blur-sm flex items-center justify-center shadow-lg">
            <span className="text-4xl font-black text-surface-400 select-none">{product.sku.replace('BW-', '')}</span>
          </div>
          <span className="text-sm font-mono text-surface-400/80">{product.sku}</span>
        </div>
        {product.isNew && (
          <div className="absolute top-4 start-4 px-3 py-1.5 rounded-lg bg-surface-900 text-white text-xs font-bold">جدید</div>
        )}
      </div>
    </div>
  )
}

// ── تب‌ها ──────────────────────────────────────────────────────────────────────

function ProductTabs({ product }: { product: ShopProduct }) {
  const [active, setActive] = useState<'desc' | 'specs' | 'reviews'>('desc')

  return (
    <div>
      <div className="flex border-b border-surface-200 mb-6">
        {([
          { key: 'desc', label: 'توضیحات' },
          { key: 'specs', label: 'مشخصات فنی' },
          { key: 'reviews', label: `نظرات (${product.reviewCount})` },
        ] as const).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActive(key)}
            className={[
              'px-5 py-3 text-sm font-semibold border-b-2 -mb-px transition-colors',
              active === key
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-surface-500 hover:text-surface-700',
            ].join(' ')}
          >
            {label}
          </button>
        ))}
      </div>

      {active === 'desc' && (
        <div className="prose prose-sm max-w-none text-surface-700 leading-relaxed">
          {product.descriptionFa ? (
            <p>{product.descriptionFa}</p>
          ) : (
            <p className="text-surface-400 italic">توضیحات محصول در دسترس نیست.</p>
          )}
        </div>
      )}

      {active === 'specs' && (
        product.specs.length > 0 ? (
          <div className="overflow-hidden rounded-2xl border border-surface-200">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-surface-100">
                {product.specs.map(({ key, value }, i) => (
                  <tr key={key} className={i % 2 === 0 ? 'bg-surface-50/50' : 'bg-white'}>
                    <td className="px-4 py-3 font-semibold text-surface-700 w-2/5">{key}</td>
                    <td className="px-4 py-3 text-surface-900">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-surface-400 italic text-sm">مشخصات فنی ثبت نشده است.</p>
        )
      )}

      {active === 'reviews' && (
        <p className="text-surface-400 italic text-sm">امکان ثبت نظر به زودی فعال می‌شود.</p>
      )}
    </div>
  )
}

// ── دکمه افزودن به سبد ────────────────────────────────────────────────────────

function AddToCartButton({ product }: { product: ShopProduct }) {
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)
  const { addItem } = useCart()

  const handleAdd = () => {
    for (let i = 0; i < qty; i++) {
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
    }
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center border border-surface-200 rounded-xl overflow-hidden">
        <button
          onClick={() => setQty((q) => Math.max(1, q - 1))}
          className="w-10 h-11 flex items-center justify-center text-surface-600 hover:bg-surface-100 transition-colors text-lg font-bold"
          aria-label="کاهش تعداد"
        >−</button>
        <span className="w-10 text-center text-sm font-bold text-surface-900">{qty}</span>
        <button
          onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
          className="w-10 h-11 flex items-center justify-center text-surface-600 hover:bg-surface-100 transition-colors text-lg font-bold"
          aria-label="افزایش تعداد"
        >+</button>
      </div>

      <button
        onClick={handleAdd}
        disabled={product.stock === 0}
        className={[
          'flex-1 btn py-3 text-base gap-2.5 transition-all duration-300',
          added ? 'bg-green-500 border-green-500 text-white' : 'btn-accent orange-glow-sm',
        ].join(' ')}
      >
        {added ? (
          <><CheckIcon size={18} />افزوده شد!</>
        ) : (
          <><ShoppingCartIcon size={18} />افزودن به سبد خرید</>
        )}
      </button>

      <button
        className="w-11 h-11 rounded-xl border border-surface-200 flex items-center justify-center text-surface-400 hover:text-brand-600 hover:border-brand-300 transition-all"
        aria-label="افزودن به علاقه‌مندی‌ها"
      >
        <HeartIcon size={18} />
      </button>
    </div>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────────

export function ProductDetailClient({ product, related }: Props) {
  const hasDiscount = !!product.comparePrice
  const discount = hasDiscount ? discountPercent(product.price, product.comparePrice!) : 0

  return (
    <div className="min-h-screen bg-surface-50">

      <div className="bg-white border-b border-surface-200">
        <div className="container-main py-3">
          <nav className="flex items-center gap-2 text-sm flex-wrap" aria-label="مسیر صفحه">
            <Link href="/" className="text-surface-500 hover:text-brand-600 transition-colors">خانه</Link>
            <span className="text-surface-300">/</span>
            <Link href="/shop" className="text-surface-500 hover:text-brand-600 transition-colors">فروشگاه</Link>
            {product.categorySlug && (
              <>
                <span className="text-surface-300">/</span>
                <Link href={`/shop?category=${product.categorySlug}`} className="text-surface-500 hover:text-brand-600 transition-colors">
                  {product.categoryName}
                </Link>
              </>
            )}
            <span className="text-surface-300">/</span>
            <span className="text-surface-900 font-medium truncate max-w-48">{product.nameFa}</span>
          </nav>
        </div>
      </div>

      <div className="container-main py-8 lg:py-12">

        <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 mb-14">

          <AnimateIn>
            <ProductGallery product={product} />
          </AnimateIn>

          <AnimateIn delay={80}>
            <div className="space-y-5">

              <div className="flex items-center justify-between gap-4">
                {product.categoryName && (
                  <Link
                    href={`/shop?category=${product.categorySlug}`}
                    className="text-sm font-semibold text-brand-600 hover:text-brand-700 transition-colors"
                  >
                    {product.categoryName}
                  </Link>
                )}
                <span className="text-xs font-mono text-surface-400 bg-surface-100 px-2.5 py-1 rounded-lg ms-auto">
                  {product.sku}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-surface-900 leading-tight">
                {product.nameFa}
              </h1>

              <div
                className="rounded-2xl p-4 space-y-1 border"
                style={hasDiscount
                  ? { background: 'rgb(249 115 22 / 0.05)', borderColor: 'rgb(249 115 22 / 0.2)' }
                  : { background: '#f8fafc', borderColor: '#e2e8f0' }}
              >
                {hasDiscount && (
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-surface-400 line-through">{formatPrice(product.comparePrice!)}</span>
                    <span className="badge-accent text-sm font-bold px-2.5 py-0.5 rounded-lg">{discount}٪ تخفیف</span>
                  </div>
                )}
                <div className="text-3xl font-black" style={{ color: hasDiscount ? '#F97316' : '#0f172a' }}>
                  {formatPrice(product.price)}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${product.stock > 5 ? 'bg-green-400' : product.stock > 0 ? 'bg-amber-400' : 'bg-red-400'}`} />
                <span className={`text-sm font-semibold ${product.stock > 5 ? 'text-green-700' : product.stock > 0 ? 'text-amber-700' : 'text-red-700'}`}>
                  {product.stock > 5 ? 'موجود در انبار' : product.stock > 0 ? `فقط ${product.stock} عدد باقی‌مانده` : 'ناموجود'}
                </span>
              </div>

              <AddToCartButton product={product} />

              <div className="grid grid-cols-3 gap-3 pt-2">
                {[
                  { icon: ShieldIcon, text: 'گارانتی ۱۸ ماهه', accent: true },
                  { icon: CheckIcon, text: 'ارسال سریع', accent: false },
                  { icon: PhoneIcon, text: 'پشتیبانی ۲۴/۷', accent: true },
                ].map(({ icon: Icon, text, accent }) => (
                  <div
                    key={text}
                    className="flex flex-col items-center gap-1.5 text-center p-3 rounded-xl border"
                    style={accent
                      ? { background: 'rgb(249 115 22 / 0.06)', borderColor: 'rgb(249 115 22 / 0.2)' }
                      : { background: '#f8fafc', borderColor: '#e2e8f0' }}
                  >
                    <Icon size={16} style={{ color: accent ? '#F97316' : '#1B3A8A' }} />
                    <span className="text-xs font-medium text-surface-600 leading-tight">{text}</span>
                  </div>
                ))}
              </div>

              {product.specs.length > 0 && (
                <div className="border-t border-surface-200 pt-4 space-y-2">
                  <p className="text-sm font-bold text-surface-700">مشخصات کلیدی:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {product.specs.slice(0, 4).map(({ key, value }) => (
                      <div key={key} className="text-xs">
                        <span className="text-surface-500">{key}: </span>
                        <span className="font-semibold text-surface-800">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </AnimateIn>
        </div>

        <AnimateIn>
          <div className="bg-white rounded-3xl border border-surface-200 p-6 lg:p-8 mb-14">
            <ProductTabs product={product} />
          </div>
        </AnimateIn>

        {related.length > 0 && (
          <AnimateIn>
            <div>
              <h2 className="text-xl font-black text-surface-900 mb-6">محصولات مرتبط</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {related.map((p, i) => (
                  <AnimateIn key={p.id} delay={i * 60}>
                    <ProductCard product={p} />
                  </AnimateIn>
                ))}
              </div>
            </div>
          </AnimateIn>
        )}

      </div>
    </div>
  )
}
