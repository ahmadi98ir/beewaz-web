'use client'

import { useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { BeewazLogo } from '@/components/ui/logo'
import { MenuIcon, XIcon } from '@/components/ui/icons'

type NavItem = {
  href: string
  label: string
  icon: ReactNode
  /** Permission key required. undefined = visible to all admin roles */
  permission?: string
}

type NavSection = {
  title: string
  items: NavItem[]
}

function NavIcon({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 20 20" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  )
}

const navSections: NavSection[] = [
  {
    title: 'داشبورد',
    items: [
      { href: '/admin',           label: 'داشبورد',     permission: 'dashboard:view', icon: <NavIcon d="M3 10L10 3l7 7M5 8v8h4v-5h2v5h4V8" /> },
      { href: '/admin/analytics', label: 'آمار بازدید', permission: 'analytics:view', icon: <NavIcon d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /> },
    ],
  },
  {
    title: 'فروش و سفارشات',
    items: [
      { href: '/admin/orders',   label: 'سفارشات',     permission: 'orders:read',    icon: <NavIcon d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /> },
      { href: '/admin/products', label: 'محصولات',     permission: 'products:read',  icon: <NavIcon d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2zM16 3H8M12 12v4M10 14h4" /> },
      { href: '/admin/reviews',  label: 'نظرات',       permission: 'reviews:manage', icon: <NavIcon d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /> },
      { href: '/admin/coupons',  label: 'کوپن‌ها',     permission: 'coupons:read',   icon: <NavIcon d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" /> },
      { href: '/admin/reports',  label: 'گزارش فروش', permission: 'reports:view',   icon: <NavIcon d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /> },
    ],
  },
  {
    title: 'CRM',
    items: [
      { href: '/admin/leads',   label: 'لیدها',    permission: 'leads:read',  icon: <NavIcon d="M17 21v-2a4 4 0 00-4-4H7a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" /> },
      { href: '/admin/users',   label: 'مشتریان',  permission: 'users:read',  icon: <NavIcon d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197" /> },
    ],
  },
  {
    title: 'انبار و نصب',
    items: [
      { href: '/admin/inventory',     label: 'موجودی انبار', permission: 'inventory:manage',   icon: <NavIcon d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /> },
      { href: '/admin/installations', label: 'سفارش‌های نصب', permission: 'installation:read', icon: <NavIcon d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" /> },
    ],
  },
  {
    title: 'CMS',
    items: [
      { href: '/admin/pages',    label: 'صفحات',         permission: 'content:write', icon: <NavIcon d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /> },
      { href: '/admin/articles', label: 'مقالات / بلاگ', permission: 'articles:write', icon: <NavIcon d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /> },
      { href: '/admin/banners',  label: 'بنرها',         permission: 'content:write', icon: <NavIcon d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /> },
      { href: '/admin/content',  label: 'محتوای صفحات',  permission: 'content:write', icon: <NavIcon d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /> },
      { href: '/admin/seo',      label: 'دستیار سئو ✨',  permission: 'content:write', icon: <NavIcon d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /> },
    ],
  },
  {
    title: 'مالی',
    items: [
      { href: '/admin/payment-gateways', label: 'درگاه‌های پرداخت', permission: 'settings:write', icon: <NavIcon d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /> },
    ],
  },
]

const bottomItems: NavItem[] = [
  { href: '/',               label: 'مشاهده سایت', icon: <NavIcon d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /> },
  { href: '/admin/roles',    label: 'نقش‌ها',       permission: 'roles:manage', icon: <NavIcon d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /> },
  { href: '/admin/settings', label: 'تنظیمات',      permission: 'settings:read', icon: <NavIcon d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z" /> },
]

// ── Permission-aware sidebar ──────────────────────────────────────────────────

function useRolePermissions() {
  const sessionResult = useSession()
  const session = sessionResult?.data
  const role = (session?.user as { role?: string } | undefined)?.role
  const [perms, setPerms] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!role) return
    if (role === 'admin') {
      // admin always has everything
      setPerms(new Set(['*']))
      return
    }
    fetch('/api/admin/my-permissions')
      .then((r) => r.json())
      .then((d: { permissions: string[] }) => setPerms(new Set(d.permissions)))
      .catch(() => setPerms(new Set()))
  }, [role])

  return { role, perms }
}

function canSee(perms: Set<string>, permission?: string): boolean {
  if (!permission) return true
  if (perms.has('*')) return true
  return perms.has(permission)
}

function UserCard() {
  const sessionResult = useSession()
  const session = sessionResult?.data
  const role = (session?.user as { role?: string } | undefined)?.role
  const name = session?.user?.name ?? 'کاربر'
  const initial = name.charAt(0)

  const [roleLabel, setRoleLabel] = useState('کاربر')
  useEffect(() => {
    if (!role) return
    fetch('/api/admin/roles')
      .then((r) => r.json())
      .then((d: { roles: { name: string; labelFa: string }[] }) => {
        const found = d.roles?.find((r) => r.name === role)
        if (found) setRoleLabel(found.labelFa)
      })
      .catch(() => {})
  }, [role])

  return (
    <div className="flex items-center gap-3 px-3 py-3 mt-2 rounded-xl bg-white/5">
      <div className="w-8 h-8 rounded-xl bg-brand-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
        {initial}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-white/80 truncate">{name}</p>
        <p className="text-[10px] text-white/40 truncate">{roleLabel}</p>
      </div>
    </div>
  )
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  const { perms } = useRolePermissions()

  const isActive = (href: string) =>
    href === '/admin' ? pathname === '/admin' : pathname.startsWith(href)

  return (
    <>
      <nav className="flex-1 p-3 space-y-4 overflow-y-auto" aria-label="ناوبری ادمین">
        {navSections.map((section) => {
          const visibleItems = section.items.filter((item) => canSee(perms, item.permission))
          if (visibleItems.length === 0) return null
          return (
            <div key={section.title}>
              <p className="px-3 mb-1 text-[10px] font-bold text-white/25 uppercase tracking-widest">
                {section.title}
              </p>
              <div className="space-y-0.5">
                {visibleItems.map((item) => (
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
              </div>
            </div>
          )
        })}
      </nav>

      <div className="p-3 border-t border-white/10 space-y-0.5">
        {bottomItems.filter((item) => canSee(perms, item.permission)).map((item) => (
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

      <aside className="hidden lg:flex flex-col w-64 bg-surface-900 min-h-screen flex-shrink-0">
        <div className="p-5 border-b border-white/10">
          <BeewazLogo variant="light" size="sm" />
          <p className="text-xs text-white/40 mt-2 ms-0.5">پنل مدیریت</p>
        </div>
        <NavLinks />
      </aside>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-surface-950/70 lg:hidden animate-fade-in"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

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
