'use client'

import { useState } from 'react'
import { XIcon } from '@/components/ui/icons'
import type { CmsContent } from '@/lib/cms'

const DEFAULT_MESSAGES = [
  { icon: '🚚', text: 'ارسال رایگان برای سفارش‌های بالای', bold: '۵۰۰،۰۰۰ تومان', suffix: ' — تحویل اکسپرس به سراسر ایران' },
  { icon: '🛡️', text: 'گارانتی رسمی', bold: '۱۸ ماهه', suffix: ' برای تمام محصولات بیواز الکترونیک' },
  { icon: '📞', text: 'مشاوره رایگان با کارشناسان:', bold: '۰۲۱-۰۰۰۰-۰۰۰۰', suffix: ' — همه روزه ۸ تا ۲۲' },
]

interface AnnouncementBarProps {
  settings?: CmsContent
}

export function AnnouncementBar({ settings }: AnnouncementBarProps) {
  const [dismissed, setDismissed] = useState(false)
  const [current, setCurrent] = useState(0)

  if (dismissed) return null

  const cmsActive = settings?.announcement_active === 'true'
  const cmsText   = settings?.announcement_text ?? ''
  const cmsUrl    = settings?.announcement_url ?? ''
  const cmsBg     = settings?.announcement_color ?? '#1B3A8A'

  if (cmsActive && cmsText) {
    const bgStyle = cmsBg.startsWith('#')
      ? { background: cmsBg }
      : { background: 'linear-gradient(90deg, #1B3A8A 0%, #152E70 50%, #1B3A8A 100%)' }

    return (
      <div className="text-white text-sm py-2 px-4" style={bgStyle}>
        <div className="container-main flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-1 justify-center min-w-0">
            {cmsUrl ? (
              <a href={cmsUrl} className="text-center truncate text-white hover:underline">{cmsText}</a>
            ) : (
              <p className="text-center truncate">{cmsText}</p>
            )}
          </div>
          <button onClick={() => setDismissed(true)}
            className="p-1 rounded hover:bg-white/10 transition-colors flex-shrink-0" aria-label="بستن اعلان">
            <XIcon size={13} />
          </button>
        </div>
      </div>
    )
  }

  const msg = DEFAULT_MESSAGES[current]!

  return (
    <div className="text-white text-sm py-2 px-4"
      style={{ background: 'linear-gradient(90deg, #1B3A8A 0%, #152E70 50%, #1B3A8A 100%)' }}>
      <div className="container-main flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1 justify-center min-w-0">
          <span className="hidden sm:inline flex-shrink-0">{msg.icon}</span>
          <p className="text-center truncate">
            {msg.text}
            {msg.bold && <strong className="mx-1 text-accent-300">{msg.bold}</strong>}
            <span className="hidden sm:inline opacity-80">{msg.suffix}</span>
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {DEFAULT_MESSAGES.length > 1 && (
            <div className="hidden sm:flex items-center gap-1">
              {DEFAULT_MESSAGES.map((_, i) => (
                <button key={i} onClick={() => setCurrent(i)}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${i === current ? 'bg-accent-400 w-3' : 'bg-white/30 hover:bg-white/50'}`}
                  aria-label={`پیام ${i + 1}`} />
              ))}
            </div>
          )}
          <button onClick={() => setDismissed(true)}
            className="p-1 rounded hover:bg-white/10 transition-colors" aria-label="بستن اعلان">
            <XIcon size={13} />
          </button>
        </div>
      </div>
    </div>
  )
}
