/**
 * Admin Layout — sidebar + main area
 */
import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { AdminSidebar } from '@/components/admin/sidebar'

export const metadata: Metadata = {
  title: {
    template: '%s | پنل مدیریت بیواز',
    default: 'پنل مدیریت | بیواز',
  },
  robots: { index: false, follow: false },
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-surface-50" dir="rtl">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {children}
      </div>
    </div>
  )
}
