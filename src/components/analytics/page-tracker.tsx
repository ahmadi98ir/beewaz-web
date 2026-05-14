'use client'

/**
 * PageTracker — ثبت بازدید صفحه در /api/analytics/track
 * این کامپوننت در root layout قرار می‌گیرد و هر تغییر مسیر را ردیابی می‌کند
 */

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

function getOrCreateSession(): string {
  try {
    const key = 'bwz_sid'
    let sid = sessionStorage.getItem(key)
    if (!sid) {
      sid = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
      sessionStorage.setItem(key, sid)
    }
    return sid
  } catch {
    return 'unknown'
  }
}

export function PageTracker() {
  const pathname = usePathname()
  const lastPath = useRef<string | null>(null)

  useEffect(() => {
    // از ردیابی مسیرهای ادمین صرف‌نظر می‌کنیم
    if (pathname.startsWith('/admin') || pathname.startsWith('/api')) return
    // جلوگیری از ثبت دوباره همان مسیر (strict mode)
    if (lastPath.current === pathname) return
    lastPath.current = pathname

    const sessionId = getOrCreateSession()

    fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path: pathname,
        referrer: typeof document !== 'undefined' ? document.referrer || undefined : undefined,
        sessionId,
      }),
      // fire-and-forget — خطا نادیده گرفته می‌شود
    }).catch(() => {})
  }, [pathname])

  return null
}
