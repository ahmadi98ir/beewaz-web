'use client'

import { useState } from 'react'
import { XIcon } from '@/components/ui/icons'

export function AnnouncementBar() {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  return (
    <div className="bg-brand-600 text-white text-sm py-2 px-4">
      <div className="container-main flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1 justify-center">
          <span className="hidden sm:inline font-bold">🎁</span>
          <p className="text-center">
            ارسال رایگان برای سفارش‌های بالای
            <strong className="mx-1">۵۰۰،۰۰۰ تومان</strong>
            <span className="hidden sm:inline">— تحویل اکسپرس به سراسر ایران</span>
          </p>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="flex-shrink-0 p-1 rounded hover:bg-brand-700 transition-colors"
          aria-label="بستن اعلان"
        >
          <XIcon size={14} />
        </button>
      </div>
    </div>
  )
}
