import { create } from 'zustand'
import type { ShopProduct } from '@/lib/shop-product'

type QuickViewStore = {
  product: ShopProduct | null
  show: (product: ShopProduct) => void
  hide: () => void
}

export const useQuickView = create<QuickViewStore>((set) => ({
  product: null,
  show: (product) => set({ product }),
  hide: () => set({ product: null }),
}))
