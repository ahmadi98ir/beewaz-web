'use client'

import Link from 'next/link'
import { useCart } from '@/stores/cart'
import { formatPrice } from '@/lib/utils'
import { ShoppingCartIcon, XIcon, ArrowLeftIcon } from '@/components/ui/icons'

function CartItemRow({ item }: { item: import('@/stores/cart').CartItem }) {
  const { updateQuantity, removeItem } = useCart()

  return (
    <div className="flex gap-4 py-5 border-b border-surface-100 last:border-0 group">
      {/* تصویر */}
      <div
        className="w-20 h-20 rounded-2xl flex-shrink-0 flex items-center justify-center"
        style={{ background: `linear-gradient(135deg, ${item.placeholderFrom}, ${item.placeholderTo})` }}
      >
        <span className="text-xs font-black text-surface-400">{item.sku.replace('BW-', '')}</span>
      </div>

      {/* اطلاعات */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <Link
            href={`/shop/${item.categorySlug}/${item.slug}`}
            className="text-sm font-bold text-surface-900 hover:text-brand-600 transition-colors leading-snug line-clamp-2"
          >
            {item.nameFa}
          </Link>
          <button
            onClick={() => removeItem(item.id)}
            className="flex-shrink-0 p-1 rounded-lg text-surface-300 hover:text-brand-600 hover:bg-brand-50 transition-colors opacity-0 group-hover:opacity-100"
            aria-label="حذف از سبد"
          >
            <XIcon size={14} />
          </button>
        </div>
        <p className="text-xs text-surface-400 mt-1 font-mono">{item.sku}</p>

        <div className="flex items-center justify-between mt-3 gap-4">
          {/* کنترل تعداد */}
          <div className="flex items-center border border-surface-200 rounded-xl overflow-hidden">
            <button
              onClick={() => updateQuantity(item.id, item.quantity - 1)}
              className="w-8 h-8 flex items-center justify-center text-surface-600 hover:bg-surface-100 transition-colors text-base font-bold"
              aria-label="کاهش"
            >−</button>
            <span className="w-8 text-center text-sm font-bold text-surface-900 select-none">
              {item.quantity}
            </span>
            <button
              onClick={() => updateQuantity(item.id, item.quantity + 1)}
              className="w-8 h-8 flex items-center justify-center text-surface-600 hover:bg-surface-100 transition-colors text-base font-bold"
              aria-label="افزایش"
            >+</button>
          </div>

          {/* قیمت */}
          <div className="text-end">
            <p className="font-black text-surface-900 text-sm">
              {formatPrice(item.price * item.quantity)}
            </p>
            {item.quantity > 1 && (
              <p className="text-xs text-surface-400">{formatPrice(item.price)} / عدد</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CartPage() {
  const { items, subtotal, clearCart } = useCart()

  const shipping = subtotal >= 500_000 ? 0 : 80_000
  const total = subtotal + shipping

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="w-24 h-24 rounded-3xl bg-surface-100 flex items-center justify-center mx-auto mb-6">
            <ShoppingCartIcon size={40} className="text-surface-300" />
          </div>
          <h1 className="text-xl font-black text-surface-900 mb-2">سبد خرید خالی است</h1>
          <p className="text-surface-500 mb-8 text-sm">محصولات موردنظر را از فروشگاه انتخاب کنید.</p>
          <Link href="/shop" className="btn btn-accent px-8">
            رفتن به فروشگاه
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-surface-200">
        <div className="container-main py-3">
          <nav className="flex items-center gap-2 text-sm" aria-label="مسیر">
            <Link href="/" className="text-surface-500 hover:text-brand-600 transition-colors">خانه</Link>
            <span className="text-surface-300">/</span>
            <span className="text-surface-900 font-medium">سبد خرید</span>
          </nav>
        </div>
      </div>

      <div className="container-main py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-black text-surface-900">
            سبد خرید
            <span className="text-base font-semibold text-surface-400 ms-2">({items.length} محصول)</span>
          </h1>
          <button
            onClick={clearCart}
            className="text-sm text-surface-400 hover:text-brand-600 transition-colors"
          >
            پاک کردن سبد
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* آیتم‌های سبد */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl border border-surface-200 px-6">
              {items.map((item) => (
                <CartItemRow key={item.id} item={item} />
              ))}
            </div>

            <Link
              href="/shop"
              className="inline-flex items-center gap-2 mt-4 text-sm font-semibold text-brand-600 hover:text-brand-700 transition-colors group"
            >
              <ArrowLeftIcon size={16} className="transition-transform group-hover:-translate-x-1" />
              ادامه خرید
            </Link>
          </div>

          {/* خلاصه سفارش */}
          <div>
            <div className="bg-white rounded-3xl border border-surface-200 p-6 sticky top-24">
              <h2 className="text-base font-black text-surface-900 mb-5 pb-4 border-b border-surface-100">
                خلاصه سفارش
              </h2>

              <div className="space-y-3 mb-5">
                <div className="flex justify-between text-sm">
                  <span className="text-surface-500">جمع کالاها</span>
                  <span className="font-semibold text-surface-900">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-surface-500">هزینه ارسال</span>
                  <span className={`font-semibold ${shipping === 0 ? 'text-green-600' : 'text-surface-900'}`}>
                    {shipping === 0 ? 'رایگان' : formatPrice(shipping)}
                  </span>
                </div>
                {shipping === 0 && (
                  <p className="text-xs text-green-600 bg-green-50 rounded-lg px-3 py-2">
                    ✓ ارسال رایگان برای این سفارش اعمال شد
                  </p>
                )}
              </div>

              <div className="border-t border-surface-100 pt-4 mb-5">
                <div className="flex justify-between">
                  <span className="font-bold text-surface-900">مبلغ قابل پرداخت</span>
                  <span className="text-xl font-black" style={{ color: '#F97316' }}>{formatPrice(total)}</span>
                </div>
              </div>

              <Link href="/checkout" className="btn btn-accent w-full py-3.5 text-base orange-glow-sm">
                ادامه و پرداخت
              </Link>

              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-surface-400">
                <svg viewBox="0 0 16 16" className="w-4 h-4 text-green-500" fill="currentColor">
                  <path fillRule="evenodd" d="M8 1a7 7 0 100 14A7 7 0 008 1zm3.707 5.707a1 1 0 00-1.414-1.414L7 8.586 5.707 7.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                درگاه پرداخت امن — SSL
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
