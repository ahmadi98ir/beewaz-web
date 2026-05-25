'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { BeewazLogo } from '@/components/ui/logo'
import { CheckIcon, UserIcon, MailIcon } from '@/components/ui/icons'

export default function ProfileCompletePage() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fullName.trim()) {
      setError('نام و نام‌خانوادگی الزامی است')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: fullName.trim(),
          ...(email.trim() ? { email: email.trim() } : {}),
        }),
      })
      if (res.ok) {
        router.push('/profile')
        router.refresh()
      } else {
        setError('خطا در ذخیره اطلاعات. دوباره امتحان کنید.')
      }
    } catch {
      setError('خطا در ارتباط با سرور')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg, #1B3A8A 0%, #0F2155 60%, #F97316 200%)' }}
    >
      <div className="w-full max-w-md">

        {/* Logo + Welcome */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-5">
            <BeewazLogo />
          </div>
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'rgba(255,255,255,0.15)' }}
          >
            <UserIcon size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-black text-white">خوش آمدید!</h1>
          <p className="text-blue-200 mt-2 text-sm">
            برای تکمیل ثبت‌نام، اطلاعات خود را وارد کنید
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8">

          {/* Progress Steps */}
          <div className="flex items-center gap-2 mb-7">
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                <CheckIcon size={12} className="text-green-600" />
              </div>
              <span className="text-xs text-surface-500">تأیید شماره</span>
            </div>
            <div className="flex-1 h-px bg-surface-200" />
            <div className="flex items-center gap-1.5">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                style={{ background: '#F97316' }}
              >
                ۲
              </div>
              <span className="text-xs font-semibold text-surface-900">تکمیل پروفایل</span>
            </div>
          </div>

          <form onSubmit={onSubmit} className="space-y-5">

            {/* Full Name */}
            <div>
              <label className="block text-sm font-semibold text-surface-700 mb-1.5">
                نام و نام‌خانوادگی
                <span className="text-red-500 ms-1">*</span>
              </label>
              <div className="relative">
                <UserIcon
                  size={16}
                  className="absolute top-1/2 -translate-y-1/2 end-3.5 text-surface-400"
                />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="مثال: علی احمدی"
                  className="input w-full pe-10"
                  required
                  autoFocus
                  maxLength={80}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-surface-700 mb-1.5">
                ایمیل
                <span className="text-xs text-surface-400 font-normal ms-2">(اختیاری)</span>
              </label>
              <div className="relative">
                <MailIcon
                  size={16}
                  className="absolute top-1/2 -translate-y-1/2 end-3.5 text-surface-400"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="input w-full pe-10"
                  dir="ltr"
                />
              </div>
            </div>

            {error && (
              <div
                className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 text-center"
                role="alert"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn btn-accent w-full py-3.5 text-base"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  در حال ذخیره...
                </span>
              ) : 'تکمیل ثبت‌نام و ورود به پروفایل'}
            </button>

            <button
              type="button"
              onClick={() => { router.push('/profile'); router.refresh() }}
              className="w-full text-center text-sm text-surface-400 hover:text-surface-600 py-1 transition-colors"
            >
              بعداً تکمیل می‌کنم
            </button>

          </form>
        </div>

        <p className="text-center text-xs text-blue-200 mt-5">
          اطلاعات شما محفوظ است و فقط برای بهبود تجربه خرید استفاده می‌شود
        </p>
      </div>
    </div>
  )
}
