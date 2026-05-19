'use client'

import { useEffect, useRef } from 'react'

const FEATURES = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="rgba(249,115,22,0.15)" stroke="#F97316" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9 12l2 2 4-4" stroke="#F97316" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'محافظت ۲۴ ساعته',
    desc: 'سیستم‌های بیواز هرگز نمی‌خوابند. شبانه‌روز از امنیت اماکن شما حراست می‌کنیم — بدون هیچ وقفه‌ای.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8">
        <rect x="5" y="2" width="14" height="20" rx="3" fill="rgba(249,115,22,0.1)" stroke="#F97316" strokeWidth="1.8"/>
        <circle cx="12" cy="17" r="1.2" fill="#F97316"/>
        <path d="M9 6h6M9 9h4" stroke="#F97316" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    title: 'کنترل از راه دور',
    desc: 'با اپلیکیشن هوشمند بیواز، از هر نقطه‌ای سیستم امنیتی خود را کنترل کنید. آرم کردن، غیرفعال کردن، گزارش لحظه‌ای.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8">
        <circle cx="12" cy="12" r="9" fill="rgba(249,115,22,0.1)" stroke="#F97316" strokeWidth="1.8"/>
        <path d="M12 7v5l3 3" stroke="#F97316" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'نصب سریع و تخصصی',
    desc: 'تیم متخصص ما در کمترین زمان ممکن سیستم را نصب و راه‌اندازی می‌کند. نصب رایگان در سرتاسر ایران.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8">
        <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" fill="rgba(249,115,22,0.1)" stroke="#F97316" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M13.73 21a2 2 0 01-3.46 0" stroke="#F97316" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
    title: 'هشدار آنی و فوری',
    desc: 'به محض تشخیص تهدید، فوری پیامک و اعلان دریافت می‌کنید. سیستم بیواز ثانیه‌شمار واکنش نشان می‌دهد.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8">
        <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" fill="rgba(249,115,22,0.1)" stroke="#F97316" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'پشتیبانی ۲۴/۷',
    desc: 'تیم پشتیبانی ما همواره آماده پاسخگویی و رفع مشکلات شماست. هیچ سوالی بی‌پاسخ نمی‌ماند.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="rgba(249,115,22,0.12)" stroke="#F97316" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'گارانتی ۱۸ ماهه',
    desc: 'تمام محصولات بیواز با گارانتی تعویض ۱۸ ماهه عرضه می‌شوند. خرید با خیالی آسوده.',
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
          el.style.transform = 'translateY(0) scale(1)'
        }, delay)
        obs.disconnect()
      }
    }, { threshold: 0.15 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [delay])
  return (
    <div ref={ref} style={{ opacity: 0, transform: 'translateY(32px) scale(0.97)', transition: 'opacity 0.6s cubic-bezier(0.16,1,0.3,1), transform 0.6s cubic-bezier(0.16,1,0.3,1)' }}>
      {children}
    </div>
  )
}

export function WhyBeewaz() {
  return (
    <section style={{ background: 'linear-gradient(180deg, #060B1A 0%, #0A1028 50%, #060B1A 100%)', padding: '5rem 0 6rem' }}>
      <div className="container-page">

        {/* Header */}
        <AnimateIn>
          <div className="text-center mb-14">
            <div className="orange-divider mx-auto mb-4" />
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold mb-4"
              style={{ background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.25)', color: '#FB923C' }}>
              چرا بیواز؟
            </span>
            <h2 className="font-black text-white mb-4" style={{ fontSize: 'clamp(1.875rem, 4vw, 2.75rem)' }}>
              تکنولوژی محافظت،{' '}
              <span style={{ background: 'linear-gradient(135deg, #FDE68A, #F97316)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                در خدمت آرامش شما
              </span>
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.45)', maxWidth: '520px', margin: '0 auto', lineHeight: 1.8 }}>
              بیواز با ترکیب تکنولوژی پیشرفته و تجربه ۱۰ ساله، بهترین راهکار امنیتی را برای خانه و کسب‌وکار شما فراهم می‌کند.
            </p>
          </div>
        </AnimateIn>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => (
            <AnimateIn key={i} delay={i * 90}>
              <div
                className="group relative p-7 rounded-2xl overflow-hidden transition-all duration-400 cursor-default"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  backdropFilter: 'blur(8px)',
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLDivElement
                  el.style.background = 'rgba(249,115,22,0.07)'
                  el.style.borderColor = 'rgba(249,115,22,0.28)'
                  el.style.transform = 'translateY(-6px)'
                  el.style.boxShadow = '0 20px 40px rgba(0,0,0,0.3), 0 0 20px rgba(249,115,22,0.08)'
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLDivElement
                  el.style.background = 'rgba(255,255,255,0.03)'
                  el.style.borderColor = 'rgba(255,255,255,0.07)'
                  el.style.transform = 'translateY(0)'
                  el.style.boxShadow = 'none'
                }}
              >
                {/* Top glow on hover */}
                <div className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: 'linear-gradient(90deg, transparent, rgba(249,115,22,0.5), transparent)' }} />

                {/* Icon */}
                <div className="mb-5 inline-flex items-center justify-center w-14 h-14 rounded-xl"
                  style={{ background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.15)' }}>
                  {f.icon}
                </div>

                <h3 className="font-bold text-white mb-3" style={{ fontSize: '1.1rem' }}>{f.title}</h3>
                <p style={{ color: 'rgba(255,255,255,0.45)', lineHeight: 1.8, fontSize: '0.9rem' }}>{f.desc}</p>
              </div>
            </AnimateIn>
          ))}
        </div>
      </div>
    </section>
  )
}
