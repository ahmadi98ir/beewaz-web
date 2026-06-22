'use client'

/**
 * WishlistSync — هم‌گام‌سازی شناسه‌های علاقه‌مندی‌های کاربر لاگین‌شده با store
 * تا دکمه‌های قلب در ProductCard در همه صفحات وضعیت درست را نشان دهند.
 */

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useWishlist } from '@/stores/wishlist'

export function WishlistSync() {
  const { status } = useSession()
  const setIds = useWishlist((s) => s.setIds)

  useEffect(() => {
    if (status !== 'authenticated') return
    fetch('/api/wishlist')
      .then((r) => r.json())
      .then((d: { items?: { id: string }[] }) => setIds((d.items ?? []).map((i) => i.id)))
      .catch(() => {})
  }, [status, setIds])

  return null
}
