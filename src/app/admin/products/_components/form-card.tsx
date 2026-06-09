import type { ReactNode } from 'react'

interface FormCardProps {
  title: string
  subtitle?: string
  icon?: ReactNode
  children: ReactNode
  className?: string
}

export function FormCard({ title, subtitle, icon, children, className = '' }: FormCardProps) {
  return (
    <div className={`bg-white/[0.04] border border-white/[0.08] rounded-2xl overflow-hidden ${className}`}>
      <div className="px-6 py-4 border-b border-white/[0.06] flex items-center gap-3">
        {icon && (
          <span className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center text-white/60 flex-shrink-0">
            {icon}
          </span>
        )}
        <div>
          <h2 className="text-white font-bold text-sm">{title}</h2>
          {subtitle && <p className="text-white/40 text-xs mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <div className="p-6">{children}</div>
    </div>
  )
}

interface FieldProps {
  label: string
  error?: string
  required?: boolean
  hint?: string
  children: ReactNode
}

export function Field({ label, error, required, hint, children }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1 text-xs font-semibold text-white/60 uppercase tracking-wide">
        {label}
        {required && <span className="text-red-400">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-white/30">{hint}</p>}
      {error && <p className="text-xs text-red-400 flex items-center gap-1">
        <svg viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3 flex-shrink-0">
          <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm-.75 3.75a.75.75 0 011.5 0v3.5a.75.75 0 01-1.5 0v-3.5zm.75 7a.875.875 0 110-1.75.875.875 0 010 1.75z"/>
        </svg>
        {error}
      </p>}
    </div>
  )
}

export const inputCls = [
  'w-full rounded-xl px-3.5 py-2.5',
  // بک‌گراند با رنگ مطلق (نه opacity) — از سفید شدن هنگام focus جلوگیری می‌کند
  'bg-[#1e1e3a] border border-[rgba(255,255,255,0.10)]',
  'text-white text-sm placeholder:text-white/25',
  'focus:outline-none focus:border-indigo-500/60 focus:bg-[#222240]',
  // autofill مرورگر
  '[&:-webkit-autofill]:[box-shadow:0_0_0_1000px_#1e1e3a_inset]',
  '[&:-webkit-autofill]:[-webkit-text-fill-color:rgb(255_255_255)]',
  '[color-scheme:dark]',
  'transition-colors duration-150',
  'disabled:opacity-40',
].join(' ')

export const errorInputCls = inputCls.replace(
  'border-[rgba(255,255,255,0.10)]',
  'border-red-500/50'
)
