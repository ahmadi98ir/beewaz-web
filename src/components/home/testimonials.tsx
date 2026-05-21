'use client'

import { useEffect, useRef, useState } from 'react'

const TESTIMONIALS = [
  {
    name: 'علیرضا رضایی',
    role: 'مدیر فروشگاه',
    location: 'تهران',
    stars: 5,
    initials: 'ع.ر',
    color: '#1B3A8A',
    text: 'سیستم دزدگیر بیواز رو برای فروشگاهم نصب کردم. نصب سریع، کیفیت عالی. از وقتی نصب شده یه بار هم نگران امنیت نبودم. کاملاً راضیم.',
  },
  {
    name: 'فاطمه احمدی',
    role: 'صاحب منزل',
    location: 'اصفهان',
    stars: 5,
    initials: 'ف.ا',
    color: '#9A3412',
    text: 'با اپلیکیشن موبایل هر وقت از خونه دور می‌شم، وضعیت سیستم رو چک می‌کنم. خیالم راحته. پشتیبانی بیواز هم خیلی خوب جواب میده.',
  },
  {
    name: 'محمدحسین موسوی',
    role: 'مدیر دفتر',
    location: 'مشهد',
    stars: 5,
    initials: 'م.م',
    color: '#065F46',
    text: 'برای دفتر کارمون سه تا سیستم از بیواز گرفتیم. قیمت مناسب، کیفیت عالی، و تیم نصب حرفه‌ای. قطعاً به همه توصیه می‌کنم.',
  },
  {
    name: 'سارا کریمی',
    role: 'کارآفرین',
    location: 'شیراز',
    stars: 5,
    initials: 'س.ک',
    color: '#7C3AED',
    text: 'از زمانی که سیستم بیواز داریم، یه بار هشدار داد و به موقع از ورود غیرمجاز جلوگیری شد. واقعاً ارزشش رو داره.',
  },
]

function StarRating({ count }: { count: number }) {
  return (
    <div style={{ display: 'flex', gap: 3 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} viewBox="0 0 16 16" fill="none" style={{ width: 16, height: 16 }}>
          <path
            d="M8 1l1.854 3.756L14 5.572l-3 2.924.708 4.129L8 10.573l-3.708 2.052.708-4.129L2 5.572l4.146-.816L8 1z"
            fill={i < count ? '#FBBF24' : 'rgba(255,255,255,0.1)'}
            stroke={i < count ? '#FBBF24' : 'rgba(255,255,255,0.1)'}
            strokeWidth="0.5"
          />
        </svg>
      ))}
    </div>
  )
}

