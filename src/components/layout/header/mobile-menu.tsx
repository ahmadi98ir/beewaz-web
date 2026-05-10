'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { MenuIcon, XIcon, ChevronDownIcon, PhoneIcon, ShoppingCartIcon } from '@/components/ui/icons'
import { BeewazLogo } from '@/components/ui/logo'
import { useCart } from '@/stores/cart'
import type { NavItem } from '@/config/navigation'

type Props = { items: NavItem[] }

export function MobileMenu({ items }: Props) {
  const [open, setOpen] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)
  const pathname = usePathname()
  const cartCount = useCart((s) => s.count)

  // بستن منو هنگام تغییر مسیر
  useEffect(() => { setOpen(false) }, [pathname])

  // قفل اسکرول body
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const toggleExpanded = (href: string) => {
    setExpanded((prev) => (prev === href ? null : href))
  }

  return (
    <>
      {/* دکمه همبرگر */}
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden btn btn-ghost p-2.5 relative"
        aria-label="باز کردن منو"
        aria-expanded={open}
        aria-controls="mobile-menu"
      >
        <MenuIcon size={22} />
        {cartCount > 0 && (
          <span className="absolute -top-0.5 -start-0.5 min-w-[16px] h-4 px-0.5 rounded-full bg-brand-600 text-white text-[9px] font-bold flex items-center justify-center">
            {cartCount}
          </span>
        )}
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-surface-950/60 lg:hidden animate-fade-in"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <aside
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label="منوی ناوبری"
        className={[
          'fixed inset-y-0 right-0 z-50 w-80 max-w-[90vw] bg-white flex flex-col',
          'transition-transform duration-300 ease-out lg:hidden',
          'shadow-xl',
          open ? 'translate-x-0' : 'translate-x-full',
        ].join(' ')}
      >
        {/* هدر drawer */}
        <div className="flex items-center justify-between p-4 border-b border-surface-100">
          <BeewazLogo size="sm" />
          <button
            onClick={() => setOpen(false)}
            className="btn btn-ghost p-2"
            aria-label="بستن منو"
          >
            <XIcon size={20} />
          </button>
        </div>

        {/* لیست ناوبری */}
        <nav className="flex-1 overflow-y-auto py-2">
          <ul role="list">
            {items.map((item) => {
              const isActive = pathname.startsWith(item.href) && item.href !== '/'
              const isExpanded = expanded === item.href

              return (
                <li key={item.href}>
                  {item.children ? (
                    <>
                      <button
                        onClick={() => toggleExpanded(item.href)}
                        className={[
                          'w-full flex items-center justify-between px-5 py-3.5 text-sm font-semibold',
                          'transition-colors',
                          isActive ? 'text-brand-600' : 'text-surface-800 hover:text-surface-900 hover:bg-surface-50',
                        ].join(' ')}
                        aria-expanded={isExpanded}
                      >
                        <span>{item.label}</span>
                        <ChevronDownIcon
                          size={16}
                          className={[
                            'text-surface-400 transition-transform duration-200',
                            isExpanded ? 'rotate-180' : '',
                          ].join(' ')}
                        />
                      </button>

                      {/* زیرمنو آکاردیون */}
                      <div
                        className={[
                          'overflow-hidden transition-all duration-200 ease-out bg-surface-50',
                          isExpanded ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0',
                        ].join(' ')}
                      >
                        <ul role="list" className="py-1">
                          {item.children.map((child) => (
                            <li key={child.href}>
                              <Link
                                href={child.href}
                                className="flex flex-col gap-0.5 px-8 py-2.5 hover:bg-surface-100 transition-colors"
                              >
                                <span className="text-sm font-medium text-surface-800">
                                  {child.label}
                                </span>
                                {child.description && (
                                  <span className="text-xs text-surface-500">
                                    {child.description}
                                  </span>
                                )}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </>
                  ) : (
                    <Link
                      href={item.href}
                      className={[
                        'flex items-center px-5 py-3.5 text-sm font-semibold',
                        'transition-colors',
                        isActive
                          ? 'text-brand-600 bg-brand-50'
                          : 'text-surface-800 hover:text-surface-900 hover:bg-surface-50',
                      ].join(' ')}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      {item.label}
                    </Link>
                  )}
                </li>
              )
            })}
          </ul>
        </nav>

        {/* فوتر drawer */}
        <div className="border-t border-surface-100 p-4 space-y-3">
          {cartCount > 0 && (
            <Link
              href="/cart"
              className="btn btn-outline w-full justify-center gap-2 text-sm"
            >
              <ShoppingCartIcon size={16} />
              سبد خرید ({cartCount} محصول)
            </Link>
          )}
          <Link
            href="/contact"
            className="btn btn-primary w-full justify-center text-sm"
          >
            مشاوره رایگان
          </Link>
          <a
            href="tel:+982100000000"
            className="flex items-center justify-center gap-2 text-sm text-surface-600 hover:text-brand-600 transition-colors py-2"
          >
            <PhoneIcon size={15} />
            <span>۰۲۱-۰۰۰۰-۰۰۰۰</span>
          </a>
        </div>
      </aside>
    </>
  )
}
