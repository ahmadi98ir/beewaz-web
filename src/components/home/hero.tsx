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
          videoRef.current.style.transform = `translateY(${y * 0.35}px)`
        if (contentRef.current) {
          const fade = Math.max(0, 1 - y / 500)
          contentRef.current.style.opacity = String(fade)
          contentRef.current.style.transform = `translateY(${y * 0.1}px)`
        }
        ticking = false
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const title    = cms.hero_title    ?? '\u0627\u0645\u0646\u06cc\u062a \u0647\u0648\u0634\u0645\u0646\u062f'
  const line2    = cms.hero_line2    ?? '\u0622\u0631\u0627\u0645\u0634 \u0648\u0627\u0642\u0639\u06cc \u0628\u0631\u0627\u06cc \u062e\u0627\u0646\u0647\u200c\u062a\u0627\u0646'
  const subtitle = cms.hero_subtitle ?? '\u0633\u06cc\u0633\u062a\u0645\u200c\u0647\u0627\u06cc \u062f\u0632\u062f\u06af\u06cc\u0631 \u067e\u06cc\u0634\u0631\u0641\u062a\u0647 \u0628\u06cc\u0648\u0627\u0632 \u2014 \u0645\u062d\u0627\u0641\u0638\u062a \u06f2\u06f4 \u0633\u0627\u0639\u062a\u0647 \u0628\u0627 \u062a\u06a9\u0646\u0648\u0644\u0648\u0698\u06cc \u0631\u0648\u0632 \u062f\u0646\u06cc\u0627 \u0648 \u067e\u0634\u062a\u06cc\u0628\u0627\u0646\u06cc \u0645\u062a\u062e\u0635\u0635'
  const badge    = cms.hero_badge    ?? '\u0628\u06cc\u0634 \u0627\u0632 \u06f1\u06f0 \u0633\u0627\u0644 \u062a\u062c\u0631\u0628\u0647 \u062f\u0631 \u0627\u0645\u0646\u06cc\u062a \u0627\u0644\u06a9\u062a\u0631\u0648\u0646\u06cc\u06a9'
  const cta1     = cms.hero_cta      ?? '\u0645\u0634\u0627\u0648\u0631\u0647 \u0631\u0627\u06cc\u06af\u0627\u0646 \u0628\u06af\u06cc\u0631\u06cc\u062f'
  const cta1Url  = cms.hero_cta_url  ?? '/contact'
  const cta2     = cms.hero_cta_secondary     ?? '\u0645\u0634\u0627\u0647\u062f\u0647 \u0645\u062d\u0635\u0648\u0644\u0627\u062a'
  const cta2Url  = cms.hero_cta_secondary_url ?? '/shop'
  const videoUrl = cms.hero_video_url ??
    'https://videos.pexels.com/video-files/3129957/3129957-hd_1920_1080_25fps.mp4'
  const trust = [
    cms.trust_1 ?? '\u06af\u0627\u0631\u0627\u0646\u062a\u06cc \u06f1\u06f8 \u0645\u0627\u0647\u0647',
    cms.trust_2 ?? '\u0646\u0635\u0628 \u062a\u062e\u0635\u0635\u06cc \u0631\u0627\u06cc\u06af\u0627\u0646',
    cms.trust_3 ?? '\u067e\u0634\u062a\u06cc\u0628\u0627\u0646\u06cc \u06f7/\u06f2\u06f4',
    cms.trust_4 ?? '\u0627\u0631\u0633\u0627\u0644 \u0633\u0631\u0627\u0633\u0631\u06cc',
  ]

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden" style={{ background: '#060B1A' }}>

      {/* Video */}
      <video ref={videoRef} autoPlay muted loop playsInline aria-hidden
        className="absolute inset-0 w-full object-cover will-change-transform"
        style={{ height: '120%', top: '-10%', transition: 'none', opacity: 0.22 }}>
        <source src={videoUrl} type="video/mp4" />
      </video>

      {/* Layered overlays */}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, #060B1A 0%, rgba(6,11,26,0.45) 35%, rgba(6,11,26,0.45) 65%, #060B1A 100%)' }} />
      <div className="absolute inset-0" style={{ background: 'linear-gradient(110deg, rgba(6,11,26,0.95) 0%, rgba(6,11,26,0.65) 55%, transparent 100%)' }} />

      {/* Glow orbs */}
      <div className="absolute pointer-events-none" style={{ top: '-5%', left: '50%', transform: 'translateX(-50%)', width: '1000px', height: '400px', background: 'radial-gradient(ellipse, rgba(249,115,22,0.11) 0%, transparent 65%)', filter: 'blur(40px)' }} />
      <div className="absolute pointer-events-none" style={{ bottom: '10%', right: '5%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(27,58,138,0.22) 0%, transparent 70%)', filter: 'blur(70px)' }} />
      <div className="absolute pointer-events-none" style={{ top: '35%', left: '15%', width: '350px', height: '350px', background: 'radial-gradient(circle, rgba(249,115,22,0.07) 0%, transparent 70%)', filter: 'blur(50px)' }} />

      {/* Horizontal scan line */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
        <div style={{ position: 'absolute', left: 0, right: 0, height: '1.5px', background: 'linear-gradient(to right, transparent 0%, rgba(249,115,22,0.0) 20%, rgba(249,115,22,0.35) 50%, rgba(249,115,22,0.0) 80%, transparent 100%)', animation: 'scanLine 8s linear infinite' }} />
      </div>

      {/* Radar rings — desktop */}
      <div className="absolute pointer-events-none hidden lg:block" style={{ top: '50%', right: '5%', transform: 'translateY(-50%)' }}>
        {[500, 380, 260, 160].map((size, i) => (
          <div key={size} style={{
            position: 'absolute', width: `${size}px`, height: `${size}px`,
            top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
            border: `1px solid rgba(249,115,22,${0.04 + i * 0.04})`,
            borderRadius: '50%',
            animation: `pulse-ring 5s ease-out ${i * 1.2}s infinite`,
          }} />
        ))}
        {/* Center shield icon */}
        <div className="relative animate-float" style={{ width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, rgba(249,115,22,0.12), rgba(27,58,138,0.15))', borderRadius: '50%', border: '1.5px solid rgba(249,115,22,0.3)', boxShadow: '0 0 30px rgba(249,115,22,0.15)' }}>
          <svg viewBox="0 0 24 24" fill="none" style={{ width: '36px', height: '36px' }}>
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="rgba(249,115,22,0.2)" stroke="#F97316" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M9 12l2 2 4-4" stroke="#F97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>

      {/* Floating ARMED badge */}
      <div className="absolute hidden lg:flex items-center gap-2.5 px-4 py-2.5 rounded-2xl animate-float"
        style={{ top: '5.5rem', insetInlineEnd: '2rem', background: 'rgba(6,11,26,0.7)', border: '1px solid rgba(249,115,22,0.22)', backdropFilter: 'blur(16px)', animationDelay: '0s' }}>
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: '#4ADE80' }}></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ background: '#4ADE80' }}></span>
        </span>
        <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em' }}>
          \u0633\u06cc\u0633\u062a\u0645 \u0641\u0639\u0627\u0644
        </span>
      </div>

      {/* Floating stat badge */}
      <div className="absolute hidden lg:flex flex-col items-center gap-1 px-5 py-3.5 rounded-2xl"
        style={{ bottom: '13rem', insetInlineEnd: '2rem', background: 'rgba(6,11,26,0.7)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(16px)', animation: 'float 7s ease-in-out 1.5s infinite' }}>
        <span style={{ color: '#FB923C', fontSize: '2rem', fontWeight: 900, lineHeight: 1 }}>\u06f5\u06f0\u06f0\u06f0+</span>
        <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.7rem', fontWeight: 600 }}>\u0645\u0634\u062a\u0631\u06cc \u0631\u0627\u0636\u06cc</span>
      </div>

      {/* Content */}
      <div ref={contentRef} className="container-page relative z-10 pt-28 pb-40 will-change-transform">

        {/* Badge */}
        <div className="animate-slide-up mb-8" style={{ animationDelay: '80ms' }}>
          <span className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full text-sm font-bold"
            style={{ background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.3)', color: '#FDBA74' }}>
            <span className="w-2 h-2 rounded-full animate-pulse flex-shrink-0" style={{ background: '#F97316' }} />
            {badge}
          </span>
        </div>

        {/* H1 */}
        <h1 className="animate-slide-up font-black text-white leading-none mb-6 max-w-3xl"
          style={{ animationDelay: '180ms', fontSize: 'clamp(3rem, 7vw, 5.5rem)', lineHeight: 1.1 }}>
          {title}
          <br />
          <span style={{ background: 'linear-gradient(135deg, #FDE68A 0%, #FB923C 40%, #F97316 70%, #EA580C 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            {line2}
          </span>
        </h1>

        {/* Divider line */}
        <div className="animate-slide-up mb-5" style={{ animationDelay: '260ms', display: 'flex', alignItems: 'center', gap: '12px', maxWidth: '400px' }}>
          <div style={{ height: '2px', flex: 1, background: 'linear-gradient(to right, #F97316, transparent)' }} />
        </div>

        {/* Subtitle */}
        <p className="animate-slide-up max-w-lg mb-10"
          style={{ animationDelay: '300ms', fontSize: '1.125rem', color: 'rgba(255,255,255,0.52)', lineHeight: 1.85 }}>
          {subtitle}
        </p>

        {/* CTAs */}
        <div className="animate-slide-up flex flex-wrap gap-4 mb-12" style={{ animationDelay: '420ms' }}>
          <Link href={cta1Url}
            className="group relative inline-flex items-center gap-2.5 font-bold text-white rounded-xl overflow-hidden"
            style={{ padding: '1.0625rem 2.25rem', fontSize: '1.0625rem', background: 'linear-gradient(135deg, #F97316, #DC2626)', boxShadow: '0 4px 30px rgba(249,115,22,0.5), 0 1px 0 rgba(255,255,255,0.1) inset', transition: 'all 0.25s ease' }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLAnchorElement
              el.style.boxShadow = '0 8px 40px rgba(249,115,22,0.65), 0 1px 0 rgba(255,255,255,0.1) inset'
              el.style.transform = 'translateY(-3px)'
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLAnchorElement
              el.style.boxShadow = '0 4px 30px rgba(249,115,22,0.5), 0 1px 0 rgba(255,255,255,0.1) inset'
              el.style.transform = 'translateY(0)'
            }}>
            <span className="relative z-10">{cta1}</span>
            <svg className="w-5 h-5 relative z-10 transition-transform duration-300 group-hover:-translate-x-1" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
            </svg>
          </Link>
          <Link href={cta2Url}
            className="inline-flex items-center gap-2 font-semibold text-white rounded-xl backdrop-blur-sm transition-all duration-200"
            style={{ padding: '1.0625rem 2.25rem', fontSize: '1rem', background: 'rgba(255,255,255,0.07)', border: '1.5px solid rgba(255,255,255,0.14)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.12)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.07)' }}>
            {cta2}
          </Link>
        </div>

        {/* Trust pills */}
        <div className="animate-slide-up flex flex-wrap gap-3" style={{ animationDelay: '560ms' }}>
          {trust.map((label, i) => (
            <span key={i} className="flex items-center gap-2 px-4 py-2 rounded-full text-sm"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', color: 'rgba(255,255,255,0.55)' }}>
              <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="#F97316" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
              </svg>
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce" aria-hidden>
        <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.65rem', letterSpacing: '0.2em' }}>\u0627\u0633\u06a9\u0631\u0648\u0644</span>
        <div style={{ width: '22px', height: '38px', border: '1.5px solid rgba(255,255,255,0.12)', borderRadius: '11px', display: 'flex', justifyContent: 'center', padding: '7px 0' }}>
          <div style={{ width: '3px', height: '7px', borderRadius: '99px', background: '#F97316', opacity: 0.8 }} />
        </div>
      </div>
    </section>
  )
}
