'use client'

import { useToast, type Toast } from '@/stores/toast'
import { XIcon, CheckIcon, ShieldIcon } from '@/components/ui/icons'

const config = {
  success: { wrap: 'bg-emerald-50 border-emerald-200', icon: 'text-emerald-600', Icon: CheckIcon },
  error:   { wrap: 'bg-red-50 border-red-200',         icon: 'text-red-600',     Icon: XIcon },
  info:    { wrap: 'bg-blue-50 border-blue-200',        icon: 'text-blue-600',    Icon: ShieldIcon },
} as const

function ToastItem({ toast }: { toast: Toast }) {
  const dismiss = useToast((s) => s.dismiss)
  const { wrap, icon, Icon } = config[toast.type]

  return (
    <div
      role="alert"
      className={`flex items-start gap-3 px-4 py-3 rounded-2xl border shadow-lg animate-slide-up ${wrap} min-w-[260px] max-w-[340px]`}
    >
      <Icon size={18} className={`mt-0.5 flex-shrink-0 ${icon}`} />
      <p className="flex-1 text-sm font-semibold text-surface-800 leading-snug">{toast.message}</p>
      <button
        onClick={() => dismiss(toast.id)}
        className="flex-shrink-0 text-surface-400 hover:text-surface-700 transition-colors mt-0.5"
        aria-label="بستن"
      >
        <XIcon size={14} />
      </button>
    </div>
  )
}

export function ToastContainer() {
  const toasts = useToast((s) => s.toasts)
  if (!toasts.length) return null

  return (
    <div
      role="region"
      aria-live="polite"
      aria-label="اعلان‌ها"
      className="fixed bottom-6 start-6 z-[200] flex flex-col gap-2 pointer-events-none"
    >
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <ToastItem toast={t} />
        </div>
      ))}
    </div>
  )
}
