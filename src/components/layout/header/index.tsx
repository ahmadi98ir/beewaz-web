import Link from 'next/link'
import { BeewazLogo } from '@/components/ui/logo'
import { navigation } from '@/config/navigation'
import { DesktopNav } from './desktop-nav'
import { MobileMenu } from './mobile-menu'
import { SearchBar } from './search-bar'
import { CartButton } from './cart-button'
import { AnnouncementBar } from './announcement-bar'
import { UserButton } from './user-button'
import { getSiteSettings, getCmsContent } from '@/lib/cms'
import { auth } from '@/lib/auth'

export async function Header() {
  const [settings, globalContent, session] = await Promise.all([
    getSiteSettings(),
    getCmsContent('global'),
    auth(),
  ])

  const mergedSettings = { ...settings, ...globalContent }

  return (
    <header className="sticky top-0 z-50">
      <AnnouncementBar settings={mergedSettings} />

      <div
        className="bg-white/95 backdrop-blur-md border-b border-surface-200"
        style={{ boxShadow: 'var(--shadow-header)' }}
      >
        <div className="container-main">
          <div className="flex items-center h-18 gap-4 lg:gap-6">
            <BeewazLogo size="md" />
            <DesktopNav items={navigation} />
            <div className="flex-1" />
            <div className="flex items-center gap-1">
              <SearchBar />
              <CartButton />
              <UserButton session={session} />
              <Link
                href={mergedSettings.contact_cta_url ?? '/contact'}
                className="hidden lg:inline-flex btn btn-primary py-2 px-4 text-sm"
              >
                {mergedSettings.contact_cta_text ?? 'مشاوره رایگان'}
              </Link>
              <MobileMenu items={navigation} />
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}