'use client'

import { useEffect, useRef } from 'react'
import type { CmsContent } from '@/lib/cms'

interface HowItWorksProps { cms?: CmsContent }

const STEPS = [
  {
    num: '۱',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7">
        <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
          fill="rgba(249,115,22,0.15)" stroke="#F97316" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'تماس و مشاوره رایگان',
    desc: 'با کارشناسان بیواز تماس بگیرید. ما نیازهای امنیتی منزل یا کسب‌وکار شما را بررسی کرده و بهترین راهکار را پیشنهاد می‌دهیم.',
  },
  {
    num: '۲',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7">
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
          fill="rgba(249,115,22,0.15)" stroke="#F97316" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'انتخاب و سفارش',
    desc: 'پس از مشاوره، محصول مناسب را انتخاب کنید. سیستم BH10 برای خانه و BH11 برای کسب‌وکارهای بزرگ‌تر ایده‌آل است.',
  },
  {
    num: '۳',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7">
        <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          fill="rgba(249,115,22,0.15)" stroke="#F97316" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="12" cy="12" r="3" fill="rgba(249,115,22,0.2)" stroke="#F97316" strokeWidth="1.8"/>
      </svg>
    ),
    title: 'نصب تخصصی رایگان',
    desc: 'تیم فنی ما در کمترین زمان ممکن در محل شما حاضر شده و سیستم را به صورت کاملاً حرفه‌ای نصب و راه‌اندازی می‌کند.',
  },
  {
    num: '۴',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
          fill="rgba(249,115,22,0.15)" stroke="#F97316" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9 12l2 2 4-4" stroke="#F97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'محافظت دائمی',
    desc: 'سیستم شما فعال است. هشدارهای لحظه‌ای، کنترل از راه دور، و پشتیبانی ۲۴/۷ — آرامش واقعی برای شما و خانواده‌تان.',
  },
]

function AnimateIn({ children, delay = 0, direction = 'up' }: {
  children: React.ReactNode; delay?: number; direction?: 'up' | 'left' | 'right'
}) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const xMap = { up: 0, left: -24, right: 24 }
    el.style.opacity = '0'
    el.style.transform = `translateY(${direction === 'up' ? 28 : 0}px) translateX(${xMap[direction]}px)`
    el.style.transition = 'opacity 0.65s cubic-bezier(0.16,1,0.3,1), transform 0.65s cubic-bezier(0.16,1,0.3,1)'
    const obs = new IntersectionObserver(([e]) => {
      if (e?.isIntersecting) {
        setTimeout(() => {
          el.style.opacity = '1'
          el.style.transform = 'translateY(0) translateX(0)'
        }, delay)
        obs.disconnect()
      }
    }, { threshold: 0.15 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [delay, direction])
  return <div ref={ref}>{children}</div>
}

export function HowItWorks({ cms = {} }: HowItWorksProps) {
  const title = cms.how_title ?? 'چطور کار می‌کند؟'

  return (
    <section className="relative py-20 sm:py-28 overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #060B1A 0%, #0A1428 60%, #060B1A 100%)' }}>

      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div style={{ position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%,-50%)', width: '800px', height: '400px', background: 'radial-gradient(ellipse, rgba(27,58,138,0.15) 0%, transparent 70%)', filter: 'blur(50px)' }} />
      </div>

      <div className="container-page relative z-10">

        {/* Header */}
        <AnimateIn>
          <div className="text-center mb-16">
            <div className="orange-divider mx-auto mb-4" />
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold mb-4"
              style={{ background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.25)', color: '#FB923C' }}>
              فرآیند خرید و نصب
            </span>
            <h2 className="font-black text-white mb-3" style={{ fontSize: 'clamp(1.875rem,4vw,2.75rem)' }}>
              {title.split('؟')[0]}{' '}
              <span style={{ background: 'linear-gradient(135deg,#FDE68A,#F97316)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                ؟
              </span>
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.4)', lineHeight: 1.8, maxWidth: '480px', margin: '0 auto' }}>
              از تماس اول تا محافظت کامل — در ۴ گام ساده
            </p>
          </div>
        </AnimateIn>

        {/* Desktop: horizontal steps with connecting line */}
        <div className="hidden md:block">
          <div className="relative">
            {/* Connecting line */}
            <div className="absolute top-[2.6rem] right-[12.5%] left-[12.5%] h-px"
              style={{ background: 'linear-gradient(90deg, rgba(249,115,22,0.5), rgba(27,58,138,0.3), rgba(249,115,22,0.5)' }} />

            <div className="grid grid-cols-4 gap-6">
              {STEPS.map((step, i) => (
                <AnimateIn key={i} delay={i * 130} direction="up">
                  <div className="relative flex flex-col items-center text-center group">

                    {/* Step number circle */}
                    <div className="relative mb-6 w-[5.2rem] h-[5.2rem] rounded-full flex flex-col items-center justify-center transition-all duration-400 group-hover:scale-110"
                      style={{
                        background: 'linear-gradient(135deg, rgba(249,115,22,0.15), rgba(27,58,138,0.2))',
                        border: '2px solid rgba(249,115,22,0.3)',
                        boxShadow: '0 0 20px rgba(249,115,22,0.1)',
                      }}>
                      {step.icon}
                      <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-black"
                        style={{ background: '#F97316', color: 'white' }}>
                        {step.num}
                      </div>
                    </div>

                    <h3 className="font-bold text-white mb-2" style={{ fontSize: '1rem' }}>{step.title}</h3>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', lineHeight: 1.75 }}>{step.desc}</p>
                  </div>
                </AnimateIn>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile: vertical timeline */}
        <div className="md:hidden relative">
          {/* Vertical line */}
          <div className="absolute top-4 bottom-4 end-[2.4rem] w-px"
            style={{ background: 'linear-gradient(to bottom, rgba(249,115,22,0.5), rgba(27,58,138,0.3), rgba(249,115,22,0.3))' }} />

          <div className="flex flex-col gap-8">
            {STEPS.map((step, i) => (
              <AnimateIn key={i} delay={i * 100} direction="right">
                <div className="flex items-start gap-4 pe-16 relative">
                  <div className="flex-1 ps-4">
                    <h3 className="font-bold text-white mb-1.5" style={{ fontSize: '1rem' }}>{step.title}</h3>
                    <p style={{ color: 'rgba(255,255,255,0.42)', fontSize: '0.875rem', lineHeight: 1.7 }}>{step.desc}</p>
                  </div>
                  {/* Circle on line */}
                  <div className="absolute end-[1.35rem] top-0 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 z-10"
                    style={{ background: 'linear-gradient(135deg,rgba(249,115,22,0.2),rgba(27,58,138,0.25))', border: '2px solid rgba(249,115,22,0.4)' }}>
                    {step.icon}
                  </div>
                </div>
              </AnimateIn>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <AnimateIn delay={600}>
          <div className="mt-16 text-center">
            <a href="/contact" className="inline-flex items-center gap-2.5 font-bold text-white rounded-xl transition-all duration-300 hover:-translate-y-1"
              style={{ padding: '1rem 2.5rem', background: 'linear-gradient(135deg,#F97316,#EA580C)', boxShadow: '0 4px 24px rgba(249,115,22,0.4)', fontSize: '1.0625rem' }}>
              همین الان شروع کنید
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
              </svg>
            </a>
          </div>
        </AnimateIn>
      </div>
    </section>
  )
}
