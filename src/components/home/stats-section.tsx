'use client'

import { useEffect, useRef, useState } from 'react'

const STATS = [
  { value: 10, suffix: '+', label: 'سال تجربه', icon: '🏆' },
  { value: 5000, suffix: '+', label: 'مشتری راضی', icon: '👥' },
  { value: 50, suffix: '+', label: 'محصول تخصصی', icon: '🛡️' },
  { value: 18, suffix: ' ماه', label: 'گارانتی', icon: '✔️' },
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
        const steps = 55
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

function StatItem({ stat, index }: { stat: typeof STATS[0]; index: number }) {
  const { count, ref } = useCounter(stat.value)
  return (
    <div ref={ref} className="text-center group px-4 py-8 rounded-2xl transition-all duration-300"
      style={{ background: 'rgb(255 255 255 / 0.03)', border: '1px solid rgb(255 255 255 / 0.06)' }}>
      <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">{stat.icon}</div>
      <div className="font-black mb-1 tabular-nums"
        style={{ fontSize: 'clamp(2.2rem, 5vw, 3.2rem)', background: 'linear-gradient(135deg, #fff 0%, #FB923C 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
        {count.toLocaleString('fa-IR')}{stat.suffix}
      </div>
      <p className="text-sm sm:text-base font-semibold" style={{ color: 'rgb(255 255 255 / 0.5)' }}>{stat.label}</p>
      <div className="mt-4 mx-auto rounded-full transition-all duration-300 group-hover:w-12"
        style={{ width: '2rem', height: '2px', background: 'linear-gradient(90deg, #F97316, #FB923C)' }} />
    </div>
  )
}

export function StatsSection() {
  return (
    <section className="py-16 sm:py-20 relative overflow-hidden" style={{ background: '#060B20' }}>
      <div className="absolute inset-0 pointer-events-none">
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '700px', height: '120px', background: 'linear-gradient(90deg, #1B3A8A, #F97316, #1B3A8A)', opacity: 0.15, filter: 'blur(60px)', borderRadius: '50%' }} />
      </div>
      <div className="container-page relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {STATS.map((stat, i) => <StatItem key={i} stat={stat} index={i} />)}
        </div>
      </div>
    </section>
  )
}
