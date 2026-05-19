'use client'

import { useEffect, useRef } from 'react'

const STEPS = [
  {
    num: '۱',
    title: 'تماس و مشاوره رایگان',
    desc: 'با کارشناس بیواز تماس بگیرید. نیازها، ابعاد محیط و بودجه شما را بررسی می‌کنیم.',
    color: '#F97316',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" style={{ width: 32, height: 32 }}>
        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 014.72 12 19.79 19.79 0 011.65 3.33 2 2 0 013.62 1.2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L7.91 8.85a16 16 0 006.29 6.29l.61-.61a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    num: '۲',
    title: 'بازدید و طراحی سیستم',
    desc: 'کارشناس ما از محل بازدید می‌کند و بهترین پلن امنیتی را برای شما طراحی می‌نماید.',
    color: '#6080FA',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" style={{ width: 32, height: 32 }}>
        <path d="M9 11l3 3L22 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    num: '۳',
    title: 'نصب حرفه‌ای در ۲ ساعت',
    desc: 'تیم نصب متخصص بیواز در کمتر از ۲ ساعت سیستم را نصب، تنظیم و آزمایش می‌کند.',
    color: '#10B981',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" style={{ width: 32, height: 32 }}>
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
        <path d="M19.07 4.93l-1.41 1.41M5.34 18.66l-1.41 1.41M21 12h-2M5 12H3M19.07 19.07l-1.41-1.41M5.34 5.34L3.93 3.93M12 21v-2M12 5V3"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    num: '۴',
    title: 'تحویل و پشتیبانی دائمی',
    desc: 'سیستم تحویل داده می‌شود. آموزش اپلیکیشن، گارانتی ۱۸ ماهه و پشتیبانی ۲۴/۷.',
    color: '#FBBF24',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" style={{ width: 32, height: 32 }}>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
]

function StepCard({ step, index, total }: { step: typeof STEPS[0]; index: number; total: number }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        el.style.opacity = '1'
        el.style.transform = 'translateY(0)'
        obs.disconnect()
      }
    }, { threshold: 0.2 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      style={{
        opacity: 0,
        transform: 'translateY(40px)',
        transition: `opacity 0.7s cubic-bezier(0.19,1,0.22,1) ${index * 150}ms,
                     transform 0.7s cubic-bezier(0.19,1,0.22,1) ${index * 150}ms`,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        flex: 1,
        minWidth: 0,
      }}
    >
      {/* Connector line (desktop) */}
      {index < total - 1 && (
        <div style={{
          position: 'absolute',
          top: 36,
          insetInlineEnd: '-50%',
          width: '100%',
          height: 1,
          background: `linear-gradient(90deg, ${step.color}50, ${STEPS[index+1].color}50)`,
          display: 'none',
          zIndex: 0,
        }}
        className="step-connector"
        />
      )}

      {/* Step circle */}
      <div style={{
        position: 'relative', zIndex: 1,
        width: 72, height: 72,
        borderRadius: '50%',
        background: `linear-gradient(135deg, ${step.color}20, ${step.color}08)`,
        border: `2px solid ${step.color}50`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: step.color,
        marginBottom: '1.5rem',
        boxShadow: `0 0 30px ${step.color}20, 0 0 60px ${step.color}08`,
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLDivElement
        el.style.transform = 'scale(1.1)'
        el.style.boxShadow = `0 0 40px ${step.color}40, 0 0 80px ${step.color}15`
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLDivElement
        el.style.transform = 'scale(1)'
        el.style.boxShadow = `0 0 30px ${step.color}20, 0 0 60px ${step.color}08`
      }}
      >
        {step.icon}
        {/* Step number badge */}
        <div style={{
          position: 'absolute',
          top: -8, insetInlineStart: -8,
          width: 24, height: 24,
          borderRadius: '50%',
          background: step.color,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.7rem', fontWeight: 800, color: '#fff',
          boxShadow: `0 2px 8px ${step.color}60`,
        }}>
          {step.num}
        </div>
      </div>

      <h3 style={{
        color: '#FFFFFF',
        fontSize: '1rem', fontWeight: 700,
        marginBottom: '0.6rem', margin: '0 0 0.6rem',
        lineHeight: 1.4,
      }}>
        {step.title}
      </h3>
      <p style={{
        color: 'rgba(255,255,255,0.5)',
        fontSize: '0.875rem', lineHeight: 1.7,
        margin: 0,
        maxWidth: 220,
      }}>
        {step.desc}
      </p>
    </div>
  )
}

