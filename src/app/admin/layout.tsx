import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { AdminSidebar } from '@/components/admin/sidebar'
import { AdminSessionProvider } from './session-provider'

export const metadata: Metadata = {
  title: {
    template: '%s | پنل مدیریت بیواز',
    default: 'پنل مدیریت | بیواز',
  },
  robots: { index: false, follow: false },
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AdminSessionProvider>
      {/* کانتینر اصلی: h-screen + overflow-hidden روی کل پنل */}
      <div className="flex h-screen overflow-hidden bg-[#070711]" dir="rtl">
        <AdminSidebar />
        {/* محتوای اصلی: اسکرول مستقل + بک‌گراند پر تا انتها */}
        <main className="flex-1 min-w-0 overflow-y-auto bg-[#070711]">
          {children}
        </main>
      </div>
    </AdminSessionProvider>
  )
}
