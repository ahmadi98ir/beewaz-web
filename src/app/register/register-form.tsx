'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { BeewazLogo } from '@/components/ui/logo'
import { ShieldIcon } from '@/components/ui/icons'

function normalizePhone(raw: string) {
  return raw
    .replace(/[۰-۹]/g, (d) => String.fromCharCode(d.charCodeAt(0) - 0x06f0 + 0x30))
    .replace(/[٠-٩]/g, (d) => String.fromCharCode(d.charCodeAt(0) - 0x0660 + 0x30))
    .replace(/\s|-/g, '')
    .replace(/^\+98/, '0')
    .replace(/^98/, '0')
}

export default function RegisterForm() {
  const router = useRouter()

  const [phone, setPhone] = useState('')
  const [fullName, setFullName] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const normalizedPhone = normalizePhone(phone)
    if (!/^09\d{9}$/.test(normalizedPhone)) {
      setError('شماره موبایل معتبر نیست. مثال: ۰۹۱۲۳۴۵۶۷۸۹')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: normalizedPhone, password, fullName }),
      })
      const data = await res.json() as { ok?: boolean; error?: string }

      if (!res.ok) {
        setError(data.error ?? 'خطا در ثبت‌نام')
        setLoading(false)
        return
      }

      const signInRes = await signIn('credentials', {
        phone: normalizedPhone,
        password,
        redirect: false,
      })

      if (signInRes?.error) {
        router.push('/login')
        return
      }

      router.push('/profile')
      router.refresh()
    } catch {
      setError('خطای شبکه. لطفاً دوباره تلاش کنید')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-50 to-surface-100 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <BeewazLogo />
          </div>
          <h1 className="text-xl font-black text-surface-900">ایجاد حساب کاربری</h1>
          <p className="text-sm text-surface-400 mt-1">برای خرید و پیگیری سفارش ثبت‌نام کنید</p>
        </div>

        <div className="bg-white rounded-3xl border border-surface-200 shadow-card p-7">
          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-surface-700 mb-1.5">
                نام و نام خانوادگی
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="علی احمدی"
                className="input w-full"
                required
                minLength={2}
                maxLength={100}
                autoComplete="name"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-surface-700 mb-1.5">
                شماره موبایل
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="09123456789"
                dir="ltr"
                className="input w-full text-center tracking-widest"
                required
                maxLength={14}
                inputMode="numeric"
                autoComplete="tel"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-surface-700 mb-1.5">
                رمز عبور
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="حداقل ۶ کاراکتر"
                  className="input w-full pe-10"
                  required
                  minLength={6}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute end-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 transition-colors"
                  tabIndex={-1}
                  aria-label={showPass ? 'پنهان کردن رمز' : 'نمایش رمز'}
                >
                  {showPass ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div
                className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 text-center animate-slide-down"
                role="alert"
                aria-live="polite"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn btn-accent w-full py-3 text-base"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  در حال ثبت‌نام...
                </span>
              ) : 'ثبت‌نام'}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-surface-100" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-3 text-xs text-surface-400">یا</span>
            </div>
          </div>

          <div className="text-center text-sm text-surface-500">
            حساب کاربری دارید؟{' '}
            <Link href="/login" className="text-brand-600 font-bold hover:text-brand-700">
              وارد شوید
            </Link>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-surface-400">
          <ShieldIcon size={14} className="text-green-500" />
          <span>اطلاعات شما با رمزگذاری SSL محافظت می‌شود</span>
        </div>
      </div>
    </div>
  )
}
