'use client'

import { useEffect, useRef } from 'react'

const FEATURES = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" style={{ width: 32, height: 32 }}>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
          fill="rgba(249,115,22,0.12)" stroke="#F97316" strokeWidth="1.8"
          strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9 12l2 2 4-4" stroke="#F97316" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'محافظت ۲۴ ساعته',
    desc: 'سیستم‌های بیواز هرگز نمی‌خوابند. شبانه‌روز از امنیت اماکن شما حراست می‌کنیم — بدون هیچ وقفه‌ای.',
    color: '#F97316',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" style={{ width: 32, height: 32 }}>
        <rect x="5" y="2" width="14" height="20" rx="2" ry="2"
          fill="rgba(96,128,250,0.12)" stroke="#6080FA" strokeWidth="1.8"/>
        <path d="M12 18h.01M8.5 7h7M8.5 11h4" stroke="#6080FA" strokeWidth="2"
          strokeLinecap="round"/>
      </svg>
    ),
    title: 'کنترل از راه دور',
    desc: 'با اپلیکیشن موبایل بیواز، وضعیت سیستم امنیتی خود را از هر کجای دنیا کنترل کنید.',
    color: '#6080FA',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" style={{ width: 32, height: 32 }}>
        <circle cx="12" cy="12" r="10"
          fill="rgba(16,185,129,0.1)" stroke="#10B981" strokeWidth="1.8"/>
        <path d="M12 6v6l4 2" stroke="#10B981" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'نصب سریع و تخصصی',
    desc: 'تیم متخصص ما در کمتر از ۲ ساعت سیستم امنیتی را نصب، راه‌اندازی و آزمایش می‌کند.',
    color: '#10B981',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" style={{ width: 32, height: 32 }}>
        <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"
          fill="rgba(251,146,60,0.12)" stroke="#FB923C" strokeWidth="1.8"
          strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'هشدار آنی و فوری',
    desc: 'در کمتر از ۳ ثانیه از هر رویداد امنیتی باخبر می‌شوید — پیامک، اپلیکیشن، و تماس خودکار.',
    color: '#FB923C',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" style={{ width: 32, height: 32 }}>
        <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 002 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"
          fill="rgba(167,139,250,0.12)" stroke="#A78BFA" strokeWidth="1.8"/>
        <path d="M16 10l-4 4-4-4" stroke="#A78BFA" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'پشتیبانی ۲۴/۷',
    desc: 'تیم پشتیبانی بیواز در تمام ساعات شبانه‌روز، حتی در تعطیلات رسمی، آماده پاسخگویی است.',
    color: '#A78BFA',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" style={{ width: 32, height: 32 }}>
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
          fill="rgba(251,191,36,0.12)" stroke="#FBBF24" strokeWidth="1.8"
          strokeLinejoin="round"/>
      </svg>
    ),
    title: 'گارانتی ۱۸ ماهه',
    desc: 'تمام محصولات بیواز با گارانتی رسمی ۱۸ ماهه و خدمات پس از فروش معتبر ارائه می‌شوند.',
    color: '#FBBF24',
  },
]

function FeatureCard({ feature, index }: { feature: typeof FEATURES[0]; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const card = cardRef.current
    if (!card) return

    const handleMouseMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const cx = rect.width / 2
      const cy = rect.height / 2
      const rotX = ((y - cy) / cy) * -8
      const rotY = ((x - cx) / cx) * 8
      card.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-6px)`
    }
    const handleMouseLeave = () => {
      card.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) translateY(0px)'
    }

    card.addEventListener('mousemove', handleMouseMove)
    card.addEventListener('mouseleave', handleMouseLeave)
    return () => {
      card.removeEventListener('mousemove', handleMouseMove)
      card.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [])

  return (
    <div
      ref={cardRef}
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: `1px solid rgba(255,255,255,0.07)`,
        borderRadius: 20,
        padding: '2rem 1.75rem',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'default',
        transition: 'transform 0.15s ease, box-shadow 0.3s ease, border-color 0.3s ease',
        willChange: 'transform',
        animationDelay: `${index * 0.1}s`,
      }}
      onMouseEnter={e => {
        const el = e.currentTarget
        el.style.borderColor = `${feature.color}40`
        el.style.boxShadow = `0 20px 60px rgba(0,0,0,0.4), 0 0 0 1px ${feature.color}20, inset 0 1px 0 rgba(255,255,255,0.08)`
      }}
      onMouseLeave={e => {
        const el = e.currentTarget
        el.style.borderColor = 'rgba(255,255,255,0.07)'
        el.style.boxShadow = 'none'
      }}
    >
      {/* Top glow line */}
      <div style={{
        position: 'absolute', top: 0, left: '10%', right: '10%', height: 1,
        background: `linear-gradient(90deg, transparent, ${feature.color}60, transparent)`,
        transition: 'opacity 0.3s ease',
      }} />

      {/* Icon container */}
      <div style={{
        width: 64, height: 64,
        borderRadius: 16,
        background: `linear-gradient(135deg, ${feature.color}15, ${feature.color}05)`,
        border: `1px solid ${feature.color}25`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: '1.25rem',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      }}>
        {feature.icon}
      </div>

      <h3 style={{
        color: '#FFFFFF',
        fontSize: '1.1rem', fontWeight: 700,
        marginBottom: '0.6rem',
        margin: '0 0 0.6rem',
      }}>
        {feature.title}
      </h3>
      <p style={{
        color: 'rgba(255,255,255,0.55)',
        fontSize: '0.9rem', lineHeight: 1.8,
        margin: 0,
      }}>
        {feature.desc}
      </p>

      {/* Bottom right accent */}
      <div style={{
        position: 'absolute', bottom: -20, insetInlineEnd: -20,
        width: 80, height: 80,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${feature.color}08, transparent 70%)`,
        pointerEvents: 'none',
      }} />
    </div>
  )
}

function AnimateIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        el.style.opacity = '1'
        el.style.transform = 'translateY(0) scale(1)'
        obs.disconnect()
      }
    }, { threshold: 0.12 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return (
    <div ref={ref} style={{
      opacity: 0,
      transform: 'translateY(32px) scale(0.97)',
      transition: `opacity 0.7s cubic-bezier(0.19,1,0.22,1) ${delay}ms, transform 0.7s cubic-bezier(0.19,1,0.22,1) ${delay}ms`,
    }}>
      {children}
    </div>
  )
}

export function WhyBeewaz() {
  return (
    <section
      dir="rtl"
      style={{
        background: 'linear-gradient(180deg, #060B1A 0%, #080E22 50%, #060B1A 100%)',
        padding: 'clamp(5rem,10vw,8rem) 1.25rem',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background decoration */}
      <div style={{
        position: 'absolute', top: '20%', left: '50%',
        transform: 'translateX(-50%)',
        width: '80vw', height: '60vh',
        background: 'radial-gradient(ellipse, rgba(27,58,138,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        backgroundImage: `linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)`,
        backgroundSize: '50px 50px',
        inset: 0,
        pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: 1200, marginInline: 'auto', position: 'relative', zIndex: 1 }}>
        {/* Section header */}
        <AnimateIn delay={0}>
          <div style={{ textAlign: 'center', marginBottom: 'clamp(3rem,6vw,5rem)' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              background: 'rgba(249,115,22,0.1)',
              border: '1px solid rgba(249,115,22,0.25)',
              borderRadius: 99, padding: '0.4rem 1.2rem',
              fontSize: '0.8125rem', fontWeight: 600,
              color: '#FB923C',
              marginBottom: '1.25rem',
            }}>
              <svg viewBox="0 0 16 16" fill="none" style={{ width: 14, height: 14 }}>
                <path d="M8 1l2.06 4.18 4.61.67-3.34 3.25.79 4.6L8 11.25l-4.12 2.45.79-4.6L1.33 5.85l4.61-.67L8 1z"
                  fill="#F97316"/>
              </svg>
              چرا بیواز؟
            </div>
            <h2 style={{
              fontSize: 'clamp(2rem,5vw,3.2rem)',
              fontWeight: 900, color: '#FFFFFF',
              lineHeight: 1.25,
              marginBottom: '1rem',
              margin: '0 0 1rem',
            }}>
              ویژگی‌هایی که ما را
              <span style={{
                display: 'block',
                background: 'linear-gradient(90deg, #FDE68A, #F97316, #EA580C)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                متمایز می‌کنند
              </span>
            </h2>
            <p style={{
              color: 'rgba(255,255,255,0.5)',
              fontSize: '1.0625rem', lineHeight: 1.8,
              maxWidth: 560, marginInline: 'auto',
              margin: '0 auto',
            }}>
              بیواز با بیش از یک دهه تجربه در امنیت الکترونیک، راهکارهای هوشمند
              محافظت از اماکن را با کیفیت بی‌نظیر ارائه می‌دهد
            </p>
          </div>
        </AnimateIn>

        {/* Feature grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%,320px), 1fr))',
          gap: '1.25rem',
        }}>
          {FEATURES.map((f, i) => (
            <AnimateIn key={i} delay={i * 90}>
              <FeatureCard feature={f} index={i} />
            </AnimateIn>
          ))}
        </div>
      </div>
    </section>
  )
}
