'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useCart, cartCount, cartSubtotal } from '@/stores/cart'
import type { CartItem } from '@/stores/cart'
import { formatPrice, toFaDigits } from '@/lib/utils'
import { XIcon, ShoppingCartIcon, ArrowLeftIcon } from '@/components/ui/icons'

const DEFAULT_SHIPPING = { shippingCost: 150_000, freeThreshold: 2_000_000 }

function useShippingConfig() {
  const [config, setConfig] = useState(DEFAULT_SHIPPING)
  useEffect(() => {
    fetch('/api/shop/shipping')
      .then((r) => r.json())
      .then((d) => setConfig(d as typeof DEFAULT_SHIPPING))
      .catch(() => {})
  }, [])
  return config
}

// ─── Single cart item row ─────────────────────────────────────────────────────

function CartItemRow({ item }: { item: CartItem }) {
  const { updateQuantity, removeItem } = useCart()

  return (
    <div className="flex gap-3 py-4 border-b border-surface-100 last:border-0 group">
      {/* تصویر محصول */}
      <div
        className="w-16 h-16 rounded-xl flex-shrink-0 flex items-center justify-center text-[10px] font-black opacity-80"
        style={{
          background: `linear-gradient(135deg, ${item.placeholderFrom}, ${item.placeholderTo})`,
          color: 'rgba(255,255,255,0.9)',
        }}
      >
        {item.sku.replace('BW-', '')}
      </div>

      {/* اطلاعات */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2">
          <Link
            href={`/shop/${item.categorySlug}/${item.slug}`}
            className="flex-1 text-sm font-bold text-surface-900 hover:text-brand-600 transition-colors leading-snug line-clamp-2"
          >
            {item.nameFa}
          </Link>
        </div>
        <p className="text-[11px] text-surface-400 mt-0.5 font-mono">{item.sku}</p>

        <div className="flex items-center justify-between mt-2.5 gap-2">
          {/* کنترل تعداد */}
          <div className="flex items-center border border-surface-200 rounded-lg overflow-hidden">
            <button
              onClick={() => updateQuantity(item.id, item.quantity - 1)}
              className="w-7 h-7 flex items-center justify-center text-surface-600 hover:bg-surface-100 transition-colors text-sm font-bold"
              aria-label="کاهش تعداد"
            >−</button>
            <span className="w-7 text-center text-xs font-bold text-surface-900 select-none tabular-nums">
              {toFaDigits(item.quantity)}
            </span>
            <button
              onClick={() => updateQuantity(item.id, item.quantity + 1)}
              className="w-7 h-7 flex items-center justify-center text-surface-600 hover:bg-surface-100 transition-colors text-sm font-bold"
              aria-label="افزایش تعداد"
            >+</button>
          </div>

          {/* قیمت و حذف */}
          <div className="flex items-center gap-2">
            <div className="text-end">
              <p className="text-sm font-black text-surface-900">
                {formatPrice(item.price * item.quantity)}
              </p>
              {item.quantity > 1 && (
                <p className="text-[10px] text-surface-400">{formatPrice(item.price)} / عدد</p>
              )}
            </div>
            <button
              onClick={() => removeItem(item.id)}
              className="p-1.5 rounded-lg text-surface-300 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
              aria-label="حذف از سبد"
            >
              <XIcon size={12} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Floating Cart Panel ──────────────────────────────────────────────────────

export function FloatingCart() {
  const { items, isOpen, closeCart } = useCart()
  const count = useCart(cartCount)
  const subtotal = useCart(cartSubtotal)
  const { shippingCost, freeThreshold } = useShippingConfig()

  const shipping = subtotal >= freeThreshold ? 0 : shippingCost
  const total = subtotal + shipping

  // بستن با کلید Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeCart()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [closeCart])

  // قفل اسکرول صفحه هنگام باز بودن پنل
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  return (
    <>
      {/* پس‌زمینه تیره */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* پنل سبد خرید — از سمت چپ می‌لغزد */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-full max-w-[420px] bg-white flex flex-col
          transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ boxShadow: '4px 0 40px rgba(0,0,0,0.15)' }}
        role="dialog"
        aria-modal="true"
        aria-label="سبد خرید"
      >

        {/* ─── هدر پنل ──────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-surface-100 bg-white">
          <div className="flex items-center gap-2.5">
            <ShoppingCartIcon size={20} className="text-surface-700" />
            <h2 className="font-black text-surface-900 text-base">سبد خرید</h2>
            {count > 0 && (
              <span
                className="inline-flex items-center justify-center min-w-[22px] h-[22px] px-1 rounded-full text-white text-xs font-bold"
                style={{ background: '#F97316' }}
              >
                {count > 99 ? '۹۹+' : toFaDigits(count)}
              </span>
            )}
          </div>
          <button
            onClick={closeCart}
            className="p-2 rounded-xl text-surface-400 hover:text-surface-700 hover:bg-surface-100 transition-colors"
            aria-label="بستن سبد خرید"
          >
            <XIcon size={18} />
          </button>
        </div>

        {/* ─── آیتم‌ها ──────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-5">
          {items.length === 0 ? (
            /* حالت خالی */
            <div className="flex flex-col items-center justify-center h-full py-16 text-center">
              <div className="w-20 h-20 rounded-3xl bg-surface-100 flex items-center justify-center mb-4">
                <ShoppingCartIcon size={36} className="text-surface-300" />
              </div>
              <p className="font-bold text-surface-600 mb-1">سبد خرید خالی است</p>
              <p className="text-surface-400 text-sm mb-6">
                محصولات موردنظر را از فروشگاه انتخاب کنید
              </p>
              <Link
                href="/shop"
                onClick={closeCart}
                className="btn btn-accent py-2.5 px-7 text-sm"
              >
                رفتن به فروشگاه
              </Link>
            </div>
          ) : (
            items.map((item) => <CartItemRow key={item.id} item={item} />)
          )}
        </div>

        {/* ─── فوتر با خلاصه و دکمه‌ها ─────────────────────────── */}
        {items.length > 0 && (
          <div className="border-t border-surface-100 p-5 space-y-3 bg-surface-50">

            {/* خلاصه مبالغ */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-surface-500">جمع کالاها ({toFaDigits(count)} عدد)</span>
                <span className="font-semibold text-surface-900">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-surface-500">هزینه ارسال</span>
                <span className={`font-semibold ${shipping === 0 ? 'text-green-600' : 'text-surface-900'}`}>
                  {shipping === 0 ? 'رایگان ✓' : formatPrice(shipping)}
                </span>
              </div>
              {shipping > 0 && (
                <p className="text-xs text-surface-400">
                  برای ارسال رایگان {formatPrice(freeThreshold - subtotal)} دیگر خرید کنید
                </p>
              )}
              <div className="flex justify-between items-center pt-2.5 border-t border-surface-200">
                <span className="font-bold text-surface-900">مبلغ قابل پرداخت</span>
                <span className="text-xl font-black" style={{ color: '#F97316' }}>
                  {formatPrice(total)}
                </span>
              </div>
            </div>

            {/* دکمه پرداخت */}
            <Link
              href="/checkout"
              onClick={closeCart}
              className="btn btn-accent w-full py-3.5 text-base flex items-center justify-center gap-2"
            >
              <span>ادامه و پرداخت</span>
              <ArrowLeftIcon size={16} />
            </Link>

            {/* لینک مشاهده سبد */}
            <Link
              href="/cart"
              onClick={closeCart}
              className="w-full text-center text-sm text-surface-500 hover:text-brand-600 py-1.5 transition-colors block font-medium"
            >
              مشاهده و ویرایش سبد خرید
            </Link>

          </div>
        )}

      </div>
    </>
  )
}
