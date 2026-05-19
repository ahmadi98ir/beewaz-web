'use client'

import { useEffect, useRef, useState } from 'react'

const STATS = [
  {
    value: 10, suffix: '+',
    label: 'سال تجربه',
    sub: 'در امنیت الکترونیک',
    iconPath: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
  },
  {
    value: 5000, suffix: '+',
    label: 'مشتری راضی',
    sub: 'در سراسر ایران',
    iconPath: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 100 8 4 4 0 000-8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75',
  },
  {
    value: 50, suffix: '+',
    label: 'محصول تخصصی',
    sub: 'دزدگیر، حسگر، سیرن',
    iconPath: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10zM9 12l2 2 4-4',
  },
  {
    value: 18, suffix: ' ماه',
    label: 'گارانتی',
    sub: 'تعویض کامل محصول',
    iconPath: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
  },
]

function useCounter(target: number, duration = 1800) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const started = useRef(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => {
      if (e?.isIntersecting && !started.current) {
        started.current = true
        const steps = 60
        const inc = target / steps
        let cur = 0
        const t = setInterval(() => {
          cur = Math.min(cur + inc, target)
          setCount(Math.floor(cur))
          if (cur >= target) clearInterval(t)
        }, duration / steps)
      }
    }, { threshold: 0.4 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [target, duration])
  return { count, ref }
}

function StatCard({ stat, index }: { stat: typeof STATS[0]; index: number }) {
  const { count, ref } = useCounter(stat.value)
  const displayed = count.toLocaleString('fa-IR') + stat.suffix
  return (
    <div ref={ref}
      className="group relative flex flex-col items-center text-center p-7 rounded-2xl transition-all duration-400 cursor-default"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(249,115,22,0.1)', backdropFilter: 'blur(8px)' }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLDivElement
        el.style.background = 'rgba(249,115,22,0.07)'
        el.style.borderColor = 'rgba(249,115,22,0.3)'
        el.style.transform = 'translateY(-6px)'
        el.style.boxShadow = '0 20px 40px rgba(0,0,0,0.3),0 0 30px rgba(249,115,22,0.1)'
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLDivElement
        el.style.background = 'rgba(255,255,255,0.03)'
        el.style.borderColor = 'rgba(249,115,22,0.1)'
        el.style.transform = 'translateY(0)'
        el.style.boxShadow = 'none'
      }}>
      <div className="absolute top-0 left-1/4 right-1/4 h-px opacity-50"
        style={{ background: 'linear-gradient(90deg,transparent,rgba(249,115,22,0.5),transparent)' }} />
      <div className="mb-5 w-14 h-14 rounded-xl flex items-center justify-center"
        style={{ background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.15)' }}>
        <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7">
          <path d={stat.iconPath} fill="rgba(249,115,22,0.15)" stroke="#F97316" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <div className="font-black mb-1 tabular-nums" style={{
        fontSize: 'clamp(2.25rem,4vw,3rem)', lineHeight: 1,
        background: 'linear-gradient(135deg,#FDE68A,#F97316)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
      }}>
        {displayed}
      </div>
      <div className="font-bold text-white mb-1" style={{ fontSize: '1rem' }}>{stat.label}</div>
      <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.8rem' }}>{stat.sub}</div>
    </div>
  )
}

export function StatsSection() {
  return (
    <section className="relative py-20 sm:py-24 overflow-hidden"
      style={{ background: 'linear-gradient(180deg,#060B1A 0%,#0D1530 50%,#060B1A 100%)' }}>
      <div className="absolute pointer-events-none inset-0" aria-hidden>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '700px', height: '300px', background: 'radial-gradient(ellipse,rgba(249,115,22,0.08) 0%,transparent 70%)', filter: 'blur(40px)' }} />
      </div>
      <div className="container-page relative z-10">
        <div className="text-center mb-12">
          <div className="orange-divider mx-auto mb-4" />
          <h2 className="font-black text-white" style={{ fontSize: 'clamp(1.75rem,4vw,2.5rem)' }}>
            بیواز در اعداد{' '}
            <span style={{ background: 'linear-gradient(135deg,#FDE68A,#F97316)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              صحبت می‌کند
            </span>
          </h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {STATS.map((stat, i) => <StatCard key={i} stat={stat} index={i} />)}
        </div>
      </div>
    </section>
  )
}
