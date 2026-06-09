import Link from 'next/link'
import { BentoCard } from './bento-card'

const ACTIONS = [
  {
    href:    '/admin/products/new',
    label:   'محصول جدید',
    icon:    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>,
    bg:      'bg-brand-600/20 hover:bg-brand-600/30',
    border:  'border-brand-500/20 hover:border-brand-500/40',
    text:    'text-brand-300',
    glow:    'hover:shadow-[0_0_20px_rgba(96,128,250,0.2)]',
  },
  {
    href:    '/admin/orders',
    label:   'سفارشات',
    icon:    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>,
    bg:      'bg-emerald-600/20 hover:bg-emerald-600/30',
    border:  'border-emerald-500/20 hover:border-emerald-500/40',
    text:    'text-emerald-300',
    glow:    'hover:shadow-[0_0_20px_rgba(52,211,153,0.2)]',
  },
  {
    href:    '/admin/users',
    label:   'کاربران',
    icon:    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    bg:      'bg-purple-600/20 hover:bg-purple-600/30',
    border:  'border-purple-500/20 hover:border-purple-500/40',
    text:    'text-purple-300',
    glow:    'hover:shadow-[0_0_20px_rgba(167,139,250,0.2)]',
  },
  {
    href:    '/admin/coupons/new',
    label:   'کوپن تخفیف',
    icon:    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>,
    bg:      'bg-accent-600/20 hover:bg-accent-600/30',
    border:  'border-accent-500/20 hover:border-accent-500/40',
    text:    'text-accent-300',
    glow:    'hover:shadow-[0_0_20px_rgba(249,115,22,0.2)]',
  },
  {
    href:    '/admin/leads',
    label:   'لیدها',
    icon:    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>,
    bg:      'bg-cyan-600/20 hover:bg-cyan-600/30',
    border:  'border-cyan-500/20 hover:border-cyan-500/40',
    text:    'text-cyan-300',
    glow:    'hover:shadow-[0_0_20px_rgba(34,211,238,0.2)]',
  },
  {
    href:    '/admin/payment-gateways',
    label:   'درگاه پرداخت',
    icon:    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>,
    bg:      'bg-rose-600/20 hover:bg-rose-600/30',
    border:  'border-rose-500/20 hover:border-rose-500/40',
    text:    'text-rose-300',
    glow:    'hover:shadow-[0_0_20px_rgba(251,113,133,0.2)]',
  },
]

export function QuickActionsTile() {
  return (
    <BentoCard className="p-5 col-span-2">
      <p className="text-white/50 text-xs font-medium tracking-wide uppercase mb-4">دسترسی سریع</p>
      <div className="grid grid-cols-3 gap-2.5">
        {ACTIONS.map((a) => (
          <Link
            key={a.href}
            href={a.href}
            className={`
              flex flex-col items-center gap-2.5 p-3.5 rounded-xl
              border transition-all duration-200 cursor-pointer
              ${a.bg} ${a.border} ${a.glow}
            `}
          >
            <div className={a.text}>{a.icon}</div>
            <span className={`text-xs font-semibold ${a.text}`}>{a.label}</span>
          </Link>
        ))}
      </div>
    </BentoCard>
  )
}
