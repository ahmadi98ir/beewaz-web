'use client'

import { useState } from 'react'
import { AnimateIn } from '@/components/ui/animate-in'
import { PhoneIcon, MailIcon, MapPinIcon } from '@/components/ui/icons'

const contactInfo = [
  {
    icon: PhoneIcon,
    title: 'تلفن',
    lines: ['۰۲۱-۰۰۰۰-۰۰۰۰', '۰۹۱۲-۰۰۰-۰۰۰۰'],
    href: 'tel:02100000000',
    color: 'bg-green-50 text-green-600',
  },
  {
    icon: MailIcon,
    title: 'ایمیل',
    lines: ['info@beewaz.ir', 'support@beewaz.ir'],
    href: 'mailto:info@beewaz.ir',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    icon: MapPinIcon,
    title: 'آدرس',
    lines: ['تهران، خیابان ولیعصر', 'پلاک ۱، واحد ۵'],
    href: '#map',
    color: 'bg-brand-50 text-brand-600',
  },
]

const subjects = ['مشاوره خرید', 'پشتیبانی فنی', 'درخواست نصب', 'همکاری تجاری', 'سایر']

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', phone: '', subject: '', message: '' })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await new Promise((r) => setTimeout(r, 1000))
    setLoading(false)
    setSubmitted(true)
  }

  return (
    <div className="min-h-screen">

      {/* Hero */}
      <section className="bg-white border-b border-surface-200 py-12">
        <div className="container-main">
          <AnimateIn>
            <p className="text-brand-600 font-bold text-sm mb-2">تماس با ما</p>
            <h1 className="text-3xl font-black text-surface-900 mb-3">چطور می‌توانیم کمک کنیم؟</h1>
            <p className="text-surface-500 max-w-lg">
              تیم پشتیبانی بیواز ۲۴ ساعته آماده پاسخگویی است. از هر راهی راحت‌تری تماس بگیرید.
            </p>
          </AnimateIn>
        </div>
      </section>

      <div className="container-main py-12">
        <div className="grid lg:grid-cols-3 gap-8">

          {/* Contact Info */}
          <div className="space-y-4">
            {contactInfo.map((item, i) => (
              <AnimateIn key={item.title} delay={i * 80}>
                <a
                  href={item.href}
                  className="flex items-start gap-4 bg-white rounded-2xl border border-surface-200 p-5 hover:shadow-md hover:-translate-y-0.5 transition-all group"
                >
                  <div className={`w-11 h-11 rounded-xl ${item.color} flex items-center justify-center flex-shrink-0`}>
                    <item.icon size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-surface-900 text-sm mb-1 group-hover:text-brand-600 transition-colors">{item.title}</p>
                    {item.lines.map((line) => (
                      <p key={line} className="text-sm text-surface-500" dir="ltr">{line}</p>
                    ))}
                  </div>
                </a>
              </AnimateIn>
            ))}

            {/* Hours */}
            <AnimateIn delay={240}>
              <div className="bg-surface-50 rounded-2xl border border-surface-200 p-5">
                <p className="font-bold text-surface-900 text-sm mb-3">ساعات کاری</p>
                <div className="space-y-2 text-sm">
                  {[
                    { days: 'شنبه تا چهارشنبه', time: '۸:۰۰ — ۱۸:۰۰' },
                    { days: 'پنجشنبه', time: '۸:۰۰ — ۱۳:۰۰' },
                    { days: 'جمعه', time: 'تعطیل (پشتیبانی اضطراری)' },
                  ].map((row) => (
                    <div key={row.days} className="flex justify-between">
                      <span className="text-surface-500">{row.days}</span>
                      <span className="text-surface-800 font-medium" dir="ltr">{row.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </AnimateIn>
          </div>

          {/* Form */}
          <div className="lg:col-span-2">
            <AnimateIn delay={100}>
              <div className="bg-white rounded-2xl border border-surface-200 p-7">
                {submitted ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-black text-surface-900 mb-2">پیام شما ارسال شد!</h3>
                    <p className="text-surface-500 text-sm mb-6">کارشناسان ما در اولین فرصت با شما تماس می‌گیرند.</p>
                    <button
                      onClick={() => { setSubmitted(false); setForm({ name: '', phone: '', subject: '', message: '' }) }}
                      className="btn btn-outline py-2.5 px-6 text-sm"
                    >
                      ارسال پیام جدید
                    </button>
                  </div>
                ) : (
                  <form onSubmit={onSubmit} className="space-y-5">
                    <h2 className="text-lg font-black text-surface-900 mb-6">ارسال پیام</h2>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-surface-700 mb-1.5">نام و نام‌خانوادگی</label>
                        <input
                          type="text"
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          placeholder="مهدی احمدی"
                          className="input w-full"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-surface-700 mb-1.5">شماره موبایل</label>
                        <input
                          type="tel"
                          value={form.phone}
                          onChange={(e) => setForm({ ...form, phone: e.target.value })}
                          placeholder="09123456789"
                          dir="ltr"
                          className="input w-full text-center"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-surface-700 mb-1.5">موضوع</label>
                      <select
                        value={form.subject}
                        onChange={(e) => setForm({ ...form, subject: e.target.value })}
                        className="input w-full"
                        required
                      >
                        <option value="">موضوع را انتخاب کنید...</option>
                        {subjects.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-surface-700 mb-1.5">پیام</label>
                      <textarea
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        placeholder="سوال یا درخواست خود را بنویسید..."
                        rows={5}
                        className="input w-full resize-none"
                        required
                        minLength={10}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="btn btn-primary w-full py-3"
                    >
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          در حال ارسال...
                        </span>
                      ) : 'ارسال پیام'}
                    </button>
                  </form>
                )}
              </div>
            </AnimateIn>
          </div>
        </div>
      </div>
    </div>
  )
}
