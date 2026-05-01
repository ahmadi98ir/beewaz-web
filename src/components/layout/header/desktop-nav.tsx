'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronDownIcon } from '@/components/ui/icons'
import type { NavItem } from '@/config/navigation'

type Props = { items: NavItem[] }

export function DesktopNav({ items }: Props) {
  const pathname = usePathname()

  return (
    <nav className="hidden lg:flex items-center" aria-label="ناوبری اصلی">
      <ul className="flex items-center gap-0.5" role="list">
        {items.map((item) => {
          const isActive = pathname.startsWith(item.href) && item.href !== '/'

          return (
            <li key={item.href} className="relative group">
              <Link
                href={item.href}
                className={[
                  'inline-flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium',
                  'transition-colors duration-150',
                  isActive
                    ? 'text-brand-600 bg-brand-50'
                    : 'text-surface-700 hover:text-surface-900 hover:bg-surface-100',
                ].join(' ')}
                aria-current={isActive ? 'page' : undefined}
              >
                {item.label}
                {item.children && (
                  <ChevronDownIcon
                    size={14}
                    className="text-surface-400 transition-transform duration-200 group-hover:rotate-180"
                  />
                )}
              </Link>

              {/* Dropdown Mega Menu */}
              {item.children && (
                <div
                  className={[
                    'absolute top-full start-1/2 -translate-x-1/2 pt-2',
                    'opacity-0 invisible translate-y-1',
                    'group-hover:opacity-100 group-hover:visible group-hover:translate-y-0',
                    'transition-all duration-200 ease-out',
                  ].join(' ')}
                  style={{ transform: 'translateX(50%)' }}
                >
                  {/* در RTL، منوی dropdown از راست تراز می‌شود */}
                  <div
                    className="bg-white rounded-2xl border border-surface-200 overflow-hidden min-w-64"
                    style={{ boxShadow: 'var(--shadow-dropdown)' }}
                  >
                    {/* مثلث اتصال‌دهنده */}
                    <div className="absolute -top-1.5 start-1/2 -translate-x-1/2 w-3 h-3 bg-white border-t border-s border-surface-200 rotate-45" />

                    <ul className="py-2" role="list">
                      {item.children.map((child) => (
                        <li key={child.href}>
                          <Link
                            href={child.href}
                            className="flex flex-col gap-0.5 px-4 py-3 hover:bg-surface-50 transition-colors group/item"
                          >
                            <span className="text-sm font-semibold text-surface-900 group-hover/item:text-brand-600 transition-colors">
                              {child.label}
                            </span>
                            {child.description && (
                              <span className="text-xs text-surface-500 leading-relaxed">
                                {child.description}
                              </span>
                            )}
                          </Link>
                        </li>
                      ))}
                    </ul>

                    {/* لینک "مشاهده همه" برای فروشگاه */}
                    {item.href === '/shop' && (
                      <div className="border-t border-surface-100 px-4 py-3">
                        <Link
                          href="/shop"
                          className="text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors"
                        >
                          مشاهده همه محصولات ←
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
