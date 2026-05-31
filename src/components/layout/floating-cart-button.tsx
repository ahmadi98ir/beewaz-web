'use client'

import { useCart, cartCount } from '@/stores/cart'
import { toFaDigits } from '@/lib/utils'
import { usePathname } from 'next/navigation'

export function FloatingCartButton() {
  const count = useCart(cartCount)
  const openCart = useCart((s) => s.openCart)
  const pathname = usePathname()

  // روی صفحات checkout و cart نشون داده نمیشه
  if (pathname === '/checkout' || pathname === '/cart' || count === 0) return null

  return (
    <button
      type="button"
      onClick={openCart}
      aria-label={`سبد خرید — ${count} محصول`}
      className="fixed bottom-24 end-5 z-40 flex items-center gap-2 bg-accent-500 hover:bg-accent-600 text-white rounded-2xl shadow-xl shadow-accent-500/30 px-4 py-3 transition-all duration-200 hover:scale-105 active:scale-95"
    >
      {/* آیکون سبد */}
      <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 01-8 0" />
      </svg>

      {/* تعداد */}
      <span className="text-sm font-black leading-none">
        {toFaDigits(count)}
      </span>
      <span className="text-xs font-semibold opacity-90">محصول</span>
    </button>
  )
}
