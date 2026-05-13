'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[App Error]', error)
  }, [error])

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-50 border border-red-200 mb-6">
          <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 className="text-2xl font-black text-surface-900 mb-2">مشکلی پیش آمد</h1>
        <p className="text-sm text-surface-500 leading-relaxed mb-6">
          خطایی در نمایش این صفحه رخ داد. اگر مشکل ادامه داشت با پشتیبانی تماس بگیرید.
        </p>
        {error.digest && (
          <p className="text-xs text-surface-400 font-mono mb-6 bg-surface-50 px-3 py-1.5 rounded-lg inline-block">
            کد خطا: {error.digest}
          </p>
        )}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={reset} className="btn btn-primary px-6 py-2.5">
            تلاش مجدد
          </button>
          <Link href="/" className="btn btn-outline px-6 py-2.5">
            بازگشت به خانه
          </Link>
        </div>
      </div>
    </div>
  )
}
