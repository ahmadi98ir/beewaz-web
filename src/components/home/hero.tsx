'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { ShieldIcon, CheckIcon } from '@/components/ui/icons'

const stats = [
  { value: 15000, suffix: '+', label: 'مشتری راضی' },
  { value: 10, suffix: '+', label: 'سال تجربه' },
  { value: 80, suffix: '+', label: 'محصول انحصاری' },
  { value: 18, suffix: ' ماه', label: 'گارانتی رسمی' },
]

const features = [
  'نصب رایگان در تهران',
  'پشتیبانی ۲۴/۷',
  'ضمانت بازگشت وجه',
]

function CountUp({ target, suffix }: { target: number; suffix: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const started = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && !started.current) {
          started.current = true
          const duration = 1800
          const steps = 60
          const increment = target / steps
          let current = 0
          const timer = setInterval(() => {
            current += increment
            if (current >= target) {
              setCount(target)
              clearInterval(timer)
            } else {
              setCount(Math.floor(current))
            }
          }, duration / steps)
        }
      },
      { threshold: 0.5 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [target])

  return (
    <span ref={ref} className="tabular-nums">
      {new Intl.NumberFormat('fa-IR').format(count)}{suffix}
    </span>
  )
}

export function Hero() {
  return (
    <section
      className="relative overflow-hidden bg-surface-950 text-white"
      aria-label="تصویر اصلی"
    >
      {/* ── Background Elements ──────────────────────────────────────────────── */}

      {/* شبکه نقطه‌ای ظریف */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: 'radial-gradient(circle, rgb(255 255 255 / 0.15) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* Radial glow قرمز */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-1/2 -translate-y-1/2 end-0 w-[600px] h-[600px] rounded-full opacity-25"
          style={{
            background: 'radial-gradient(circle, #e61010 0%, transparent 70%)',
            transform: 'translate(30%, -50%)',
          }}
        />
        <div
          className="absolute top-0 start-0 w-64 h-64 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #e61010 0%, transparent 70%)' }}
        />
      </div>

      {/* ── Content ──────────────────────────────────────────────────────────── */}
      <div className="container-main relative z-10 py-20 lg:py-28">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">

          {/* ستون چپ — متن */}
          <div className="space-y-8">

            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-600/15 border border-brand-600/30 text-brand-400 text-sm font-semibold backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse flex-shrink-0" />
              برند امنیتی پیشرو در ایران
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight">
              امنیت خانه و{' '}
              <span className="relative inline-block">
                <span className="text-gradient-brand">کسب‌وکار</span>
                {/* خط زیر */}
                <svg
                  className="absolute -bottom-2 start-0 w-full"
                  viewBox="0 0 200 8"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <path
                    d="M0 6 Q50 0 100 4 Q150 8 200 2"
                    stroke="#e61010"
                    strokeWidth="3"
                    fill="none"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              <br />
              را به بیواز بسپارید
            </h1>

            {/* Subheadline */}
            <p className="text-lg text-white/65 leading-relaxed max-w-lg">
              سیستم‌های دزدگیر حرفه‌ای برای خانه، مغازه و اماکن تجاری.
              نصب توسط تکنیسین‌های مجرب، گارانتی رسمی و پشتیبانی همیشگی.
            </p>

            {/* Features */}
            <ul className="flex flex-col sm:flex-row gap-3 sm:gap-6" role="list">
              {features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-white/70">
                  <span className="w-5 h-5 rounded-full bg-brand-600/20 border border-brand-600/40 flex items-center justify-center flex-shrink-0">
                    <CheckIcon size={10} className="text-brand-400" />
                  </span>
                  {f}
                </li>
              ))}
            </ul>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/shop" className="btn btn-primary px-8 py-3.5 text-base shadow-lg shadow-brand-600/30">
                مشاهده محصولات
              </Link>
              <Link
                href="/contact"
                className="btn border border-white/20 text-white hover:bg-white/10 px-8 py-3.5 text-base transition-colors"
              >
                مشاوره رایگان
              </Link>
            </div>

          </div>

          {/* ستون راست — تصویر / ایلاستریشن */}
          <div className="relative flex items-center justify-center lg:justify-end">

            {/* حلقه‌های pulse */}
            <div className="absolute w-80 h-80 rounded-full border border-brand-600/20 animate-pulse-ring" />
            <div className="absolute w-80 h-80 rounded-full border border-brand-600/10 animate-pulse-ring-delay" />

            {/* کارت اصلی Shield */}
            <div className="relative animate-float">
              {/* Glow زمینه */}
              <div className="absolute inset-0 bg-brand-600/30 rounded-3xl blur-3xl scale-110" />

              <div className="relative w-72 h-72 sm:w-80 sm:h-80 bg-gradient-to-br from-surface-800 to-surface-900 rounded-3xl border border-white/10 flex items-center justify-center shadow-2xl">
                <ShieldIcon size={120} className="text-brand-500 drop-shadow-lg" />

                {/* چراغ چشمک‌زن */}
                <div className="absolute top-5 end-5 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse shadow-lg shadow-green-400/50" />
                  <span className="text-xs text-white/50 font-mono">ARMED</span>
                </div>

                {/* خط وضعیت */}
                <div className="absolute bottom-6 inset-x-6">
                  <div className="flex justify-between text-xs text-white/40 mb-1.5">
                    <span>سیگنال</span>
                    <span>قوی</span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-l from-brand-500 to-green-400 rounded-full"
                      style={{ width: '85%' }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* کارت شناور — تجربه */}
            <div className="absolute -top-4 -start-8 sm:-start-16 glass rounded-2xl px-4 py-3 shadow-xl border border-white/20 text-surface-900 animate-float" style={{ animationDelay: '0.8s' }}>
              <p className="text-xs text-surface-500 mb-0.5">تجربه</p>
              <p className="text-xl font-black text-surface-900">۱۰+ سال</p>
            </div>

            {/* کارت شناور — مشتریان */}
            <div className="absolute -bottom-4 -end-4 sm:-end-12 glass rounded-2xl px-4 py-3 shadow-xl border border-white/20 text-surface-900 animate-float" style={{ animationDelay: '1.6s' }}>
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2 space-x-reverse">
                  {['#e61010', '#3B82F6', '#10B981'].map((c) => (
                    <div key={c} className="w-7 h-7 rounded-full border-2 border-white" style={{ background: c }} />
                  ))}
                </div>
                <div>
                  <p className="text-xs text-surface-500">مشتری</p>
                  <p className="text-sm font-bold text-surface-900">+۱۵,۰۰۰</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ── Stats Bar ────────────────────────────────────────────────────────── */}
      <div className="relative z-10 border-t border-white/10 bg-white/5 backdrop-blur-sm">
        <div className="container-main py-6">
          <dl className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {stats.map(({ value, suffix, label }) => (
              <div key={label} className="text-center">
                <dt className="text-2xl sm:text-3xl font-black text-white">
                  <CountUp target={value} suffix={suffix} />
                </dt>
                <dd className="text-sm text-white/50 mt-1">{label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* Wave separator */}
      <div className="relative z-10 -mb-px">
        <svg viewBox="0 0 1440 40" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="w-full h-8 sm:h-10" aria-hidden="true">
          <path d="M0 40H1440V10C1200 40 960 0 720 20C480 40 240 0 0 30V40Z" fill="var(--color-surface-50)" />
        </svg>
      </div>

    </section>
  )
}
