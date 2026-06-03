'use client'

import { useState, useEffect, useRef } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { BeewazLogo } from '@/components/ui/logo'
import { ShieldIcon } from '@/components/ui/icons'
import { toFaDigits } from '@/lib/utils'

type Step = 'phone' | 'otp'

const RESEND_SECONDS = 120

export default function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const callbackUrl = params.get('callbackUrl') ?? '/'

  const [step, setStep] = useState<Step>('phone')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const otpRef = useRef<HTMLInputElement>(null)

  // تایمر ارسال مجدد
  useEffect(() => {
    if (countdown <= 0) return
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [countdown])

  // فوکوس روی input کد بعد از رفتن به مرحله دوم
  useEffect(() => {
    if (step === 'otp') otpRef.current?.focus()
  }, [step])

  // خواندن خودکار کد از پیامک (WebOTP API) — Chrome/Android
  // پیامک باید به فرمت «@beewaz.ir #۱۲۳۴۵۶» ختم شود تا مرورگر کد را تشخیص دهد
  useEffect(() => {
    if (step !== 'otp') return
    if (!('OTPCredential' in window)) return

    const ac = new AbortController()
    navigator.credentials
      .get({
        // @ts-expect-error — otp هنوز در تایپ‌های استاندارد TS نیست
        otp: { transport: ['sms'] },
        signal: ac.signal,
      })
      .then((cred) => {
        const code = (cred as unknown as { code?: string } | null)?.code
        if (code) setOtp(code.replace(/\D/g, '').slice(0, 6))
      })
      .catch(() => { /* کاربر اجازه نداد یا منقضی شد — بی‌اهمیت */ })

    return () => ac.abort()
  }, [step])

  // ورود خودکار وقتی کد ۶ رقمی کامل شد (با autofill پیامک)
  useEffect(() => {
    if (step === 'otp' && otp.length === 6 && !loading) {
      verifyOtp()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otp, step])

  const normalizePhone = (v: string) =>
    v
      .replace(/[۰-۹]/g, (d) => String.fromCharCode(d.charCodeAt(0) - 0x06f0 + 0x30))
      .replace(/[٠-٩]/g, (d) => String.fromCharCode(d.charCodeAt(0) - 0x0660 + 0x30))
      .replace(/\s|-/g, '')
      .replace(/^\+98/, '0')
      .replace(/^98/, '0')

  // مرحله اول: ارسال OTP
  const sendOtp = async () => {
    setError('')
    const normalized = normalizePhone(phone)
    if (!/^09\d{9}$/.test(normalized)) {
      setError('شماره موبایل معتبر نیست. مثال: ۰۹۱۲۳۴۵۶۷۸۹')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: normalized }),
      })
      const data = await res.json() as { ok?: boolean; error?: string }
      if (!res.ok) {
        setError(data.error ?? 'خطا در ارسال کد')
        return
      }
      setPhone(normalized)
      setStep('otp')
      setCountdown(RESEND_SECONDS)
    } catch {
      setError('خطا در ارتباط با سرور')
    } finally {
      setLoading(false)
    }
  }

  // مرحله دوم: تأیید OTP و ورود
  const verifyOtp = async () => {
    setError('')
    if (otp.length !== 6) {
      setError('کد تأیید باید ۶ رقم باشد')
      return
    }
    setLoading(true)
    const res = await signIn('credentials', { phone, otp, redirect: false })
    setLoading(false)

    if (res?.error) {
      setError('کد وارد شده اشتباه یا منقضی شده است')
      setOtp('')
      otpRef.current?.focus()
      return
    }

    try {
      const session = await fetch('/api/auth/session').then((r) => r.json())

      // نقش‌های کارمندی (هر نقش غیر از مشتری) → پنل مدیریت
      const role = session?.user?.role
      if (role && role !== 'customer') {
        window.location.href = '/admin'
        return
      }

      // اگر callbackUrl مشخص و معنادار است (مثلاً redirect از صفحه checkout)
      if (callbackUrl && callbackUrl !== '/' && !callbackUrl.startsWith('/login')) {
        window.location.href = callbackUrl
        return
      }

      // پروفایل ناقص → صفحه تکمیل ثبت‌نام
      if (!session?.user?.name) {
        window.location.href = '/profile/complete'
        return
      }

      // پروفایل کامل → صفحه پروفایل
      window.location.href = '/profile'
    } catch {
      window.location.href = '/profile'
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (step === 'phone') sendOtp()
    else verifyOtp()
  }

  const formatCountdown = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return toFaDigits(`${m}:${sec.toString().padStart(2, '0')}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-50 to-surface-100 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <BeewazLogo />
          </div>
          <h1 className="text-xl font-black text-surface-900">ورود به حساب کاربری</h1>
          <p className="text-sm text-surface-400 mt-1">برای خرید و پیگیری سفارش وارد شوید</p>
        </div>

        <div className="bg-white rounded-3xl border border-surface-200 shadow-card p-7">
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* ── مرحله ۱: شماره موبایل ── */}
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
                disabled={step === 'otp'}
              />
            </div>

            {/* ── مرحله ۲: کد تأیید ── */}
            {step === 'otp' && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-semibold text-surface-700">
                    کد تأیید
                  </label>
                  <span className="text-xs text-surface-400">
                    ارسال به {phone}
                  </span>
                </div>
                <input
                  ref={otpRef}
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="_ _ _ _ _ _"
                  dir="ltr"
                  className="input w-full text-center tracking-[0.4em] text-lg font-bold"
                  required
                  maxLength={6}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                />
                <div className="mt-2 flex items-center justify-between text-xs text-surface-400">
                  <span>کد ۶ رقمی پیامک شد</span>
                  {countdown > 0 ? (
                    <span className="font-mono">{formatCountdown(countdown)}</span>
                  ) : (
                    <button
                      type="button"
                      onClick={sendOtp}
                      disabled={loading}
                      className="text-brand-600 font-semibold hover:text-brand-700"
                    >
                      ارسال مجدد
                    </button>
                  )}
                </div>
              </div>
            )}

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
              className="btn btn-primary w-full py-3 text-base"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {step === 'phone' ? 'در حال ارسال کد...' : 'در حال ورود...'}
                </span>
              ) : step === 'phone' ? 'ارسال کد تأیید' : 'ورود'}
            </button>

            {step === 'otp' && (
              <button
                type="button"
                onClick={() => { setStep('phone'); setOtp(''); setError('') }}
                className="w-full text-center text-sm text-surface-400 hover:text-surface-600"
              >
                ویرایش شماره موبایل
              </button>
            )}
          </form>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-surface-400">
          <ShieldIcon size={14} className="text-green-500" />
          <span>اطلاعات شما با رمزگذاری SSL محافظت می‌شود</span>
        </div>
      </div>
    </div>
  )
}
