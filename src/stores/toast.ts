import { create } from 'zustand'

export type Toast = {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
  action?: { label: string; onClick: () => void }
}

type ToastStore = {
  toasts: Toast[]
  success: (message: string, action?: Toast['action']) => void
  error: (message: string, action?: Toast['action']) => void
  info: (message: string, action?: Toast['action']) => void
  dismiss: (id: string) => void
}

export const useToast = create<ToastStore>((set) => {
  const push = (type: Toast['type']) => (message: string, action?: Toast['action']) => {
    const id = Math.random().toString(36).slice(2, 9)
    set((s) => ({ toasts: [...s.toasts, { id, type, message, action }] }))
    setTimeout(
      () => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
      4500,
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
