'use client'

/**
 * AdminBanner — نوار خوش‌آمد برای مدیران روی سایت عمومی
 * فقط وقتی کاربر با نقش admin وارد شده نمایش داده می‌شود
 */

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

export function AdminBanner() {
  const { data: session, status } = useSession()
  const [dismissed, setDismissed] = useState(false)

  if (status === 'loading' || dismissed) return null
  if (!session?.user || (session.user as { role?: string }).role !== 'admin') return null

  const name = session.user.name ?? 'مدیر سیستم'
  const now = new Date()
  const hour = now.getHours()
  const greeting =
    hour < 12 ? 'صبح بخیر' : hour < 17 ? 'روز بخیر' : 'شب بخیر'

  return (
    <div
      className="bg-brand-700 text-white text-sm py-2 px-4 flex items-center justify-between gap-4 z-50 relative"
      role="banner"
      aria-label="پنل مدیریت"
    >
      <div className="flex items-center gap-3 min-w-0">
        {/* آیکون شیلد */}
        <span className="flex-shrink-0 w-6 h-6 rounded-lg bg-white/15 flex items-center justify-center text-xs">
          🛡️
        </span>
        <span className="font-semibold truncate">
          {greeting}، <span className="text-brand-200">{name}</span>!
        </span>
        <span className="hidden sm:inline text-white/50">—</span>
        <span className="hidden sm:inline text-white/70 text-xs">کاربر فعال مدیر سیستم</span>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <Link
          href="/admin"
          className="bg-white/15 hover:bg-white/25 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
        >
          <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2 8L8 2l6 6M4 6v7h3v-4h2v4h3V6" />
          </svg>
          داشبورد مدیریت
        </Link>
        <button
          onClick={() => setDismissed(true)}
          className="w-6 h-6 rounded-md text-white/50 hover:text-white hover:bg-white/15 flex items-center justify-center transition-colors"
          aria-label="بستن نوار"
        >
          <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" d="M4 4l8 8M12 4l-8 8" />
          </svg>
        </button>
      </div>
    </div>
  )
}