export function HowItWorks() {
  return (
    <section
      dir="rtl"
      style={{
        background: 'linear-gradient(180deg, #060B1A 0%, #090F24 50%, #060B1A 100%)',
        padding: 'clamp(5rem,10vw,8rem) 1.25rem',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* bg deco */}
      <div style={{
        position: 'absolute', bottom: 0, left: '50%',
        transform: 'translateX(-50%)',
        width: '100vw', height: '50%',
        background: 'radial-gradient(ellipse, rgba(27,58,138,0.1) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: 1100, marginInline: 'auto', position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 'clamp(3rem,6vw,5rem)' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            background: 'rgba(96,128,250,0.1)',
            border: '1px solid rgba(96,128,250,0.25)',
            borderRadius: 99, padding: '0.4rem 1.2rem',
            fontSize: '0.8125rem', fontWeight: 600,
            color: '#93AAFD',
            marginBottom: '1.25rem',
          }}>
            فرآیند کار
          </div>
          <h2 style={{
            fontSize: 'clamp(1.75rem,4.5vw,3rem)',
            fontWeight: 900, color: '#FFFFFF',
            margin: '0 0 1rem',
          }}>
            از تماس تا{' '}
            <span style={{
              background: 'linear-gradient(90deg, #6080FA, #A78BFA)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              امنیت کامل
            </span>
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '1rem', margin: 0 }}>
            در ۴ مرحله ساده، امنیت اماکن شما را تضمین می‌کنیم
          </p>
        </div>

        {/* Steps grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%,220px), 1fr))',
          gap: '2.5rem 1rem',
          position: 'relative',
        }}>
          {/* Connecting line behind steps on desktop */}
          <div style={{
            position: 'absolute',
            top: 36,
            right: '12%',
            left: '12%',
            height: 1,
            background: 'linear-gradient(90deg, rgba(249,115,22,0.3), rgba(96,128,250,0.3), rgba(16,185,129,0.3), rgba(251,191,36,0.3))',
            zIndex: 0,
          }} />

          {STEPS.map((s, i) => (
            <StepCard key={i} step={s} index={i} total={STEPS.length} />
          ))}
        </div>

        {/* CTA */}
        <div style={{ textAlign: 'center', marginTop: 'clamp(3rem,6vw,5rem)' }}>
          <a
            href="tel:+982100000000"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.75rem',
              padding: '1rem 2.5rem',
              background: 'linear-gradient(135deg, #1B3A8A, #3B5CEF)',
              color: '#fff', fontWeight: 700, fontSize: '1.0625rem',
              borderRadius: 14,
              textDecoration: 'none',
              border: '1px solid rgba(96,128,250,0.3)',
              boxShadow: '0 8px 32px rgba(27,58,138,0.4)',
              transition: 'all 0.25s ease',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLAnchorElement
              el.style.transform = 'translateY(-3px)'
              el.style.boxShadow = '0 16px 48px rgba(27,58,138,0.6)'
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLAnchorElement
              el.style.transform = 'translateY(0)'
              el.style.boxShadow = '0 8px 32px rgba(27,58,138,0.4)'
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" style={{ width: 20, height: 20 }}>
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 014.72 12 19.79 19.79 0 011.65 3.33 2 2 0 013.62 1.2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L7.91 8.85a16 16 0 006.29 6.29l.61-.61a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            همین الان شروع کنید
          </a>
        </div>
      </div>
    </section>
  )
}
