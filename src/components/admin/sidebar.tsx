'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { BeewazLogo } from '@/components/ui/logo'
import { MenuIcon, XIcon } from '@/components/ui/icons'

type NavItem = {
  href: string
  label: string
  icon: React.ReactNode
}

function NavIcon({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 20 20" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  )
}

const navItems: NavItem[] = [
  { href: '/admin',          label: 'داشبورد',   icon: <NavIcon d="M3 10L10 3l7 7M5 8v8h4v-5h2v5h4V8" /> },
  { href: '/admin/leads',    label: 'لیدها',      icon: <NavIcon d="M17 21v-2a4 4 0 00-4-4H7a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" /> },
  { href: '/admin/orders',   label: 'سفارشات',   icon: <NavIcon d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /> },
  { href: '/admin/products', label: 'محصولات',   icon: <NavIcon d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2zM16 3H8M12 12v4M10 14h4" /> },
  { href: '/admin/articles', label: 'مقالات',    icon: <NavIcon d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zM14 2v6h6M16 13H8M16 17H8M10 9H8" /> },
  { href: '/admin/users',    label: 'کاربران',   icon: <NavIcon d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" /> },
]

const bottomItems: NavItem[] = [
  { href: '/',               label: 'مشاهده سایت', icon: <NavIcon d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /> },
  { href: '/admin/settings', label: 'تنظیمات',     icon: <NavIcon d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z" /> },
]

function UserCard() {
  const { data: session } = useSession()
  const name = session?.user?.name ?? 'مدیر'
  const email = session?.user?.email ?? ''
  const initial = name[0] ?? 'م'

  return (
    <div className="flex items-center gap-3 px-3 py-3 mt-2 rounded-xl bg-white/5">
      <div className="w-8 h-8 rounded-xl bg-brand-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
        {initial}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-white/80 truncate">{name}</p>
        <p className="text-[10px] text-white/40 truncate">{email}</p>
      </div>
    </div>
  )
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  const isActive = (href: string) =>
    href === '/admin' ? pathname === '/admin' : pathname.startsWith(href)

  return (
    <>
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto" aria-label="ناوبری ادمین">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={[
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
              isActive(item.href)
                ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/30'
                : 'text-white/60 hover:text-white hover:bg-white/8',
            ].join(' ')}
            aria-current={isActive(item.href) ? 'page' : undefined}
          >
            <span className="flex-shrink-0">{item.icon}</span>
            <span className="flex-1">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="p-3 border-t border-white/10 space-y-0.5">
        {bottomItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/40 hover:text-white/70 hover:bg-white/8 transition-all duration-150"
          >
            <span className="flex-shrink-0">{item.icon}</span>
            {item.label}
          </Link>
        ))}
        <UserCard />
      </div>
    </>
  )
}

export function AdminSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => { setMobileOpen(false) }, [pathname])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  return (
    <>
      {/* ── Mobile top bar ──────────────────────────────────────────────── */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-40 bg-surface-900 border-b border-white/10 flex items-center h-14 px-4 gap-3">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="باز کردن منو"
        >
          <MenuIcon size={20} />
        </button>
        <BeewazLogo variant="light" size="sm" />
        <span className="ms-auto text-xs text-white/30">پنل مدیریت</span>
      </div>

      {/* ── Desktop static sidebar ──────────────────────────────────────── */}
      <aside className="hidden lg:flex flex-col w-64 bg-surface-900 min-h-screen flex-shrink-0">
        <div className="p-5 border-b border-white/10">
          <BeewazLogo variant="light" size="sm" />
          <p className="text-xs text-white/40 mt-2 ms-0.5">پنل مدیریت</p>
        </div>
        <NavLinks />
      </aside>

      {/* ── Mobile backdrop ─────────────────────────────────────────────── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-surface-950/70 lg:hidden animate-fade-in"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Mobile drawer ───────────────────────────────────────────────── */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="منوی مدیریت"
        className={[
          'fixed inset-y-0 right-0 z-50 w-72 max-w-[85vw] bg-surface-900 flex flex-col lg:hidden',
          'transition-transform duration-300 ease-out shadow-2xl',
          mobileOpen ? 'translate-x-0' : 'translate-x-full',
        ].join(' ')}
      >
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <BeewazLogo variant="light" size="sm" />
          <button
            onClick={() => setMobileOpen(false)}
            className="p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="بستن منو"
          >
            <XIcon size={18} />
          </button>
        </div>
        <NavLinks onNavigate={() => setMobileOpen(false)} />
      </aside>
    </>
  )
}
