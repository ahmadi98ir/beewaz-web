'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { ShieldIcon, CheckIcon } from '@/components/ui/icons'

const stats = [
  { value: 15000, suffix: '+', label: 'مشتری راضی' },
  { value: 10,    suffix: '+', label: 'سال تجربه' },
  { value: 80,    suffix: '+', label: 'محصول انحصاری' },
  { value: 18,    suffix: ' ماه', label: 'گارانتی رسمی' },
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
            if (current >= target) { setCount(target); clearInterval(timer) }
            else setCount(Math.floor(current))
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
  const bgRef = useRef<HTMLDivElement>(null)

  // Parallax: بک‌گراند با سرعت ۳۵٪ اسکرول حرکت می‌کند
  useEffect(() => {
    const el = bgRef.current
    if (!el) return
    const onScroll = () => {
      const y = window.scrollY
      el.style.transform = `translateY(${y * 0.35}px)`
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <section className="relative overflow-hidden bg-surface-950 text-white" aria-label="تصویر اصلی">

      {/* شبکه نقطه‌ای — parallax */}
      <div
        ref={bgRef}
        className="absolute inset-0 opacity-20 will-change-transform"
        style={{ backgroundImage: 'radial-gradient(circle, rgb(255 255 255 / 0.15) 1px, transparent 1px)', backgroundSize: '32px 32px' }}
      />

      {/* Glow‌های رنگی */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 end-0 w-[500px] h-[500px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #3B5CEF 0%, transparent 70%)', transform: 'translate(40%, -50%)' }} />
        <div className="absolute top-0 start-0 w-48 h-48 sm:w-64 sm:h-64 rounded-full opacity-25"
          style={{ background: 'radial-gradient(circle, #F97316 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 end-1/4 w-64 h-64 sm:w-96 sm:h-96 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #1B3A8A 0%, transparent 70%)' }} />
      </div>

      {/* ── Content ───────────────────────────────────────────────── */}
      <div className="container-main relative z-10 py-16 sm:py-20 lg:py-28">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-8 items-center">

          {/* ستون متن */}
          <div className="space-y-6 sm:space-y-8">

            {/* Badge نارنجی */}
            <div className="animate-bounce-in inline-flex items-center gap-2.5 px-4 py-2 rounded-full border text-sm font-semibold backdrop-blur-sm"
              style={{ background: 'rgb(249 115 22 / 0.12)', borderColor: 'rgb(249 115 22 / 0.35)', color: '#FB923C' }}>
              <span className="w-2 h-2 rounded-full bg-accent-400 animate-pulse flex-shrink-0" />
              برند امنیتی پیشرو در ایران
              <span className="px-2 py-0.5 rounded-full text-xs font-bold"
                style={{ background: 'rgb(249 115 22 / 0.2)', color: '#FB923C' }}>
                BEEWAZ
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black leading-tight animate-slide-in-left">
              امنیت خانه و{' '}
              <span className="relative inline-block">
                <span className="text-gradient-brand animate-shimmer-text">کسب‌وکار</span>
                <svg className="absolute -bottom-2 start-0 w-full" viewBox="0 0 200 8" preserveAspectRatio="none" aria-hidden="true">
                  <path d="M0 6 Q50 0 100 4 Q150 8 200 2" stroke="#F97316" strokeWidth="3" fill="none" strokeLinecap="round" />
                </svg>
              </span>
              <br />را به بیواز بسپارید
            </h1>

            {/* Subheadline */}
            <p className="text-base sm:text-lg text-white/65 leading-relaxed max-w-lg animate-fade-in" style={{ animationDelay: '200ms' }}>
              سیستم‌های دزدگیر حرفه‌ای برای خانه، مغازه و اماکن تجاری.
              نصب توسط تکنیسین‌های مجرب، گارانتی رسمی و پشتیبانی همیشگی.
            </p>

            {/* Features */}
            <ul className="flex flex-wrap gap-3 sm:gap-6" role="list">
              {features.map((f, i) => (
                <li key={f} className="flex items-center gap-2 text-sm text-white/80 animate-slide-up"
                  style={{ animationDelay: `${300 + i * 100}ms` }}>
                  <span className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 animate-glow-pulse"
                    style={{ background: 'rgb(249 115 22 / 0.2)', border: '1px solid rgb(249 115 22 / 0.5)' }}>
                    <CheckIcon size={10} style={{ color: '#FB923C' }} />
                  </span>
                  {f}
                </li>
              ))}
            </ul>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 animate-slide-up" style={{ animationDelay: '500ms' }}>
              <Link href="/shop" className="btn btn-accent px-6 sm:px-8 py-3.5 text-base shadow-lg orange-glow text-center">
                مشاهده محصولات
              </Link>
              <Link href="/contact" className="btn border border-white/20 text-white hover:bg-white/10 px-6 sm:px-8 py-3.5 text-base transition-colors text-center">
                مشاوره رایگان
              </Link>
            </div>

          </div>

          {/* ستون تصویر — فقط sm+ */}
          <div className="relative hidden sm:flex items-center justify-center lg:justify-end">

            {/* حلقه‌های pulse */}
            <div className="absolute w-72 h-72 sm:w-80 sm:h-80 rounded-full border animate-pulse-ring"
              style={{ borderColor: 'rgb(249 115 22 / 0.25)' }} />
            <div className="absolute w-72 h-72 sm:w-80 sm:h-80 rounded-full border animate-pulse-ring-delay"
              style={{ borderColor: 'rgb(249 115 22 / 0.15)' }} />

            {/* کارت اصلی Shield */}
            <div className="relative animate-float">
              <div className="absolute inset-0 rounded-3xl blur-3xl scale-110"
                style={{ background: 'linear-gradient(135deg, rgb(27 58 138 / 0.4), rgb(249 115 22 / 0.2))' }} />

              <div className="relative w-64 h-64 sm:w-80 sm:h-80 rounded-3xl border border-white/10 flex items-center justify-center shadow-2xl overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1B3A8A 100%)' }}>

                <div className="relative">
                  <div className="absolute inset-0 blur-2xl scale-150 opacity-30"
                    style={{ background: 'radial-gradient(circle, #F97316, transparent)' }} />
                  <ShieldIcon size={100} className="relative z-10 drop-shadow-2xl"
                    style={{ color: '#F97316' }} />
                </div>

                <div className="absolute top-5 end-5 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse shadow-lg shadow-green-400/50" />
                  <span className="text-xs text-white/50 font-mono tracking-wider">ARMED</span>
                </div>

                <div className="absolute bottom-6 inset-x-6">
                  <div className="flex justify-between text-xs text-white/40 mb-1.5">
                    <span>سیگنال</span>
                    <span className="text-accent-400 font-semibold">قوی ۸۵٪</span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: '85%', background: 'linear-gradient(90deg, #1B3A8A, #F97316)' }} />
                  </div>
                </div>

                <div className="absolute top-0 start-0 w-16 h-16 opacity-10"
                  style={{ background: 'linear-gradient(135deg, #F97316, transparent)' }} />
              </div>
            </div>

            {/* کارت شناور — تجربه (فقط md+) */}
            <div className="absolute hidden md:block -top-4 -start-12 glass rounded-2xl px-4 py-3 shadow-xl border border-white/20 text-surface-900 animate-float"
              style={{ animationDelay: '0.8s' }}>
              <p className="text-xs text-surface-500 mb-0.5">تجربه</p>
              <p className="text-xl font-black" style={{ color: '#1B3A8A' }}>۱۰+ سال</p>
              <div className="orange-divider mt-1.5" />
            </div>

            {/* کارت شناور — مشتریان (فقط md+) */}
            <div className="absolute hidden md:block -bottom-4 -end-8 glass rounded-2xl px-4 py-3 shadow-xl border border-white/20 text-surface-900 animate-float"
              style={{ animationDelay: '1.6s' }}>
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2 space-x-reverse">
                  {['#1B3A8A', '#F97316', '#10B981'].map((c) => (
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

          {/* ستون تصویر — فقط موبایل (ساده‌تر) */}
          <div className="flex sm:hidden justify-center">
            <div className="relative animate-float">
              <div className="absolute inset-0 rounded-3xl blur-2xl scale-110"
                style={{ background: 'linear-gradient(135deg, rgb(27 58 138 / 0.5), rgb(249 115 22 / 0.3))' }} />
              <div className="relative w-52 h-52 rounded-3xl border border-white/10 flex items-center justify-center shadow-2xl overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1B3A8A 100%)' }}>
                <ShieldIcon size={80} style={{ color: '#F97316' }} />
                <div className="absolute top-4 end-4 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-xs text-white/50 font-mono">ARMED</span>
                </div>
                <div className="absolute bottom-4 inset-x-4">
                  <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: '85%', background: 'linear-gradient(90deg, #1B3A8A, #F97316)' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Stats Bar */}
      <div className="relative z-10 border-t border-white/10 bg-white/5 backdrop-blur-sm">
        <div className="container-main py-5 sm:py-6">
          <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            {stats.map(({ value, suffix, label }, i) => (
              <div key={label} className="text-center group">
                <dt className="text-xl sm:text-3xl font-black" style={{ color: i % 2 === 0 ? '#F97316' : '#ffffff' }}>
                  <CountUp target={value} suffix={suffix} />
                </dt>
                <dd className="text-xs sm:text-sm text-white/50 mt-1">{label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* Wave separator */}
      <div className="relative z-10 -mb-px">
        <svg viewBox="0 0 1440 40" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="w-full h-6 sm:h-10" aria-hidden="true">
          <path d="M0 40H1440V10C1200 40 960 0 720 20C480 40 240 0 0 30V40Z" fill="var(--color-surface-50)" />
        </svg>
      </div>

    </section>
  )
}
