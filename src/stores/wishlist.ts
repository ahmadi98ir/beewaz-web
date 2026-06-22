import { create } from 'zustand'

type WishlistStore = {
  ids: Set<string>
  loaded: boolean
  setIds: (ids: string[]) => void
  add: (id: string) => void
  remove: (id: string) => void
}

export const useWishlist = create<WishlistStore>((set) => ({
  ids: new Set(),
  loaded: false,
  setIds: (ids) => set({ ids: new Set(ids), loaded: true }),
  add: (id) => set((s) => ({ ids: new Set(s.ids).add(id) })),
  remove: (id) =>
    set((s) => {
      const next = new Set(s.ids)
      next.delete(id)
      return { ids: next }
    }),
}))
