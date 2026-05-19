'use client'

import { useEffect, useRef } from 'react'

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
    }, { threshold: 0.2 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return (
    <div ref={ref} style={{
      opacity: 0,
      transform: 'translateY(28px) scale(0.98)',
      transition: `opacity 0.8s cubic-bezier(0.19,1,0.22,1) ${delay}ms, transform 0.8s cubic-bezier(0.19,1,0.22,1) ${delay}ms`,
    }}>
      {children}
    </div>
  )
}

export function CtaSection() {
  return (
    <section
      dir="rtl"
      style={{
        background: '#060B1A',
        padding: 'clamp(5rem,10vw,8rem) 1.25rem',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background layers */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        {/* Large orange glow center-top */}
        <div style={{
          position: 'absolute', top: '-30%', left: '50%',
          transform: 'translateX(-50%)',
          width: '80vw', height: '80vw',
          maxWidth: 900, maxHeight: 900,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(249,115,22,0.14) 0%, rgba(234,88,12,0.04) 40%, transparent 65%)',
        }} />
        {/* Horizontal glow lines */}
        <div style={{
          position: 'absolute', top: '30%', left: 0, right: 0, height: 1,
          background: 'linear-gradient(90deg, transparent, rgba(249,115,22,0.2), transparent)',
        }} />
        <div style={{
          position: 'absolute', bottom: '30%', left: 0, right: 0, height: 1,
          background: 'linear-gradient(90deg, transparent, rgba(27,58,138,0.25), transparent)',
        }} />
        {/* Grid */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }} />
      </div>

      <div style={{ maxWidth: 880, marginInline: 'auto', position: 'relative', zIndex: 1 }}>
        {/* Inner glass card */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 28,
          padding: 'clamp(2.5rem,6vw,5rem) clamp(1.5rem,5vw,4rem)',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          backdropFilter: 'blur(12px)',
        }}>
          {/* Top orange accent bar */}
          <div style={{
            position: 'absolute', top: 0, left: '20%', right: '20%', height: 2,
            background: 'linear-gradient(90deg, transparent, #F97316, transparent)',
            borderRadius: 99,
          }} />
          {/* Bottom blue accent bar */}
          <div style={{
            position: 'absolute', bottom: 0, left: '30%', right: '30%', height: 1,
            background: 'linear-gradient(90deg, transparent, rgba(96,128,250,0.6), transparent)',
            borderRadius: 99,
          }} />

          <AnimateIn delay={0}>
            {/* Available badge */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              background: 'rgba(16,185,129,0.1)',
              border: '1px solid rgba(16,185,129,0.25)',
              borderRadius: 99, padding: '0.4rem 1rem',
              fontSize: '0.8rem', fontWeight: 600, color: '#6EE7B7',
              marginBottom: '1.75rem',
            }}>
              <span style={{
                width: 7, height: 7, borderRadius: '50%',
                background: '#10B981',
                boxShadow: '0 0 8px rgba(16,185,129,0.8)',
                animation: 'pingCta 1.5s ease infinite',
                flexShrink: 0,
              }} />
              مشاوران ما آماده پاسخگویی هستند
            </div>
          </AnimateIn>

          <AnimateIn delay={150}>
            <h2 style={{
              fontSize: 'clamp(2rem,5vw,3.5rem)',
              fontWeight: 900, color: '#FFFFFF',
              lineHeight: 1.2,
              margin: '0 0 1.25rem',
            }}>
              امنیت اماکنتان را
              <br />
              <span style={{
                background: 'linear-gradient(90deg, #FDE68A 0%, #FB923C 40%, #EA580C 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                به بیواز بسپارید
              </span>
            </h2>
          </AnimateIn>

          <AnimateIn delay={250}>
            <p style={{
              color: 'rgba(255,255,255,0.55)',
              fontSize: 'clamp(0.9375rem,2vw,1.125rem)',
              lineHeight: 1.8,
              margin: '0 0 2.5rem',
              maxWidth: 520, marginInline: 'auto',
            }}>
              همین امروز با تیم بیواز تماس بگیرید.
              مشاوره رایگان، بازدید رایگان، و نصب تخصصی توسط کارشناسان ما.
            </p>
          </AnimateIn>

          <AnimateIn delay={350}>
            {/* CTA buttons */}
            <div style={{
              display: 'flex', gap: '1rem', flexWrap: 'wrap',
              justifyContent: 'center', marginBottom: '2.5rem',
            }}>
              <a
                href="tel:+982100000000"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.75rem',
                  padding: '1rem 2.5rem',
                  background: 'linear-gradient(135deg, #F97316, #EA580C)',
                  color: '#fff', fontWeight: 700, fontSize: '1.0625rem',
                  borderRadius: 14, textDecoration: 'none',
                  boxShadow: '0 6px 32px rgba(249,115,22,0.5)',
                  transition: 'all 0.25s ease',
                  animation: 'ctaPulse 3s ease-in-out 2s infinite',
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLAnchorElement
                  el.style.transform = 'translateY(-3px) scale(1.02)'
                  el.style.boxShadow = '0 12px 48px rgba(249,115,22,0.65)'
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLAnchorElement
                  el.style.transform = 'translateY(0) scale(1)'
                  el.style.boxShadow = '0 6px 32px rgba(249,115,22,0.5)'
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" style={{ width: 22, height: 22 }}>
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 014.72 12 19.79 19.79 0 011.65 3.33 2 2 0 013.62 1.2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L7.91 8.85a16 16 0 006.29 6.29l.61-.61a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                تماس رایگان — همین الان
              </a>
              <a
                href="https://wa.me/989100000000"
                target="_blank" rel="noopener noreferrer"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.75rem',
                  padding: '1rem 2rem',
                  background: 'rgba(37,211,102,0.1)',
                  border: '1.5px solid rgba(37,211,102,0.3)',
                  color: '#4ADE80', fontWeight: 600, fontSize: '1rem',
                  borderRadius: 14, textDecoration: 'none',
                  transition: 'all 0.25s ease',
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLAnchorElement
                  el.style.background = 'rgba(37,211,102,0.18)'
                  el.style.transform = 'translateY(-2px)'
                  el.style.boxShadow = '0 8px 24px rgba(37,211,102,0.2)'
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLAnchorElement
                  el.style.background = 'rgba(37,211,102,0.1)'
                  el.style.transform = 'translateY(0)'
                  el.style.boxShadow = 'none'
                }}
              >
                <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 20, height: 20 }}>
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                  <path d="M11.999 0C5.373 0 0 5.373 0 12c0 2.117.554 4.107 1.524 5.827L.057 23.882l6.232-1.455A11.926 11.926 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.846 0-3.576-.49-5.072-1.345l-.363-.214-3.699.865.894-3.612-.236-.375A9.967 9.967 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
                </svg>
                واتساپ
              </a>
            </div>
          </AnimateIn>

          <AnimateIn delay={450}>
            {/* Trust items */}
            <div style={{
              display: 'flex', flexWrap: 'wrap', gap: '1rem',
              justifyContent: 'center',
            }}>
              {[
                { icon: '🛡️', text: 'گارانتی ۱۸ ماهه' },
                { icon: '⚡', text: 'نصب در ۲ ساعت' },
                { icon: '📞', text: 'پشتیبانی ۲۴/۷' },
                { icon: '🚚', text: 'ارسال رایگان' },
              ].map((item, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: '0.4rem',
                  color: 'rgba(255,255,255,0.55)',
                  fontSize: '0.875rem', fontWeight: 500,
                }}>
                  <span>{item.icon}</span>
                  {item.text}
                </div>
              ))}
            </div>
          </AnimateIn>
        </div>
      </div>

      <style>{`
        @keyframes pingCta {
          0%,100% { transform: scale(1); opacity: 1; }
          50%      { transform: scale(1.6); opacity: 0.5; }
        }
        @keyframes ctaPulse {
          0%,100% { box-shadow: 0 6px 32px rgba(249,115,22,0.5); }
          50%      { box-shadow: 0 6px 32px rgba(249,115,22,0.5), 0 0 0 8px rgba(249,115,22,0); }
        }
      `}</style>
    </section>
  )
}
