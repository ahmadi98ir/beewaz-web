'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { BeewazLogo } from '@/components/ui/logo'
import { MenuIcon, XIcon } from '@/components/ui/icons'

// ─── Types ────────────────────────────────────────────────────────────────────

type NavItem = {
  href:        string
  label:       string
  icon:        string
  permission?: string
  badge?:      string
}

type NavSection = {
  title: string
  emoji: string
  items: NavItem[]
}

// ─── Navigation data ──────────────────────────────────────────────────────────

const navSections: NavSection[] = [
  {
    title: 'پیشخوان', emoji: '📊',
    items: [
      { href: '/admin',           label: 'داشبورد',        permission: 'dashboard:view', icon: 'M3 10L10 3l7 7M5 8v8h4v-5h2v5h4V8' },
      { href: '/admin/analytics', label: 'آمار و تحلیل‌ها', permission: 'analytics:view', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
    ],
  },
  {
    title: 'کاتالوگ و انبار', emoji: '📦',
    items: [
      { href: '/admin/products',     label: 'لیست محصولات',      permission: 'products:read',    icon: 'M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2zM16 3H8' },
      { href: '/admin/products/new', label: 'افزودن محصول جدید', permission: 'products:write',   icon: 'M12 4v16m8-8H4' },
      { href: '/admin/categories',   label: 'دسته‌بندی‌ها',        permission: 'products:write',   icon: 'M3 7a1 1 0 011-1h3a1 1 0 01.707.293L9.414 8H17a1 1 0 011 1v7a1 1 0 01-1 1H4a1 1 0 01-1-1V7z' },
      { href: '/admin/attributes',   label: 'ویژگی‌ها و متغیرها', permission: 'products:write',   icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z' },
      { href: '/admin/inventory',    label: 'انبار و هشدارها',    permission: 'inventory:manage', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
    ],
  },
  {
    title: 'فروش و مالی', emoji: '🛒',
    items: [
      { href: '/admin/orders',            label: 'سفارشات',         permission: 'orders:read',   icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
      { href: '/admin/returns',           label: 'مرجوعی‌ها (RMA)', permission: 'orders:read',   icon: 'M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6' },
      { href: '/admin/serials',           label: 'سریال و گارانتی',  permission: 'orders:read',   icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
      { href: '/admin/invoices',          label: 'فاکتورهای رسمی',  permission: 'orders:read',   icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
      { href: '/admin/payment-gateways', label: 'درگاه‌های پرداخت', permission: 'settings:read', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
      { href: '/admin/reports',           label: 'گزارش فروش',      permission: 'reports:view',  icon: 'M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
    ],
  },
  {
    title: 'مشتریان و ارتباطات', emoji: '👥',
    items: [
      { href: '/admin/users',    label: 'لیست مشتریان',  permission: 'users:read',     icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197' },
      { href: '/admin/leads',    label: 'لیدها (CRM)',    permission: 'leads:read',     icon: 'M17 21v-2a4 4 0 00-4-4H7a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z' },
      { href: '/admin/sms-logs', label: 'لاگ پیامک‌ها',   permission: 'settings:read',  icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z' },
      { href: '/admin/reviews',  label: 'نظرات مشتریان', permission: 'reviews:manage', icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z' },
    ],
  },
  {
    title: 'مارکتینگ', emoji: '🎯',
    items: [
      { href: '/admin/coupons', label: 'کوپن‌ها و تخفیف‌ها', permission: 'coupons:read',  icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z' },
      { href: '/admin/banners', label: 'بنرها و کمپین‌ها',   permission: 'content:write', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
    ],
  },
  {
    title: 'محتوا (CMS)', emoji: '✏️',
    items: [
      { href: '/admin/pages',    label: 'صفحات سایت',    permission: 'content:write',  icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
      { href: '/admin/articles', label: 'مقالات / بلاگ',  permission: 'articles:write', icon: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z' },
      { href: '/admin/seo',      label: 'دستیار سئو ✨',   permission: 'content:write',  icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
      { href: '/admin/content',  label: 'محتوای ثابت',    permission: 'content:write',  icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z' },
    ],
  },
  {
    title: 'مدیریت سیستم', emoji: '⚙️',
    items: [
      { href: '/admin/installations', label: 'سفارش‌های نصب',     permission: 'installation:read', icon: 'M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z' },
      { href: '/admin/roles',         label: 'سطوح دسترسی (RBAC)', permission: 'roles:manage',      icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' },
      { href: '/admin/settings',      label: 'تنظیمات فروشگاه',    permission: 'settings:read',     icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z' },
      { href: '/admin/setup',         label: 'ابزارهای راه‌اندازی', icon: 'M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18' },
    ],
  },
]

// ─── Permission helpers ───────────────────────────────────────────────────────

function useRolePermissions() {
  const session = useSession()?.data
  const role = (session?.user as { role?: string } | undefined)?.role
  const [perms, setPerms] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!role) return
    if (role === 'admin') { setPerms(new Set(['*'])); return }
    fetch('/api/admin/my-permissions')
      .then((r) => r.json())
      .then((d: { permissions: string[] }) => setPerms(new Set(d.permissions)))
      .catch(() => setPerms(new Set()))
  }, [role])

  return perms
}

function canSee(perms: Set<string>, permission?: string): boolean {
  if (!permission) return true
  if (perms.has('*')) return true
  return perms.has(permission)
}

// ─── SVG icon ─────────────────────────────────────────────────────────────────

function Icon({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 20 20" className="w-4 h-4 flex-shrink-0" fill="none"
      stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  )
}

// ─── User card ────────────────────────────────────────────────────────────────

function UserCard() {
  const session = useSession()?.data
  const role = (session?.user as { role?: string } | undefined)?.role
  const name = session?.user?.name ?? 'کاربر'
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
    <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.06]">
      <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
        {name.charAt(0)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-white/80 truncate">{name}</p>
        <p className="text-[10px] text-white/35 truncate">{roleLabel}</p>
      </div>
      <Link href="/" className="text-white/25 hover:text-white/60 transition-colors" title="مشاهده سایت">
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.75} className="w-3.5 h-3.5">
          <path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </Link>
    </div>
  )
}

// ─── Nav links ────────────────────────────────────────────────────────────────

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  const perms = useRolePermissions()

  const isActive = (href: string) =>
    href === '/admin' ? pathname === '/admin' : pathname === href || pathname.startsWith(href + '/')

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-5" aria-label="ناوبری ادمین">
        {navSections.map((section) => {
          const visible = section.items.filter((i) => canSee(perms, i.permission))
          if (!visible.length) return null
          return (
            <div key={section.title}>
              <div className="flex items-center gap-1.5 px-2 mb-1.5">
                <span className="text-[11px]">{section.emoji}</span>
                <span className="text-[10px] font-bold text-white/25 uppercase tracking-widest">
                  {section.title}
                </span>
              </div>
              <div className="space-y-0.5">
                {visible.map((item) => {
                  const active = isActive(item.href)
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onNavigate}
                      aria-current={active ? 'page' : undefined}
                      className={[
                        'flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-[13px] font-medium transition-all duration-150 group',
                        active
                          ? 'bg-indigo-600/90 text-white shadow-md shadow-indigo-900/40'
                          : 'text-white/50 hover:text-white/90 hover:bg-white/[0.06]',
                      ].join(' ')}
                    >
                      <span className={active ? 'text-white/90' : 'text-white/35 group-hover:text-white/70'}>
                        <Icon d={item.icon} />
                      </span>
                      <span className="flex-1 truncate">{item.label}</span>
                      {item.badge && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-400">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  )
                })}
              </div>
            </div>
          )
        })}
      </nav>

      <div className="px-3 pb-3 pt-2 border-t border-white/[0.06] flex-shrink-0">
        <UserCard />
      </div>
    </div>
  )
}

// ─── Main export ──────────────────────────────────────────────────────────────

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
      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-40 bg-[#0d0d1f] border-b border-white/[0.07] flex items-center h-14 px-4 gap-3">
        <button onClick={() => setMobileOpen(true)}
          className="p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/[0.08] transition-colors"
          aria-label="باز کردن منو">
          <MenuIcon size={20} />
        </button>
        <BeewazLogo variant="light" size="sm" />
        <span className="ms-auto text-xs text-white/25">پنل مدیریت</span>
      </div>

      {/* Desktop sidebar — h-full درون h-screen layout */}
      <aside className="hidden lg:flex flex-col w-64 flex-shrink-0 h-full bg-[#0d0d1f] border-l border-white/[0.07]">
        <div className="px-5 py-5 border-b border-white/[0.06] flex-shrink-0">
          <BeewazLogo variant="light" size="sm" />
          <p className="text-[10px] text-white/30 mt-1.5">پنل مدیریت</p>
        </div>
        <NavLinks />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)} aria-hidden="true" />
      )}

      {/* Mobile drawer */}
      <aside role="dialog" aria-modal="true" aria-label="منوی مدیریت"
        className={[
          'fixed inset-y-0 right-0 z-50 w-72 max-w-[85vw] lg:hidden flex flex-col',
          'bg-[#0d0d1f] shadow-2xl transition-transform duration-300 ease-out',
          mobileOpen ? 'translate-x-0' : 'translate-x-full',
        ].join(' ')}>
        <div className="flex items-center justify-between px-4 py-4 border-b border-white/[0.07] flex-shrink-0">
          <BeewazLogo variant="light" size="sm" />
          <button onClick={() => setMobileOpen(false)}
            className="p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/[0.08] transition-colors"
            aria-label="بستن منو">
            <XIcon size={18} />
          </button>
        </div>
        <NavLinks onNavigate={() => setMobileOpen(false)} />
      </aside>
    </>
  )
}
