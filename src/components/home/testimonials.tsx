'use client'

import { useEffect, useRef } from 'react'

const TESTIMONIALS = [
  {
    name: 'علیرضا رضایی',
    role: 'مدیر فروشگاه',
    location: 'تهران',
    stars: 5,
    text: 'بعد از نصب سیستم BH11 بیواز، خیالم از امنیت فروشگاهم کاملاً راحت شده. نصب سریع، پشتیبانی عالی، و هشدارها دقیق هستند. واقعاً سرمایه‌گذاری ارزشمندی بود.',
    initials: 'ع.ر',
    color: '#1B3A8A',
  },
  {
    name: 'فاطمه احمدی',
    role: 'خانه‌دار',
    location: 'اصفهان',
    stars: 5,
    text: 'دو سال است از بیواز استفاده می‌کنم. چند بار سیستم هشدار داده و مانع از سرقت شده. اپلیکیشن موبایل هم خیلی راحت است. بهترین خریدم بود.',
    initials: 'ف.ا',
    color: '#9A3412',
  },
  {
    name: 'محمد حسین موسوی',
    role: 'مدیر دفتر',
    location: 'مشهد',
    stars: 5,
    text: 'پشتیبانی ۲۴ ساعته بیواز واقعی است. یک شب ساعت ۲ با آلارم تماس گرفتم و در کمتر از ۵ دقیقه مشکل برطرف شد. ممنون از تیم بیواز.',
    initials: 'م.م',
    color: '#065F46',
  },
]

function AnimateIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => {
      if (e?.isIntersecting) {
        setTimeout(() => {
          el.style.opacity = '1'
          el.style.transform = 'translateY(0)'
        }, delay)
        obs.disconnect()
      }
    }, { threshold: 0.1 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [delay])
  return (
    <div ref={ref} style={{ opacity: 0, transform: 'translateY(30px)', transition: 'opacity 0.65s cubic-bezier(0.16,1,0.3,1), transform 0.65s cubic-bezier(0.16,1,0.3,1)' }}>
      {children}
    </div>
  )
}

export function Testimonials() {
  return (
    <section className="py-20 sm:py-24" style={{ background: '#0A1028' }}>
      <div className="container-page">

        {/* Header */}
        <AnimateIn>
          <div className="text-center mb-14">
            <div className="orange-divider mx-auto mb-4" />
            <h2 className="font-black text-white mb-3" style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)' }}>
              مشتریان ما{' '}
              <span style={{ background: 'linear-gradient(135deg, #FDE68A, #F97316)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                چه می‌گویند؟
              </span>
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.4)', lineHeight: 1.8 }}>
              بیش از ۵۰۰۰ خانواده و کسب‌وکار به بیواز اعتماد کرده‌اند
            </p>
          </div>
        </AnimateIn>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <AnimateIn key={i} delay={i * 120}>
              <div className="relative p-7 rounded-2xl h-full flex flex-col"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  backdropFilter: 'blur(12px)',
                }}>
                {/* Quote icon */}
                <div className="mb-5 text-5xl leading-none" style={{ color: 'rgba(249,115,22,0.2)', fontFamily: 'serif' }}>"</div>

                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.stars }).map((_, j) => (
                    <svg key={j} className="w-4 h-4" viewBox="0 0 20 20" fill="#F97316">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                  ))}
                </div>

                {/* Text */}
                <p className="flex-1 leading-loose mb-6" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.925rem', lineHeight: 1.9 }}>
                  {t.text}
                </p>

                {/* Author */}
                <div className="flex items-center gap-3 pt-5" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center font-bold text-white text-sm"
                    style={{ background: `linear-gradient(135deg, ${t.color}, ${t.color}99)` }}>
                    {t.initials}
                  </div>
                  <div>
                    <div className="font-bold text-white text-sm">{t.name}</div>
                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem' }}>{t.role} — {t.location}</div>
                  </div>
                </div>

                {/* Subtle glow on hover */}
                <div className="absolute inset-0 rounded-2xl opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{ background: 'linear-gradient(135deg, rgba(249,115,22,0.03), transparent)' }} />
              </div>
            </AnimateIn>
          ))}
        </div>

        {/* Bottom trust bar */}
        <AnimateIn delay={400}>
          <div className="mt-14 flex flex-wrap justify-center items-center gap-8">
            {[
              { value: '۵۰۰۰+', label: 'مشتری راضی' },
              { value: '۴.۹/۵', label: 'امتیاز میانگین' },
              { value: '۱۰+', label: 'سال تجربه' },
              { value: '۹۸٪', label: 'رضایت مشتریان' },
            ].map((s, i) => (
              <div key={i} className="text-center px-6 py-3">
                <div className="font-black text-2xl mb-1" style={{ background: 'linear-gradient(135deg, #FDE68A, #F97316)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  {s.value}
                </div>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </AnimateIn>
      </div>
    </section>
  )
}
