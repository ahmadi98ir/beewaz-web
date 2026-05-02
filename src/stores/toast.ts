import { create } from 'zustand'

export type Toast = {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
}

type ToastStore = {
  toasts: Toast[]
  success: (message: string) => void
  error: (message: string) => void
  info: (message: string) => void
  dismiss: (id: string) => void
}

export const useToast = create<ToastStore>((set) => {
  const push = (type: Toast['type']) => (message: string) => {
    const id = Math.random().toString(36).slice(2, 9)
    set((s) => ({ toasts: [...s.toasts, { id, type, message }] }))
    setTimeout(
      () => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
      3500,
    )
  }
  return {
    toasts: [],
    success: push('success'),
    error: push('error'),
    info: push('info'),
    dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
  }
})