export function Testimonials() {
  const [active, setActive] = useState(0)
  const [animating, setAnimating] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const obs = new IntersectionObserver((entries) => {
      const e = entries[0]; if (!e) return
      if (e.isIntersecting) { setVisible(true); obs.disconnect() }
    }, { threshold: 0.15 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  // Auto-rotate
  useEffect(() => {
    if (!visible) return
    const t = setInterval(() => {
      setAnimating(true)
      setTimeout(() => {
        setActive(a => (a + 1) % TESTIMONIALS.length)
        setAnimating(false)
      }, 300)
    }, 5000)
    return () => clearInterval(t)
  }, [visible])

  const goTo = (i: number) => {
    if (i === active) return
    setAnimating(true)
    setTimeout(() => { setActive(i); setAnimating(false) }, 250)
  }

  const t = TESTIMONIALS[active]

  return (
    <section
      dir="rtl"
      ref={containerRef}
      style={{
        background: 'linear-gradient(180deg, #060B1A 0%, #080E22 100%)',
        padding: 'clamp(5rem,10vw,8rem) 1.25rem',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* bg glow */}
      <div style={{
        position: 'absolute', top: '50%', right: '5%',
        transform: 'translateY(-50%)',
        width: '40vw', height: '40vw',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(249,115,22,0.07) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{
        maxWidth: 1100, marginInline: 'auto',
        position: 'relative', zIndex: 1,
      }}>
        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: 'clamp(3rem,6vw,5rem)',
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(28px)',
          transition: 'opacity 0.7s ease, transform 0.7s ease',
        }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            background: 'rgba(251,191,36,0.1)',
            border: '1px solid rgba(251,191,36,0.25)',
            borderRadius: 99, padding: '0.4rem 1.2rem',
            fontSize: '0.8125rem', fontWeight: 600, color: '#FCD34D',
            marginBottom: '1.25rem',
          }}>
            <svg viewBox="0 0 16 16" fill="#FBBF24" style={{ width: 14, height: 14 }}>
              <path d="M8 1l1.854 3.756L14 5.572l-3 2.924.708 4.129L8 10.573l-3.708 2.052.708-4.129L2 5.572l4.146-.816L8 1z"/>
            </svg>
            نظر مشتریان
          </div>
          <h2 style={{
            fontSize: 'clamp(1.75rem,4.5vw,3rem)',
            fontWeight: 900, color: '#FFFFFF',
            margin: '0 0 0.75rem',
          }}>
            مشتریان درباره{' '}
            <span style={{
              background: 'linear-gradient(90deg, #FDE68A, #F97316)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              بیواز
            </span>
            {' '}می‌گویند
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '1rem', margin: 0 }}>
            تجربه واقعی مشتریان ما در سراسر ایران
          </p>
        </div>

        {/* Main testimonial card + side cards layout */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%,260px), 1fr))',
          gap: '1.25rem',
          alignItems: 'start',
        }}>
          {TESTIMONIALS.map((item, i) => (
            <div
              key={i}
              onClick={() => goTo(i)}
              style={{
                background: i === active
                  ? 'rgba(255,255,255,0.06)'
                  : 'rgba(255,255,255,0.025)',
                border: `1px solid ${i === active ? `${item.color}40` : 'rgba(255,255,255,0.06)'}`,
                borderRadius: 20,
                padding: '1.75rem',
                cursor: 'pointer',
                transition: 'all 0.35s cubic-bezier(0.19,1,0.22,1)',
                transform: i === active ? 'scale(1.02)' : 'scale(1)',
                boxShadow: i === active
                  ? `0 20px 60px rgba(0,0,0,0.4), 0 0 0 1px ${item.color}20`
                  : 'none',
                opacity: visible ? 1 : 0,
              }}
            >
              {/* Quote mark */}
              <div style={{
                fontSize: '3rem', lineHeight: 1,
                color: i === active ? item.color : 'rgba(255,255,255,0.1)',
                marginBottom: '0.75rem',
                transition: 'color 0.3s ease',
                fontFamily: 'serif',
              }}>
                "
              </div>

              {/* Stars */}
              <div style={{ marginBottom: '0.75rem' }}>
                <StarRating count={item.stars} />
              </div>

              {/* Text */}
              <p style={{
                color: i === active ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.4)',
                fontSize: '0.9rem', lineHeight: 1.8,
                margin: '0 0 1.25rem',
                transition: 'color 0.3s ease',
              }}>
                {item.text}
              </p>

              {/* Author */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: 44, height: 44,
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${item.color}, ${item.color}88)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.75rem', fontWeight: 700, color: '#fff',
                  flexShrink: 0,
                  boxShadow: i === active ? `0 0 16px ${item.color}50` : 'none',
                  transition: 'box-shadow 0.3s ease',
                }}>
                  {item.initials}
                </div>
                <div>
                  <div style={{
                    color: '#FFFFFF', fontWeight: 700,
                    fontSize: '0.9rem',
                  }}>
                    {item.name}
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.775rem' }}>
                    {item.role} — {item.location}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation dots */}
        <div style={{
          display: 'flex', gap: '0.5rem',
          justifyContent: 'center',
          marginTop: '2.5rem',
        }}>
          {TESTIMONIALS.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              style={{
                width: i === active ? 28 : 8,
                height: 8,
                borderRadius: 99,
                background: i === active ? '#F97316' : 'rgba(255,255,255,0.2)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.35s cubic-bezier(0.19,1,0.22,1)',
                padding: 0,
              }}
            />
          ))}
        </div>

        {/* Bottom trust bar */}
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: '2rem',
          justifyContent: 'center',
          marginTop: '3rem',
          padding: '1.75rem',
          background: 'rgba(255,255,255,0.025)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 16,
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(20px)',
          transition: 'opacity 0.7s 0.5s ease, transform 0.7s 0.5s ease',
        }}>
          {[
            { val: '۵۰۰۰+', label: 'مشتری' },
            { val: '۴.۹/۵', label: 'امتیاز' },
            { val: '۱۰+', label: 'سال' },
            { val: '۹۸٪', label: 'رضایت' },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '1.5rem', fontWeight: 800,
                background: 'linear-gradient(135deg, #FDE68A, #F97316)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                {s.val}
              </div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8125rem' }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
