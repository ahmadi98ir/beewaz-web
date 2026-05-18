import Link from 'next/link'
import type { CmsContent } from '@/lib/cms'

interface CtaSectionProps {
  cms?: CmsContent
}

export function CtaSection({ cms = {} }: CtaSectionProps) {
  const title    = cms.cta_title    ?? 'نمی‌دانید چه دزدگیری برای شما مناسب است؟'
  const subtitle = cms.cta_subtitle ?? 'کارشناسان بیواز رایگان راهنمایی می‌کنند — همین الان تماس بگیرید'
  const button   = cms.cta_button   ?? 'مشاوره رایگان'
  const buttonUrl= cms.cta_button_url ?? '/contact'
  const phone    = cms.contact_phone ?? ''

  return (
    <section className="py-16 sm:py-20">
      <div className="container-page">
        <div className="bg-gradient-to-br from-brand-700 to-brand-900 rounded-3xl px-8 py-12 sm:px-16 sm:py-16 text-center relative overflow-hidden">
          {/* Glow */}
          <div className="absolute inset-0 pointer-events-none" aria-hidden>
            <div className="absolute top-0 right-1/4 w-64 h-64 rounded-full bg-brand-400 blur-3xl opacity-20" />
            <div className="absolute bottom-0 left-1/4 w-64 h-64 rounded-full bg-white blur-3xl opacity-10" />
          </div>

          <div className="relative z-10">
            <h2 className="text-2xl sm:text-4xl font-black text-white mb-4">{title}</h2>
            <p className="text-white/75 text-lg mb-8 max-w-xl mx-auto">{subtitle}</p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href={buttonUrl}
                className="inline-flex items-center gap-2 bg-white text-brand-800 font-bold px-8 py-3.5 rounded-xl shadow-lg hover:bg-brand-50 transition-all hover:shadow-xl hover:-translate-y-0.5"
              >
                {button}
              </Link>

              {phone && (
                <a
                  href={`tel:${phone.replace(/\D/g, '')}`}
                  className="inline-flex items-center gap-2 bg-white/10 border border-white/30 text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-white/20 transition-all"
                >
                  <svg viewBox="0 0 20 20" className="w-4 h-4" fill="currentColor">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                  {phone}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
