import Link from 'next/link'
import { BeewazLogo } from '@/components/ui/logo'
import { UserIcon } from '@/components/ui/icons'
import { navigation } from '@/config/navigation'
import { DesktopNav } from './desktop-nav'
import { MobileMenu } from './mobile-menu'
import { SearchBar } from './search-bar'
import { CartButton } from './cart-button'
import { AnnouncementBar } from './announcement-bar'
import { getSiteSettings } from '@/lib/cms'

// Server Component — بدون 'use client'

export async function Header() {
  const settings = await getSiteSettings()

  return (
    <header className="sticky top-0 z-50">
      <AnnouncementBar settings={settings} />

      <div
        className="bg-white/95 backdrop-blur-md border-b border-surface-200"
        style={{ boxShadow: 'var(--shadow-header)' }}
      >
        <div className="container-main">
          <div className="flex items-center h-18 gap-4 lg:gap-6">

            {/* ── لوگو ──────────────────────────────────────────── */}
            <BeewazLogo size="md" />

            {/* ── ناوبری دسکتاپ ────────────────────────────────── */}
            <DesktopNav items={navigation} />

            <div className="flex-1" />

            {/* ── اکشن‌ها ───────────────────────────────────────── */}
            <div className="flex items-center gap-1">
              <SearchBar />
              <CartButton />
              <Link
                href="/login"
                className="hidden sm:inline-flex btn btn-ghost gap-2 py-2 px-3 text-sm"
                aria-label="ورود به حساب کاربری"
              >
                <UserIcon size={18} />
                <span className="hidden md:inline">ورود</span>
              </Link>
              <Link
                href={settings.contact_cta_url ?? '/contact'}
                className="hidden lg:inline-flex btn btn-primary py-2 px-4 text-sm"
              >
                {settings.contact_cta_text ?? 'مشاوره رایگان'}
              </Link>
              <MobileMenu items={navigation} />
            </div>

          </div>
        </div>
      </div>
    </header>
  )
}
