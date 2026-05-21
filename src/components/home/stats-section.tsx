'use client'

import { useEffect, useRef, useState } from 'react'

const STATS = [
  {
    value: 5000, suffix: '+',
    label: 'مشتری راضی',
    sub: 'در سراسر ایران',
    color: '#F97316',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" style={{ width: 28, height: 28 }}>
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    value: 10, suffix: '+',
    label: 'سال تجربه',
    sub: 'در امنیت الکترونیک',
    color: '#6080FA',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" style={{ width: 28, height: 28 }}>
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
          stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    value: 98, suffix: '٪',
    label: 'رضایت مشتریان',
    sub: 'بر اساس نظرسنجی',
    color: '#10B981',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" style={{ width: 28, height: 28 }}>
        <path d="M22 11.08V12a10 10 0 11-5.93-9.14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M22 4L12 14.01l-3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    value: 50, suffix: '+',
    label: 'محصول تخصصی',
    sub: 'دزدگیر، حسگر، سیرن',
    color: '#FBBF24',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" style={{ width: 28, height: 28 }}>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
]

function Counter({ target, suffix, color, active }: {
  target: number; suffix: string; color: string; active: boolean
}) {
  const [count, setCount] = useState(0)
  const startedRef = useRef(false)

  useEffect(() => {
    if (!active || startedRef.current) return
    startedRef.current = true
    const duration = 1800
    const steps = 60
    const step = duration / steps
    let current = 0
    const inc = target / steps
    const timer = setInterval(() => {
      current = Math.min(current + inc, target)
      setCount(Math.round(current))
      if (current >= target) clearInterval(timer)
    }, step)
    return () => clearInterval(timer)
  }, [active, target])

  const display = count.toLocaleString('fa-IR')

  return (
    <span style={{
      fontSize: 'clamp(3rem,7vw,4.5rem)',
      fontWeight: 900,
      lineHeight: 1,
      background: `linear-gradient(135deg, ${color}, ${color}aa)`,
      backgroundClip: 'text',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      fontVariantNumeric: 'tabular-nums',
    }}>
      {display}{suffix}
    </span>
  )
}

function StatCard({ stat, index }: { stat: typeof STATS[0]; index: number }) {
  const [active, setActive] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver((entries) => {
      const e = entries[0]; if (!e) return
      if (e.isIntersecting) {
        setActive(true)
        el.style.opacity = '1'
        el.style.transform = 'translateY(0) scale(1)'
        obs.disconnect()
      }
    }, { threshold: 0.3 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      style={{
        opacity: 0,
        transform: 'translateY(36px) scale(0.95)',
        transition: `opacity 0.7s cubic-bezier(0.19,1,0.22,1) ${index * 120}ms,
                     transform 0.7s cubic-bezier(0.19,1,0.22,1) ${index * 120}ms`,
        background: 'rgba(255,255,255,0.03)',
        border: `1px solid rgba(255,255,255,0.07)`,
        borderRadius: 24,
        padding: '2.5rem 2rem',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'default',
        transition: 'all 0.3s ease',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget
        el.style.borderColor = `${stat.color}40`
        el.style.boxShadow = `0 24px 80px rgba(0,0,0,0.5), 0 0 0 1px ${stat.color}20, inset 0 1px 0 rgba(255,255,255,0.06)`
        el.style.transform = 'translateY(-4px)'
      }}
      onMouseLeave={e => {
        const el = e.currentTarget
        el.style.borderColor = 'rgba(255,255,255,0.07)'
        el.style.boxShadow = 'none'
        el.style.transform = 'translateY(0)'
      }}
    >
      {/* Glow behind */}
      <div style={{
        position: 'absolute', top: -40, left: '50%',
        transform: 'translateX(-50%)',
        width: 180, height: 180,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${stat.color}15, transparent 70%)`,
        pointerEvents: 'none',
      }} />

      {/* Icon */}
      <div style={{
        width: 56, height: 56,
        borderRadius: 14,
        background: `rgba(255,255,255,0.04)`,
        border: `1px solid ${stat.color}30`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginInline: 'auto',
        marginBottom: '1.25rem',
        color: stat.color,
        boxShadow: `0 0 20px ${stat.color}20`,
      }}>
        {stat.icon}
      </div>

      <Counter target={stat.value} suffix={stat.suffix} color={stat.color} active={active} />

      <div style={{
        color: '#FFFFFF', fontWeight: 700,
        fontSize: '1.1rem', marginTop: '0.75rem',
      }}>
        {stat.label}
      </div>
      <div style={{
        color: 'rgba(255,255,255,0.4)',
        fontSize: '0.8125rem', marginTop: '0.25rem',
      }}>
        {stat.sub}
      </div>

      {/* Bottom accent line */}
      <div style={{
        position: 'absolute', bottom: 0, left: '15%', right: '15%', height: 2,
        background: `linear-gradient(90deg, transparent, ${stat.color}60, transparent)`,
        borderRadius: 99,
      }} />
    </div>
  )
}

export function StatsSection() {
  return (
    <section
      dir="rtl"
      style={{
        background: 'linear-gradient(180deg, #060B1A 0%, #070D1F 100%)',
        padding: 'clamp(4rem,8vw,7rem) 1.25rem',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* center orange glow */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%,-50%)',
        width: '70vw', height: '40vh',
        background: 'radial-gradient(ellipse, rgba(249,115,22,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: 1100, marginInline: 'auto', position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 'clamp(2.5rem,5vw,4rem)' }}>
          <h2 style={{
            fontSize: 'clamp(1.75rem,4.5vw,3rem)',
            fontWeight: 900, color: '#FFFFFF',
            margin: '0 0 0.75rem',
          }}>
            بیواز در{' '}
            <span style={{
              background: 'linear-gradient(90deg, #FDE68A, #F97316)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              اعداد
            </span>
            {' '}صحبت می‌کند
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '1rem', margin: 0 }}>
            سال‌ها تجربه، هزاران مشتری راضی، اعداد واقعی
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%,220px), 1fr))',
          gap: '1.25rem',
        }}>
          {STATS.map((s, i) => <StatCard key={i} stat={s} index={i} />)}
        </div>
      </div>
    </section>
  )
}
