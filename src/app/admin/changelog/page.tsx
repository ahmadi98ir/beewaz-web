import type { Metadata } from 'next'
import { CHANGELOG, type ChangelogEntryType } from '@/lib/changelog'
import { FULL_VERSION } from '@/lib/version'

export const metadata: Metadata = { title: 'تازه‌های نسخه' }

const TYPE_BADGE: Record<ChangelogEntryType, { label: string; cls: string }> = {
  feature:     { label: 'قابلیت جدید', cls: 'bg-indigo-500/15 text-indigo-300' },
  improvement: { label: 'بهبود',        cls: 'bg-sky-500/15 text-sky-300' },
  fix:         { label: 'رفع باگ',      cls: 'bg-emerald-500/15 text-emerald-300' },
}

export default function ChangelogPage() {
  return (
    <div className="p-5 sm:p-8 max-w-3xl mx-auto" dir="rtl">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white/90">تازه‌های نسخه</h1>
        <p className="text-sm text-white/40 mt-1">
          نسخه فعلی منتشرشده: <span className="font-mono text-white/60">{FULL_VERSION}</span>
        </p>
      </div>

      <div className="space-y-6">
        {CHANGELOG.map((release) => (
          <div key={release.version} className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="font-mono text-sm font-bold text-white/80">نسخه {release.version}</span>
              <span className="text-xs text-white/30">{release.date}</span>
            </div>
            <ul className="space-y-2">
              {release.entries.map((entry, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-white/65">
                  <span className={`shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${TYPE_BADGE[entry.type].cls}`}>
                    {TYPE_BADGE[entry.type].label}
                  </span>
                  <span className="leading-6">{entry.text}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}
