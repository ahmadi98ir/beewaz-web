'use client'

import { useCart } from '@/stores/cart'
import { ShoppingCartIcon } from '@/components/ui/icons'

export function CartButton() {
  const count = useCart((s) => s.count)
  const openCart = useCart((s) => s.openCart)

  return (
    <button
      type="button"
      onClick={openCart}
      className="btn btn-ghost p-2.5 relative"
      aria-label={`سبد خرید${count > 0 ? ` — ${count} محصول` : ''}`}
    >
      <ShoppingCartIcon size={20} />
      {count > 0 && (
        <span className="absolute -top-0.5 -start-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-accent-500 text-white text-[10px] font-bold leading-none animate-slide-down">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </button>
  )
}
