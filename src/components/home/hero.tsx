'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import type { CmsContent } from '@/lib/cms'

interface HeroProps { cms?: CmsContent }

// Static particle data (avoids hydration mismatch)
const PARTICLES = [
  { x: 8,  y: 15, s: 2.5, d: 22, dl: 0    },
  { x: 18, y: 72, s: 1.5, d: 28, dl: -5   },
  { x: 25, y: 40, s: 3,   d: 18, dl: -12  },
  { x: 35, y: 88, s: 2,   d: 25, dl: -8   },
  { x: 42, y: 22, s: 1,   d: 32, dl: -3   },
  { x: 55, y: 60, s: 2.5, d: 20, dl: -16  },
  { x: 62, y: 10, s: 1.5, d: 27, dl: -6   },
  { x: 70, y: 45, s: 3,   d: 24, dl: -19  },
  { x: 78, y: 80, s: 2,   d: 21, dl: -2   },
  { x: 85, y: 30, s: 1,   d: 30, dl: -14  },
  { x: 92, y: 65, s: 2.5, d: 19, dl: -9   },
  { x: 12, y: 55, s: 1.5, d: 26, dl: -7   },
  { x: 30, y: 5,  s: 2,   d: 23, dl: -11  },
  { x: 48, y: 95, s: 3,   d: 17, dl: -4   },
  { x: 65, y: 25, s: 1,   d: 29, dl: -18  },
  { x: 88, y: 50, s: 2,   d: 22, dl: -1   },
  { x: 5,  y: 85, s: 1.5, d: 31, dl: -15  },
  { x: 45, y: 35, s: 2.5, d: 20, dl: -13  },
  { x: 72, y: 92, s: 1,   d: 25, dl: -10  },
  { x: 95, y: 18, s: 2,   d: 27, dl: -17  },
  { x: 15, y: 38, s: 3,   d: 18, dl: -20  },
  { x: 58, y: 75, s: 1.5, d: 24, dl: -22  },
  { x: 82, y: 12, s: 2,   d: 21, dl: -8   },
  { x: 38, y: 62, s: 1,   d: 28, dl: -5   },
  { x: 22, y: 92, s: 2.5, d: 16, dl: -25  },
]

const RINGS = [
  { size: 540, delay: '0s',    dur: '4s',   opacity: 0.12 },
  { size: 400, delay: '1s',    dur: '4s',   opacity: 0.18 },
  { size: 280, delay: '2s',    dur: '4s',   opacity: 0.25 },
  { size: 180, delay: '2.8s',  dur: '4s',   opacity: 0.35 },
  { size: 100, delay: '3.4s',  dur: '4s',   opacity: 0.45 },
]

