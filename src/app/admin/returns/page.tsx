import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = { title: 'مرجوعی‌ها' }

export default function ReturnsPage() {
  return (
    <div className="min-h-full bg-[#070711]">
      <div className="sticky top-0 z-10 bg-[#070711]/90 backdrop-blur-md border-b border-white/[0.06]">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link href="/admin/dashboard"
            className="w-8 h-8 rounded-lg bg-white/[0.06] hover:bg-white/[0.10] flex items-center justify-center text-white/50 hover:text-white transition-all">
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
            </svg>
          </Link>
          <div>
            <h1 className="text-white font-bold text-lg">مرجوعی‌ها</h1>
            <p className="text-white/30 text-xs">مدیریت درخواست‌های بازگشت کالا</p>
          </div>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-6 py-16 flex flex-col items-center text-center gap-4">
        <div className="w-20 h-20 rounded-3xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-10 h-10 text-white/20">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
          </svg>
        </div>
        <h2 className="text-white/60 font-semibold text-lg">این بخش در حال توسعه است</h2>
        <p className="text-white/25 text-sm max-w-sm">
          سیستم مدیریت مرجوعی‌ها در فاز بعدی توسعه پیاده‌سازی می‌شود.
          در این مرحله می‌توانید از بخش سفارشات وضعیت را به «مسترد شده» تغییر دهید.
        </p>
        <Link href="/admin/orders"
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-all">
          رفتن به سفارشات
        </Link>
      </div>
    </div>
  )
}
