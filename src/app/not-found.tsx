import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'صفحه پیدا نشد',
  robots: { index: false, follow: false },
}

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <p className="text-[120px] font-black leading-none text-gradient-brand select-none">
          ۴۰۴
        </p>
        <h1 className="text-2xl font-black text-surface-900 mb-2 -mt-4">
          صفحه‌ای که دنبالش بودید پیدا نشد
        </h1>
        <p className="text-sm text-surface-500 leading-relaxed mb-8">
          ممکن است آدرس را اشتباه وارد کرده باشید یا این صفحه حذف شده باشد.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className="btn btn-primary px-6 py-2.5">
            بازگشت به خانه
          </Link>
          <Link href="/shop" className="btn btn-outline px-6 py-2.5">
            مشاهده فروشگاه
          </Link>
        </div>
      </div>
    </div>
  )
}
