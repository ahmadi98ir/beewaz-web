import type { Metadata } from 'next'
import { AdminSidebar } from '@/components/admin/sidebar'

export const metadata: Metadata = {
  title: { template: '%s | پنل مدیریت بیواز', default: 'داشبورد | بیواز' },
  robots: { index: false, follow: false },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-surface-100" dir="rtl">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden pt-14 lg:pt-0">
        {children}
      </div>
    </div>
  )
}
