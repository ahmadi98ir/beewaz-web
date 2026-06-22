'use client'

/**
 * CartTracker — ردیابی فعالیت سبد خرید کاربر لاگین‌شده در /api/cart/track
 * برای یادآوری پیامکی سبد رهاشده. این کامپوننت در root layout قرار می‌گیرد.
 */

import { useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useCart } from '@/stores/cart'

const DEBOUNCE_MS = 2500

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

export function CartTracker() {
  const { status } = useSession()
  const items = useCart((s) => s.items)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (status !== 'authenticated') return

    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      fetch('/api/cart/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, sessionId: getOrCreateSession() }),
      }).catch(() => {})
    }, DEBOUNCE_MS)

    return () => {
      if (timer.current) clearTimeout(timer.current)
    }
  }, [items, status])

  return null
}
