'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import type { CmsContent } from '@/lib/cms'

interface HeroProps { cms?: CmsContent }

export function Hero({ cms = {} }: HeroProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let ticking = false
    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        const y = window.scrollY
        if (videoRef.current)
          videoRef.current.style.transform = `translateY(${y * 0.38}px)`
        if (contentRef.current) {
          const fade = Math.max(0, 1 - y / 480)
          contentRef.current.style.opacity = String(fade)
          contentRef.current.style.transform = `translateY(${y * 0.12}px)`
        }
        ticking = false
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const title    = cms.hero_title    ?? 'امنیت هوشمند'
  const line2    = cms.hero_line2    ?? 'برای خانه و کسب‌وکار شما'
  const subtitle = cms.hero_subtitle ?? 'سیستم‌های دزدگیر حرفه‌ای بیواز — محافظت ۲۴ ساعته با تکنولوژی روز دنیا'
  const badge    = cms.hero_badge    ?? 'بیش از ۱۰ سال تجربه در امنیت اماکن'
  const cta1     = cms.hero_cta      ?? 'مشاوره رایگان'
  const cta1Url  = cms.hero_cta_url  ?? '/contact'
  const cta2     = cms.hero_cta_secondary     ?? 'مشاهده محصولات'
  const cta2Url  = cms.hero_cta_secondary_url ?? '/shop'
  const videoUrl = cms.hero_video_url ??
    'https://videos.pexels.com/video-files/3129957/3129957-hd_1920_1080_25fps.mp4'
  const trust = [
    cms.trust_1 ?? 'گارانتی ۱۸ ماهه',
    cms.trust_2 ?? 'نصب تخصصی',
    cms.trust_3 ?? 'پشتیبانی ۲۴/۷',
    cms.trust_4 ?? 'ارسال سریع',
  ]

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden" style={{ background: '#080e1d' }}>

      {/* Video */}
      <video ref={videoRef} autoPlay muted loop playsInline aria-hidden
        className="absolute inset-0 w-full object-cover will-change-transform"
        style={{ height: '115%', top: '-7.5%', transition: 'none' }}>
        <source src={videoUrl} type="video/mp4" />
      </video>

      {/* Overlays */}
      <div className="absolute inset-0" style={{ background: 'rgb(8 14 29 / 0.68)' }} />
      <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgb(6 11 32 / 0.85) 0%, rgb(10 22 58 / 0.45) 50%, transparent 100%)' }} />
      <div className="absolute bottom-0 left-0 right-0 h-48" style={{ background: 'linear-gradient(to top, #080e1d, transparent)' }} />

      {/* Glow orbs */}
      <div className="absolute pointer-events-none" style={{ top: '28%', left: '18%', width: '360px', height: '360px', borderRadius: '50%', background: '#F97316', opacity: 0.12, filter: 'blur(90px)' }} />
      <div className="absolute pointer-events-none" style={{ bottom: '30%', right: '20%', width: '260px', height: '260px', borderRadius: '50%', background: '#1B3A8A', opacity: 0.18, filter: 'blur(70px)' }} />

      {/* Floating badge top-right */}
      <div className="absolute top-24 end-8 hidden lg:flex flex-col items-center gap-1 px-4 py-3 rounded-2xl backdrop-blur-md border animate-float"
        style={{ background: 'rgb(255 255 255 / 0.06)', borderColor: 'rgb(255 255 255 / 0.12)' }}>
        <span className="text-2xl">🛡️</span>
        <span className="text-xs font-bold text-white/70">حفاظت 4 ۲۴</span>
      </div>

      {/* Content */}
      <div ref={contentRef} className="container-page relative z-10 pt-28 pb-36 will-change-transform">

        {/* Badge */}
        <div className="animate-slide-up mb-7" style={{ animationDelay: '80ms' }}>
          <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold backdrop-blur-sm border"
            style={{ background: 'rgb(249 115 22 / 0.16)', borderColor: 'rgb(249 115 22 / 0.38)', color: '#FDBA74' }}>
            <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse flex-shrink-0" />
            {badge}
          </span>
        </div>

        {/* H1 */}
        <h1 className="animate-slide-up font-black text-white leading-tight mb-5 max-w-3xl"
          style={{ animationDelay: '200ms', fontSize: 'clamp(2.4rem, 6vw, 4.5rem)', lineHeight: 1.15 }}>
          {title}
          <br />
          <span style={{ background: 'linear-gradient(135deg, #BFCFFE 0%, #FB923C 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            {line2}
          </span>
        </h1>

        {/* Subtitle */}
        <p className="animate-slide-up text-lg sm:text-xl max-w-xl mb-10 leading-relaxed"
          style={{ animationDelay: '340ms', color: 'rgb(255 255 255 / 0.62)' }}>
          {subtitle}
        </p>

        {/* CTAs */}
        <div className="animate-slide-up flex flex-wrap gap-4 mb-12" style={{ animationDelay: '480ms' }}>
          <Link href={cta1Url}
            className="inline-flex items-center gap-2 font-bold px-8 py-4 rounded-xl text-base text-white transition-all duration-200"
            style={{ background: '#F97316', boxShadow: '0 0 28px rgb(249 115 22 / 0.42)' }}>
            {cta1}
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" /></svg>
          </Link>
          <Link href={cta2Url}
            className="inline-flex items-center gap-2 font-semibold px-8 py-4 rounded-xl text-base text-white transition-all duration-200 backdrop-blur-sm border"
            style={{ background: 'rgb(255 255 255 / 0.08)', borderColor: 'rgb(255 255 255 / 0.2)' }}>
            {cta2}
            <svg className="w-4 h-4 rotate-180" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
          </Link>
        </div>

        {/* Trust pills */}
        <div className="animate-slide-up flex flex-wrap gap-3" style={{ animationDelay: '620ms' }}>
          {trust.map((label) => (
            <span key={label} className="flex items-center gap-1.5 text-sm px-3.5 py-1.5 rounded-full"
              style={{ background: 'rgb(255 255 255 / 0.07)', color: 'rgb(255 255 255 / 0.55)' }}>
              <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="#FB923C" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* Scroll arrow */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 animate-bounce"
        style={{ color: 'rgb(255 255 255 / 0.3)' }} aria-hidden>
        <span className="text-xs tracking-widest">اسکرول</span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </section>
  )
}
