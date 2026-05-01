'use client'

import { useActionState, useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { BeewazLogo } from '@/components/ui/logo'
import { ShieldIcon } from '@/components/ui/icons'
import { registerAction } from './actions'

export default function RegisterForm() {
  const router = useRouter()
  const [state, action, pending] = useActionState(registerAction, {})
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [signingIn, setSigningIn] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const result = await registerAction({}, fd)

    if (result.success) {
      setSigningIn(true)
      await signIn('credentials', { phone, password, redirect: false })
      router.push('/')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-50 to-surface-100 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <BeewazLogo />
          </div>
          <h1 className="text-xl font-black text-surface-900">ثبت‌نام در بیواز</h1>
          <p className="text-sm text-surface-400 mt-1">حساب جدید بسازید</p>
        </div>

        <div className="bg-white rounded-3xl border border-surface-200 shadow-card p-7">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-semibold text-surface-700 mb-1.5">نام و نام‌خانوادگی</label>
              <input
                name="fullName"
                type="text"
                placeholder="مهدی احمدی"
                className="input w-full"
                required
                minLength={2}
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold text-surface-700 mb-1.5">شماره موبایل</label>
              <input
                name="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="09123456789"
                dir="ltr"
                className="input w-full text-center tracking-widest"
                required
                maxLength={11}
                pattern="09[0-9]{9}"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-surface-700 mb-1.5">رمز عبور</label>
              <div className="relative">
                <input
                  name="password"
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="حداقل ۶ کاراکتر"
                  className="input w-full pe-10"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute end-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600"
                  tabIndex={-1}
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

            {/* Terms */}
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input type="checkbox" required className="mt-0.5 w-4 h-4 accent-brand-600 flex-shrink-0" />
              <span className="text-xs text-surface-500 leading-relaxed">
                با{' '}
                <Link href="/terms" className="text-brand-600 hover:text-brand-700 underline">شرایط استفاده</Link>
                {' '}و{' '}
                <Link href="/privacy" className="text-brand-600 hover:text-brand-700 underline">حریم خصوصی</Link>
                {' '}بیواز موافقم
              </span>
            </label>

            {state.error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 text-center">
                {state.error}
              </div>
            )}

            <button
              type="submit"
              disabled={pending || signingIn}
              className="btn btn-primary w-full py-3 text-base"
            >
              {pending || signingIn ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {signingIn ? 'در حال ورود...' : 'در حال ثبت‌نام...'}
                </span>
              ) : 'ثبت‌نام'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-surface-500">
            حساب دارید؟{' '}
            <Link href="/login" className="text-brand-600 font-bold hover:text-brand-700">وارد شوید</Link>
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
