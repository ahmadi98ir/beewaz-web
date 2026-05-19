'use client'

import type { ReactNode } from 'react'
import { useEffect, useRef, useState } from 'react'

const FEATURES = [
  { icon:'🛡️', title:'امنیت ۲۴ ساعته', desc:'سیستم‌های هوشمند ما بدون وقفه از اموال شما محافظت می‌کنند. هشدار فوری به موبایل در کمتر از ۳ ثانیه.', color:'#F97316', glow:'rgba(249,115,22,0.3)' },
  { icon:'📱', title:'کنترل از راه دور', desc:'با اپلیکیشن اختصاصی بیواز، از هر جای دنیا وضعیت امنیتی ملک خود را مشاهده و کنترل کنید.', color:'#6080FA', glow:'rgba(96,128,250,0.3)' },
  { icon:'⚡', title:'نصب سریع', desc:'تیم متخصص ما در کمتر از یک روز کاری سیستم را نصب و راه‌اندازی می‌کند. بدون خسارت به دیوار.', color:'#10B981', glow:'rgba(16,185,129,0.3)' },
  { icon:'🔧', title:'پشتیبانی فنی', desc:'تیم پشتیبانی ۲۴/۷ آماده پاسخگویی است. گارانتی ۱۸ ماهه قطعات و خدمات پس از فروش.', color:'#FB923C', glow:'rgba(251,146,60,0.3)' },
  { icon:'💎', title:'کیفیت اصل', desc:'تمام محصولات دارای گواهی اصالت و استاندارد CE اروپا هستند. فقط بهترین برای شما.', color:'#A78BFA', glow:'rgba(167,139,250,0.3)' },
  { icon:'💰', title:'قیمت رقابتی', desc:'بهترین کیفیت با مناسب‌ترین قیمت. امکان اقساط ۱۲ ماهه بدون بهره برای همه محصولات.', color:'#FBBF24', glow:'rgba(251,191,36,0.3)' },
]

