'use client'

import { useState } from 'react'

interface ContactFormProps {
  phone?: string
  email?: string
  address?: string
  hours?: string
}

type FormState = 'idle' | 'loading' | 'success' | 'error'

export function ContactForm({ phone, email, address, hours }: ContactFormProps) {
  const [state, setState] = useState<FormState>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setState('loading')
    setErrorMsg('')

    const form = e.currentTarget
    const data = {
      fullName:    (form.elements.namedItem('fullName')    as HTMLInputElement).value,
      phone:       (form.elements.namedItem('phone')       as HTMLInputElement).value,
      subject:     (form.elements.namedItem('subject')     as HTMLSelectElement).value,
      message:     (form.elements.namedItem('message')     as HTMLTextAreaElement).value,
    }

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (res.ok) {
        setState('success')
        form.reset()
      } else {
        const json = await res.json().catch(() => ({})) as { error?: string }
        setErrorMsg(json.error ?? 'خطا در ارسال پیام. لطفاً مجدداً تلاش کنید.')
        setState('error')
      }
    } catch {
      setErrorMsg('اتصال به سرور ممکن نشد. اینترنت خود را بررسی کنید.')
      setState('error')
    }
  }

  if (state === 'success') {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
        <div className="text-5xl mb-4">✅</div>
        <h3 className="text-xl font-bold text-green-800 mb-2">پیام شما ارسال شد!</h3>
        <p className="text-green-700">کارشناسان ما در اسرع وقت با شما تماس می‌گیرند.</p>
        <button
          type="button"
          onClick={() => setState('idle')}
          className="mt-6 btn btn-outline text-green-700 border-green-300 hover:bg-green-50"
        >
          ارسال پیام جدید
        </button>
      </div>
    )
  }

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Info Cards */}
      <div className="space-y-4">
        {phone && (
          <a
            href={`tel:${phone.replace(/\D/g, '')}`}
            className="flex items-start gap-4 bg-white rounded-2xl p-5 border border-surface-100 hover:border-brand-200 hover:bg-brand-50 transition-all group"
          >
            <span className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center text-xl flex-shrink-0 group-hover:bg-brand-200 transition-colors">
              📞
            </span>
            <div>
              <p className="text-xs text-surface-400 mb-0.5">شماره تماس</p>
              <p className="font-bold text-surface-900 font-mono" dir="ltr">{phone}</p>
            </div>
          </a>
        )}
        {email && (
          <a
            href={`mailto:${email}`}
            className="flex items-start gap-4 bg-white rounded-2xl p-5 border border-surface-100 hover:border-brand-200 hover:bg-brand-50 transition-all group"
          >
            <span className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-xl flex-shrink-0">
              ✉️
            </span>
            <div>
              <p className="text-xs text-surface-400 mb-0.5">ایمیل</p>
              <p className="font-semibold text-surface-900" dir="ltr">{email}</p>
            </div>
          </a>
        )}
        {address && (
          <div className="flex items-start gap-4 bg-white rounded-2xl p-5 border border-surface-100">
            <span className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center text-xl flex-shrink-0">
              📍
            </span>
            <div>
              <p className="text-xs text-surface-400 mb-0.5">آدرس</p>
              <p className="text-sm text-surface-700 leading-relaxed">{address}</p>
            </div>
          </div>
        )}
        {hours && (
          <div className="flex items-start gap-4 bg-white rounded-2xl p-5 border border-surface-100">
            <span className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-xl flex-shrink-0">
              🕐
            </span>
            <div>
              <p className="text-xs text-surface-400 mb-0.5">ساعت کاری</p>
              <p className="text-sm text-surface-700">{hours}</p>
            </div>
          </div>
        )}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="lg:col-span-2 bg-white rounded-2xl border border-surface-100 p-6 sm:p-8 space-y-5">
        <h3 className="text-lg font-bold text-surface-900 mb-2">ارسال پیام</h3>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-surface-700 mb-1.5">
              نام و نام خانوادگی <span className="text-red-500">*</span>
            </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              required
              placeholder="مثال: علی رضایی"
              className="w-full rounded-xl border border-surface-200 px-4 py-2.5 text-sm focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition-all"
            />
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-surface-700 mb-1.5">
              شماره موبایل <span className="text-red-500">*</span>
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              required
              placeholder="09xxxxxxxxx"
              dir="ltr"
              pattern="^(\+98|0)?9\d{9}$"
              className="w-full rounded-xl border border-surface-200 px-4 py-2.5 text-sm focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition-all"
            />
          </div>
        </div>

        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-surface-700 mb-1.5">
            موضوع
          </label>
          <select
            id="subject"
            name="subject"
            className="w-full rounded-xl border border-surface-200 px-4 py-2.5 text-sm focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition-all bg-white"
          >
            <option value="consultation">مشاوره خرید</option>
            <option value="support">پشتیبانی فنی</option>
            <option value="installation">نصب و راه‌اندازی</option>
            <option value="warranty">گارانتی و خدمات پس از فروش</option>
            <option value="other">سایر</option>
          </select>
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium text-surface-700 mb-1.5">
            پیام شما <span className="text-red-500">*</span>
          </label>
          <textarea
            id="message"
            name="message"
            required
            rows={5}
            placeholder="پیام خود را اینجا بنویسید..."
            className="w-full rounded-xl border border-surface-200 px-4 py-2.5 text-sm focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition-all resize-none"
          />
        </div>

        {state === 'error' && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            {errorMsg}
          </p>
        )}

        <button
          type="submit"
          disabled={state === 'loading'}
          className="btn btn-primary w-full py-3 text-base font-bold disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {state === 'loading' ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              در حال ارسال...
            </span>
          ) : (
            'ارسال پیام'
          )}
        </button>
      </form>
    </div>
  )
}
