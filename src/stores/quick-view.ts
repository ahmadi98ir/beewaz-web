import { create } from 'zustand'
import type { MockProduct } from '@/lib/mock-data'

type QuickViewStore = {
  product: MockProduct | null
  show: (product: MockProduct) => void
  hide: () => void
}

export const useQuickView = create<QuickViewStore>((set) => ({
  product: null,
  show: (product) => set({ product }),
  hide: () => set({ product: null }),
}))