function AnimateIn({ children, delay=0, className='' }: { children:ReactNode; delay?:number; className?:string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const obs = new IntersectionObserver(entries => {
      if (entries[0]?.isIntersecting) { setVisible(true); obs.disconnect() }
    }, { threshold:0.1 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return (
    <div ref={ref} className={className} style={{ opacity:visible?1:0, transform:visible?'translateY(0)':'translateY(40px)', transition:`opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms` }}>
      {children}
    </div>
  )
}

function FeatureCard({ f, i }: { f:typeof FEATURES[0]; i:number }) {
  const [tilt, setTilt] = useState({ x:0, y:0 })
  const [hovered, setHovered] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = cardRef.current?.getBoundingClientRect(); if (!rect) return
    const x = ((e.clientY - rect.top) / rect.height - 0.5) * -12
    const y = ((e.clientX - rect.left) / rect.width - 0.5) * 12
    setTilt({ x, y })
  }

  return (
    <AnimateIn delay={i * 80}>
      <div
        ref={cardRef}
        onMouseMove={onMouseMove}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => { setTilt({ x:0, y:0 }); setHovered(false) }}
        style={{
          position:'relative', borderRadius:20, padding:'2rem',
          background: hovered
            ? `linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)`
            : 'rgba(255,255,255,0.03)',
          border:`1px solid ${hovered ? f.color+'50' : 'rgba(255,255,255,0.07)'}`,
          transform: hovered
            ? `perspective(800px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateY(-6px)`
            : 'perspective(800px) rotateX(0) rotateY(0)',
          transition:'transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease',
          boxShadow: hovered ? `0 20px 60px rgba(0,0,0,0.4), 0 0 0 1px ${f.color}20, 0 0 40px ${f.glow}` : '0 4px 20px rgba(0,0,0,0.2)',
          cursor:'default', overflow:'hidden',
        }}
      >
        {/* Top gradient line */}
        <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:`linear-gradient(90deg, transparent, ${f.color}, transparent)`, opacity: hovered ? 1 : 0.3, transition:'opacity 0.3s ease' }} />

        {/* Glow orb */}
        <div style={{ position:'absolute', top:-40, right:-40, width:120, height:120, borderRadius:'50%', background:`radial-gradient(circle, ${f.glow} 0%, transparent 70%)`, opacity: hovered ? 0.8 : 0.3, transition:'opacity 0.3s ease', pointerEvents:'none' }} />

        {/* Icon */}
        <div style={{ width:60, height:60, borderRadius:16, background:`linear-gradient(135deg, ${f.color}20, ${f.color}08)`, border:`1px solid ${f.color}30`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.75rem', marginBottom:'1.25rem', transform: hovered ? 'scale(1.1)' : 'scale(1)', transition:'transform 0.3s ease' }}>
          {f.icon}
        </div>

        <h3 style={{ fontSize:'1.1rem', fontWeight:700, color:'#fff', marginBottom:'0.6rem' }}>{f.title}</h3>
        <p style={{ fontSize:'0.9rem', lineHeight:1.7, color:'rgba(255,255,255,0.5)', margin:0 }}>{f.desc}</p>

        {/* Bottom arrow */}
        <div style={{ marginTop:'1.25rem', display:'flex', alignItems:'center', gap:6, color:f.color, fontSize:'0.8rem', fontWeight:600, opacity: hovered ? 1 : 0, transition:'opacity 0.3s ease' }}>
          بیشتر بدانید
          <svg viewBox="0 0 16 16" fill="currentColor" style={{ width:14, height:14, transform:'rotate(180deg)' }}>
            <path fillRule="evenodd" d="M6.293 12.293a1 1 0 010-1.414L9.586 7.5 6.293 4.207a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"/>
          </svg>
        </div>
      </div>
    </AnimateIn>
  )
}

export function WhyBeewaz() {
  return (
    <section dir="rtl" style={{ background:'linear-gradient(180deg, #060B1A 0%, #080E22 50%, #060B1A 100%)', padding:'clamp(5rem,10vw,8rem) clamp(1.25rem,4vw,3rem)', position:'relative', overflow:'hidden' }}>
      <style>{`
        @keyframes floatSlow { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-20px)} }
      `}</style>

      {/* Background accent */}
      <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:800, height:800, borderRadius:'50%', background:'radial-gradient(circle, rgba(249,115,22,0.04) 0%, transparent 60%)', pointerEvents:'none' }} />
      <div style={{ position:'absolute', top:0, left:0, right:0, height:1, background:'linear-gradient(90deg, transparent, rgba(249,115,22,0.3), transparent)' }} />

      <div style={{ maxWidth:1200, marginInline:'auto', position:'relative', zIndex:1 }}>
        {/* Header */}
        <AnimateIn>
          <div style={{ textAlign:'center', marginBottom:'clamp(3rem,6vw,5rem)' }}>
            <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(249,115,22,0.1)', border:'1px solid rgba(249,115,22,0.25)', borderRadius:99, padding:'0.4rem 1.2rem', fontSize:'0.8125rem', fontWeight:600, color:'#F97316', marginBottom:'1.25rem' }}>
              <svg viewBox="0 0 16 16" fill="currentColor" style={{ width:14 }}><path d="M8 1l1.854 3.756L14 5.572l-3 2.924.708 4.129L8 10.573l-3.708 2.052.708-4.129L2 5.572l4.146-.816L8 1z"/></svg>
              چرا بیواز انتخاب اول است؟
            </div>
            <h2 style={{ fontSize:'clamp(1.75rem,4vw,3rem)', fontWeight:900, color:'#fff', margin:'0 0 1rem', letterSpacing:'-0.02em' }}>
              مزایایی که{' '}
              <span style={{ background:'linear-gradient(90deg,#FDE68A,#F97316)', backgroundClip:'text', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
                بیواز را متمایز
              </span>
              {' '}می‌کند
            </h2>
            <p style={{ color:'rgba(255,255,255,0.45)', fontSize:'1.05rem', maxWidth:520, marginInline:'auto' }}>
              ترکیب فناوری پیشرفته، کیفیت اصل و خدمات بی‌نظیر پس از فروش
            </p>
          </div>
        </AnimateIn>

        {/* Feature grid */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(min(100%,300px),1fr))', gap:'1.25rem' }}>
          {FEATURES.map((f, i) => <FeatureCard key={i} f={f} i={i} />)}
        </div>
      </div>
    </section>
  )
}
