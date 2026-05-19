import Link from 'next/link'
import type { CmsContent } from '@/lib/cms'

interface CtaSectionProps { cms?: CmsContent }

export function CtaSection({ cms = {} }: CtaSectionProps) {
  const title     = cms.cta_title     ?? 'همین امروز امنیت خانه‌تان را تضمین کنید'
  const subtitle  = cms.cta_subtitle  ?? 'مشاوره رایگان با کارشناسان بیواز — نصب تخصصی در سراسر ایران'
  const button    = cms.cta_button    ?? 'دریافت مشاوره رایگان'
  const buttonUrl = cms.cta_button_url ?? '/contact'
  const phone     = cms.contact_phone ?? '021-91012590'

  return (
    <section className="relative overflow-hidden py-20 sm:py-28" style={{ background: '#060B1A' }}>

      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div className="absolute" style={{ top: '-20%', left: '50%', transform: 'translateX(-50%)', width: '800px', height: '400px', background: 'radial-gradient(ellipse, rgba(249,115,22,0.18) 0%, transparent 70%)', filter: 'blur(40px)' }} />
        <div className="absolute" style={{ bottom: '-10%', right: '10%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(27,58,138,0.2) 0%, transparent 70%)', filter: 'blur(50px)' }} />
      </div>

      <div className="container-page relative z-10">
        <div className="rounded-3xl overflow-hidden relative"
          style={{ background: 'linear-gradient(135deg, rgba(27,58,138,0.4) 0%, rgba(249,115,22,0.15) 100%)', border: '1px solid rgba(249,115,22,0.2)', padding: '4rem 2rem' }}>

          {/* Inner glow top */}
          <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(249,115,22,0.6), transparent)' }} />

          <div className="text-center max-w-2xl mx-auto">

            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold mb-6"
              style={{ background: 'rgba(249,115,22,0.12)', border: '1px solid rgba(249,115,22,0.3)', color: '#FB923C' }}>
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              مشاوره رایگان در دسترس است
            </div>

            <h2 className="font-black text-white mb-4 leading-tight" style={{ fontSize: 'clamp(1.875rem, 4vw, 3rem)' }}>
              {title}
            </h2>
            <p className="mb-10 leading-loose" style={{ color: 'rgba(255,255,255,0.55)', fontSize: '1.0625rem' }}>
              {subtitle}
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link href={buttonUrl}
                className="inline-flex items-center gap-2.5 font-bold text-white rounded-xl transition-all duration-200 hover:-translate-y-0.5"
                style={{ padding: '1rem 2.5rem', fontSize: '1.0625rem', background: 'linear-gradient(135deg, #F97316, #EA580C)', boxShadow: '0 4px 24px rgba(249,115,22,0.45)' }}>
                {button}
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                </svg>
              </Link>

              {phone && (
                <a href={`tel:${phone.replace(/\D/g, '')}`}
                  className="inline-flex items-center gap-2.5 font-bold rounded-xl transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/20"
                  style={{ padding: '1rem 2rem', fontSize: '1.0625rem', background: 'rgba(255,255,255,0.1)', border: '1.5px solid rgba(255,255,255,0.2)', color: 'white' }}>
                  <svg viewBox="0 0 20 20" className="w-5 h-5" fill="currentColor">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
                  </svg>
                  {phone}
                </a>
              )}
            </div>

            {/* Trust row */}
            <div className="flex flex-wrap justify-center gap-6 mt-10">
              {['نصب رایگان', 'گارانتی ۱۸ ماهه', 'پشتیبانی ۷/۲۴', 'ارسال سراسری'].map((item, i) => (
                <div key={i} className="flex items-center gap-1.5 text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="#F97316" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                  </svg>
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* Bottom line */}
          <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(249,115,22,0.4), transparent)' }} />
        </div>
      </div>
    </section>
  )
}
