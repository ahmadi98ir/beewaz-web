import Link from 'next/link'
import { BeewazLogo } from '@/components/ui/logo'
import { UserIcon } from '@/components/ui/icons'
import { navigation } from '@/config/navigation'
import { DesktopNav } from './desktop-nav'
import { MobileMenu } from './mobile-menu'
import { SearchBar } from './search-bar'
import { CartButton } from './cart-button'
import { AnnouncementBar } from './announcement-bar'

// Server Component — بدون 'use client'
// فقط کامپوننت‌های تعاملی به client منتقل شده‌اند

export function Header() {
  return (
    <header className="sticky top-0 z-50">
      <AnnouncementBar />

      <div
        className="bg-white/95 backdrop-blur-md border-b border-surface-200"
        style={{ boxShadow: 'var(--shadow-header)' }}
      >
        <div className="container-main">
          <div className="flex items-center h-18 gap-4 lg:gap-6">

            {/* ── لوگو ──────────────────────────────────────────── */}
            <BeewazLogo size="md" />

            {/* ── ناوبری دسکتاپ — فضای بین را پر می‌کند ────────── */}
            <DesktopNav items={navigation} />

            {/* ── Spacer ─────────────────────────────────────────── */}
            <div className="flex-1" />

            {/* ── اکشن‌ها ───────────────────────────────────────── */}
            <div className="flex items-center gap-1">
              {/* جستجو — Client Component */}
              <SearchBar />

              {/* سبد خرید — Client Component */}
              <CartButton />

              {/* ورود / حساب کاربری */}
              <Link
                href="/login"
                className="hidden sm:inline-flex btn btn-ghost gap-2 py-2 px-3 text-sm"
                aria-label="ورود به حساب کاربری"
              >
                <UserIcon size={18} />
                <span className="hidden md:inline">ورود</span>
              </Link>

              {/* مشاوره رایگان — CTA اصلی */}
              <Link
                href="/contact"
                className="hidden lg:inline-flex btn btn-primary py-2 px-4 text-sm"
              >
                مشاوره رایگان
              </Link>

              {/* منوی موبایل — Client Component */}
              <MobileMenu items={navigation} />
            </div>

          </div>
        </div>
      </div>
    </header>
  )
}