export function Hero({ cms = {} }: HeroProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const heroRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    let ticking = false
    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        const y = window.scrollY
        if (videoRef.current)
          videoRef.current.style.transform = `translateY(${y * 0.4}px) scale(1.1)`
        if (contentRef.current) {
          const fade = Math.max(0, 1 - y / 480)
          contentRef.current.style.opacity = String(fade)
          contentRef.current.style.transform = `translateY(${y * 0.15}px)`
        }
        ticking = false
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <section
      ref={heroRef}
      dir="rtl"
      style={{
        position: 'relative',
        minHeight: '100svh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        background: 'linear-gradient(160deg, #06091A 0%, #0A1028 40%, #060B1A 100%)',
      }}
    >
      {/* ── Video Background ── */}
      <video
        ref={videoRef}
        autoPlay muted loop playsInline
        style={{
          position: 'absolute', inset: 0,
          width: '100%', height: '120%',
          objectFit: 'cover',
          opacity: 0.12,
          willChange: 'transform',
          transformOrigin: 'top center',
        }}
      >
        <source src="/videos/hero-bg.mp4" type="video/mp4" />
      </video>

      {/* ── Deep glow orbs ── */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden',
      }}>
        {/* Orange top-right glow */}
        <div style={{
          position: 'absolute', top: '-15%', right: '-10%',
          width: '70vw', height: '70vw', maxWidth: 700, maxHeight: 700,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(249,115,22,0.18) 0%, rgba(234,88,12,0.08) 40%, transparent 70%)',
          animation: 'breathe 8s ease-in-out infinite',
        }} />
        {/* Blue bottom-left glow */}
        <div style={{
          position: 'absolute', bottom: '-20%', left: '-15%',
          width: '60vw', height: '60vw', maxWidth: 600, maxHeight: 600,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59,92,239,0.2) 0%, rgba(27,58,138,0.08) 40%, transparent 70%)',
          animation: 'breathe 10s ease-in-out 3s infinite',
        }} />
        {/* Center deep glow */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%,-50%)',
          width: '50vw', height: '50vw', maxWidth: 500, maxHeight: 500,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(249,115,22,0.07) 0%, transparent 65%)',
        }} />
      </div>

      {/* ── Subtle grid overlay ── */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px',
        pointerEvents: 'none',
      }} />

      {/* ── Floating Particles ── */}
      {mounted && (
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          {PARTICLES.map((p, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: `${p.x}%`, top: `${p.y}%`,
                width: `${p.s}px`, height: `${p.s}px`,
                borderRadius: '50%',
                background: i % 3 === 0
                  ? `rgba(249,115,22,${0.3 + (i % 4) * 0.12})`
                  : i % 3 === 1
                    ? `rgba(93,133,255,${0.25 + (i % 3) * 0.1})`
                    : `rgba(255,255,255,${0.15 + (i % 5) * 0.06})`,
                animation: `particleFloat ${p.d}s ease-in-out ${p.dl}s infinite`,
                boxShadow: i % 4 === 0 ? '0 0 6px rgba(249,115,22,0.6)' : 'none',
              }}
            />
          ))}
        </div>
      )}

      {/* ── Radar rings ── */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%,-50%)',
        pointerEvents: 'none',
        zIndex: 1,
      }}>
        {RINGS.map((r, i) => (
          <div key={i} style={{
            position: 'absolute',
            width: r.size, height: r.size,
            top: '50%', left: '50%',
            transform: 'translate(-50%,-50%)',
            borderRadius: '50%',
            border: `1px solid rgba(249,115,22,${r.opacity})`,
            animation: `radarRing ${r.dur} ease-out ${r.delay} infinite`,
          }} />
        ))}
      </div>

      {/* ── Horizontal scan line ── */}
      <div style={{
        position: 'absolute', left: 0, right: 0, height: 1,
        background: 'linear-gradient(90deg, transparent, rgba(249,115,22,0.6), transparent)',
        animation: 'scanLine 10s linear infinite',
        pointerEvents: 'none', zIndex: 2,
      }} />

      {/* ── Main content ── */}
      <div
        ref={contentRef}
        style={{
          position: 'relative', zIndex: 10,
          width: '100%',
          maxWidth: 900,
          marginInline: 'auto',
          paddingInline: '1.25rem',
          paddingBlock: '8rem 6rem',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.5rem',
        }}
      >
        {/* Shield + orbit */}
        <div style={{
          position: 'relative',
          width: 100, height: 100,
          marginBottom: '0.5rem',
          animation: 'floatShield 5s ease-in-out infinite',
        }}>
          {/* Orbit ring */}
          <div style={{
            position: 'absolute', inset: -18,
            borderRadius: '50%',
            border: '1px dashed rgba(249,115,22,0.35)',
            animation: 'orbitSpin 12s linear infinite',
          }}>
            <div style={{
              position: 'absolute', top: -4, left: '50%',
              transform: 'translateX(-50%)',
              width: 8, height: 8,
              borderRadius: '50%',
              background: '#F97316',
              boxShadow: '0 0 12px rgba(249,115,22,0.9)',
            }} />
          </div>
          {/* Shield SVG */}
          <div style={{
            width: '100%', height: '100%',
            background: 'linear-gradient(135deg, rgba(249,115,22,0.15), rgba(27,58,138,0.2))',
            borderRadius: '50%',
            border: '1.5px solid rgba(249,115,22,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 0 40px rgba(249,115,22,0.25), 0 0 80px rgba(249,115,22,0.1)',
          }}>
            <svg viewBox="0 0 48 56" fill="none" style={{ width: 52, height: 60 }}>
              <path d="M24 2L4 10v16c0 13.25 8.5 25.6 20 30 11.5-4.4 20-16.75 20-30V10L24 2z"
                fill="rgba(249,115,22,0.15)" stroke="#F97316" strokeWidth="1.8"
                strokeLinecap="round" strokeLinejoin="round" />
              <path d="M16 28l5.5 5.5 10.5-11"
                stroke="#FDE68A" strokeWidth="2.2"
                strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        {/* Live badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          background: 'rgba(16,185,129,0.12)',
          border: '1px solid rgba(16,185,129,0.3)',
          borderRadius: 99, padding: '0.4rem 1rem',
          fontSize: '0.8125rem', fontWeight: 600, color: '#6EE7B7',
          backdropFilter: 'blur(8px)',
          animation: 'fadeSlideDown 0.6s ease both',
        }}>
          <span style={{
            width: 7, height: 7, borderRadius: '50%',
            background: '#10B981',
            boxShadow: '0 0 8px rgba(16,185,129,0.8)',
            animation: 'pingDot 1.5s ease infinite',
            flexShrink: 0,
          }} />
          سیستم امنیتی فعال است
        </div>

        {/* Main headline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <h1 style={{
            fontSize: 'clamp(2.4rem,7vw,5.5rem)',
            fontWeight: 900,
            lineHeight: 1.15,
            color: '#FFFFFF',
            letterSpacing: '-0.02em',
            margin: 0,
            animation: 'fadeSlideUp 0.7s 0.2s ease both',
          }}>
            امنیت اماکن شما
          </h1>
          <h1 style={{
            fontSize: 'clamp(2.4rem,7vw,5.5rem)',
            fontWeight: 900,
            lineHeight: 1.15,
            margin: 0,
            background: 'linear-gradient(90deg, #FDE68A 0%, #FB923C 35%, #F97316 65%, #EA580C 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            animation: 'fadeSlideUp 0.7s 0.35s ease both',
            backgroundSize: '200% auto',
            animationName: 'fadeSlideUp, shimmerText',
            animationDuration: '0.7s, 3s',
            animationDelay: '0.35s, 1s',
            animationFillMode: 'both, none',
            animationTimingFunction: 'ease, ease',
            animationIterationCount: '1, infinite',
          }}>
            مأموریت ماست
          </h1>
        </div>

        {/* Divider */}
        <div style={{
          width: 60, height: 3,
          background: 'linear-gradient(90deg, #F97316, rgba(249,115,22,0.3))',
          borderRadius: 99,
          animation: 'fadeSlideUp 0.7s 0.45s ease both',
        }} />

        {/* Description */}
        <p style={{
          fontSize: 'clamp(1rem,2.5vw,1.2rem)',
          color: 'rgba(255,255,255,0.65)',
          maxWidth: 560,
          lineHeight: 1.8,
          margin: 0,
          animation: 'fadeSlideUp 0.7s 0.55s ease both',
        }}>
          با دزدگیرهای هوشمند بیواز، لحظه‌ای که از خانه یا کسب‌وکارتان دور می‌شوید
          امنیت کامل در دستانتان است — هشدار فوری، کنترل از راه دور، گارانتی ۱۸ ماهه
        </p>

        {/* CTA Buttons */}
        <div style={{
          display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center',
          animation: 'fadeSlideUp 0.7s 0.7s ease both',
        }}>
          <a
            href="tel:+982100000000"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.6rem',
              padding: '0.9rem 2.2rem',
              background: 'linear-gradient(135deg, #F97316, #EA580C)',
              color: '#fff', fontWeight: 700,
              fontSize: '1rem',
              borderRadius: 12,
              textDecoration: 'none',
              boxShadow: '0 4px 24px rgba(249,115,22,0.45), 0 0 0 0 rgba(249,115,22,0.3)',
              transition: 'all 0.25s ease',
              animation: 'ctaGlow 2.5s ease-in-out 2s infinite',
              position: 'relative',
              overflow: 'hidden',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLAnchorElement
              el.style.transform = 'translateY(-3px) scale(1.02)'
              el.style.boxShadow = '0 8px 36px rgba(249,115,22,0.65), 0 0 0 4px rgba(249,115,22,0.15)'
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLAnchorElement
              el.style.transform = 'translateY(0) scale(1)'
              el.style.boxShadow = '0 4px 24px rgba(249,115,22,0.45), 0 0 0 0 rgba(249,115,22,0.3)'
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" style={{ width: 20, height: 20, flexShrink: 0 }}>
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 014.72 12a19.79 19.79 0 01-3.07-8.67A2 2 0 013.63 1.2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L7.91 8.85a16 16 0 006.29 6.29l.61-.61a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            مشاوره رایگان — همین الان
          </a>
          <Link
            href="/products"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.9rem 2rem',
              background: 'rgba(255,255,255,0.06)',
              border: '1.5px solid rgba(255,255,255,0.2)',
              color: '#fff', fontWeight: 600,
              fontSize: '1rem',
              borderRadius: 12,
              textDecoration: 'none',
              backdropFilter: 'blur(8px)',
              transition: 'all 0.25s ease',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLAnchorElement
              el.style.background = 'rgba(255,255,255,0.12)'
              el.style.borderColor = 'rgba(255,255,255,0.4)'
              el.style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLAnchorElement
              el.style.background = 'rgba(255,255,255,0.06)'
              el.style.borderColor = 'rgba(255,255,255,0.2)'
              el.style.transform = 'translateY(0)'
            }}
          >
            مشاهده محصولات
            <svg viewBox="0 0 24 24" fill="none" style={{ width: 18, height: 18 }}>
              <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>

        {/* Trust pills */}
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: '0.75rem',
          justifyContent: 'center',
          animation: 'fadeSlideUp 0.7s 0.85s ease both',
        }}>
          {[
            'گارانتی ۱۸ ماهه',
            'نصب توسط متخصص',
            'پشتیبانی ۲۴/۷',
            'ارسال به سراسر ایران',
          ].map((t, i) => (
            <div key={i} style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
              padding: '0.35rem 0.85rem',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 99,
              color: 'rgba(255,255,255,0.75)',
              fontSize: '0.8125rem', fontWeight: 500,
              backdropFilter: 'blur(4px)',
            }}>
              <svg viewBox="0 0 16 16" fill="none" style={{ width: 14, height: 14, flexShrink: 0 }}>
                <path d="M13 4L6.5 11 3 7.5" stroke="#F97316" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {t}
            </div>
          ))}
        </div>

        {/* Floating stat badges */}
        <div style={{
          display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center',
          marginTop: '0.5rem',
          animation: 'fadeSlideUp 0.7s 1s ease both',
        }}>
          {[
            { val: '۵۰۰۰+', label: 'مشتری راضی', color: '#F97316' },
            { val: '۱۰+',   label: 'سال تجربه',  color: '#6080FA' },
            { val: '۹۸٪',   label: 'رضایت‌مندی', color: '#10B981' },
          ].map((s, i) => (
            <div key={i} style={{
              padding: '0.65rem 1.2rem',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 12,
              backdropFilter: 'blur(12px)',
              textAlign: 'center',
              animation: `floatBadge ${4 + i}s ease-in-out ${i * 0.8}s infinite`,
            }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: s.color, lineHeight: 1.2 }}>
                {s.val}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Scroll indicator ── */}
      <div style={{
        position: 'absolute', bottom: '2rem', left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
        zIndex: 10, animation: 'fadeSlideUp 1s 1.2s ease both',
      }}>
        <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.15em' }}>
          اسکرول کنید
        </span>
        <div style={{
          width: 24, height: 38,
          border: '1.5px solid rgba(255,255,255,0.2)',
          borderRadius: 12,
          display: 'flex', justifyContent: 'center', padding: '5px 0',
        }}>
          <div style={{
            width: 4, height: 8,
            borderRadius: 99,
            background: '#F97316',
            animation: 'scrollDot 1.8s ease-in-out infinite',
          }} />
        </div>
      </div>

      {/* ── Bottom gradient fade ── */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        height: 200,
        background: 'linear-gradient(to bottom, transparent, #060B1A)',
        pointerEvents: 'none', zIndex: 5,
      }} />

      <style>{`
        @keyframes breathe {
          0%,100% { transform: scale(1) translate(0,0); opacity: 1; }
          50%      { transform: scale(1.1) translate(2%,-2%); opacity: 0.8; }
        }
        @keyframes particleFloat {
          0%,100% { transform: translateY(0px) translateX(0px); opacity: 0.3; }
          25%      { transform: translateY(-18px) translateX(6px); opacity: 0.7; }
          50%      { transform: translateY(-8px) translateX(-8px); opacity: 0.4; }
          75%      { transform: translateY(-24px) translateX(4px); opacity: 0.8; }
        }
        @keyframes radarRing {
          0%   { transform: translate(-50%,-50%) scale(0.4); opacity: 0.8; }
          100% { transform: translate(-50%,-50%) scale(1.8); opacity: 0; }
        }
        @keyframes scanLine {
          0%   { top: -2px; opacity: 0; }
          5%   { opacity: 0.6; }
          95%  { opacity: 0.6; }
          100% { top: 100%; opacity: 0; }
        }
        @keyframes floatShield {
          0%,100% { transform: translateY(0px) rotate(0deg); }
          40%      { transform: translateY(-14px) rotate(1.5deg); }
          70%      { transform: translateY(-6px) rotate(-1deg); }
        }
        @keyframes orbitSpin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes pingDot {
          0%,100% { transform: scale(1); opacity: 1; }
          50%      { transform: scale(1.5); opacity: 0.6; }
        }
        @keyframes fadeSlideDown {
          from { opacity: 0; transform: translateY(-16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmerText {
          0%   { background-position: 0% center; }
          50%  { background-position: 100% center; }
          100% { background-position: 0% center; }
        }
        @keyframes ctaGlow {
          0%,100% { box-shadow: 0 4px 24px rgba(249,115,22,0.45), 0 0 0 0 rgba(249,115,22,0.3); }
          50%      { box-shadow: 0 4px 24px rgba(249,115,22,0.45), 0 0 0 8px rgba(249,115,22,0); }
        }
        @keyframes floatBadge {
          0%,100% { transform: translateY(0px); }
          50%      { transform: translateY(-6px); }
        }
        @keyframes scrollDot {
          0%   { transform: translateY(0); opacity: 1; }
          100% { transform: translateY(16px); opacity: 0; }
        }
      `}</style>
    </section>
  )
}
