import Link from 'next/link'
import type { CmsContent } from '@/lib/cms'

// ویژگی‌های پیش‌فرض Hero
const DEFAULT_FEATURES = ['گارانتی ۱۸ ماهه', 'نصب رایگان', 'پشتیبانی ۲۴/۷']

interface HeroProps {
  cms?: CmsContent
}

export function Hero({ cms = {} }: HeroProps) {
  const badge        = cms.hero_badge        ?? '🔒 بیش از ۱۵,۰۰۰ مشتری راضی'
  const title        = cms.hero_title        ?? 'امنیت خانه و کسب‌وکار\nرا به بیواز بسپارید'
  const subtitle     = cms.hero_subtitle     ?? 'سیستم‌های دزدگیر هوشمند ایرانی با ۱۰ سال سابقه، گارانتی ۱۸ ماهه و پشتیبانی ۲۴ ساعته'
  const ctaPrimary   = cms.hero_cta_primary  ?? 'مشاوره رایگان'
  const ctaPrimaryUrl= cms.hero_cta_primary_url ?? '/contact'
  const ctaSecondary = cms.hero_cta_secondary ?? 'مشاهده محصولات'
  const ctaSecondaryUrl = cms.hero_cta_secondary_url ?? '/shop'

  // ویژگی‌ها — اگر در CMS هستند با newline جدا شده‌اند
  const features = cms.hero_features
    ? cms.hero_features.split('\n').filter(Boolean)
    : DEFAULT_FEATURES

  // عنوان با newline به <br> تبدیل می‌شود
  const titleLines = title.split('\n')

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-brand-900 via-brand-800 to-brand-700 pt-16 pb-20 sm:pt-20 sm:pb-28">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none select-none" aria-hidden>
        <div className="absolute top-10 right-10 w-72 h-72 rounded-full bg-white blur-3xl" />
        <div className="absolute bottom-10 left-20 w-64 h-64 rounded-full bg-brand-300 blur-3xl" />
      </div>

      <div className="container-page relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 text-sm text-white/90 font-medium mb-6">
            {badge}
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight mb-5">
            {titleLines.map((line, i) => (
              <span key={i}>
                {line}
                {i < titleLines.length - 1 && <br />}
              </span>
            ))}
          </h1>

          {/* Subtitle */}
          <p className="text-lg text-white/75 leading-relaxed mb-8 max-w-2xl mx-auto">
            {subtitle}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-10">
            <Link
              href={ctaPrimaryUrl}
              className="inline-flex items-center gap-2 bg-white text-brand-800 font-bold px-7 py-3.5 rounded-xl shadow-lg hover:bg-brand-50 transition-all hover:shadow-xl hover:-translate-y-0.5"
            >
              {ctaPrimary}
              <svg viewBox="0 0 20 20" className="w-4 h-4 rotate-180" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </Link>
            <Link
              href={ctaSecondaryUrl}
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/30 text-white font-semibold px-7 py-3.5 rounded-xl hover:bg-white/20 transition-all"
            >
              {ctaSecondary}
            </Link>
          </div>

          {/* Features */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {features.map((f, i) => (
              <span key={i} className="flex items-center gap-1.5 text-sm text-white/70">
                <svg viewBox="0 0 20 20" className="w-4 h-4 text-green-400 flex-shrink-0" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {f}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
