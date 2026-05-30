import Link from 'next/link'
import type { Session } from 'next-auth'
import { UserIcon } from '@/components/ui/icons'

type Props = { session: Session | null }

/**
 * دکمه کاربر در هدر — اگر وارد شده پروفایل، وگرنه لینک ورود
 * این کامپوننت Server Component است و session را از Header می‌گیرد
 */
export function UserButton({ session }: Props) {
  if (session?.user) {
    const name = session.user.name
    const initial = name ? name[0] : '؟'
    return (
      <Link
        href="/profile"
        className="hidden sm:inline-flex items-center gap-2 btn btn-ghost py-1.5 px-2.5 text-sm"
        aria-label="پروفایل کاربری"
      >
        <div
          className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center text-white text-xs font-black"
          style={{ background: 'linear-gradient(135deg, #1B3A8A, #F97316)' }}
        >
          {initial}
        </div>
        <span className="hidden md:inline font-medium text-surface-700 max-w-[100px] truncate">
          {name ?? 'پروفایل'}
        </span>
      </Link>
    )
  }

  return (
    <Link
      href="/login"
      className="hidden sm:inline-flex btn btn-ghost gap-2 py-2 px-3 text-sm"
      aria-label="ورود به حساب کاربری"
    >
      <UserIcon size={18} />
      <span className="hidden md:inline">ورود</span>
    </Link>
  )
}
