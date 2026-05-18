/**
 * صفحه درباره ما — متصل به CMS
 */

import { getCmsContent } from '@/lib/cms'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = { title: 'درباره بیواز' }

export default async function AboutPage() {
  const cms = await getCmsContent('about', {
    hero_title:        'درباره بیواز',
    hero_subtitle:     'یک دهه تجربه در امنیت اماکن ایرانی',
    story_title:       'از یک ایده تا ۱۵ هزار مشتری',
    story_text:        '<p>بیواز در سال ۱۳۹۳ با هدف تولید دزدگیرهای باکیفیت و اقتصادی برای بازار ایران تأسیس شد. امروز با بیش از ۱۵,۰۰۰ مشتری فعال، یکی از معتمدترین برندهای امنیت اماکن در کشور هستیم.</p>',
    customers_count:   '+۱۵,۰۰۰',
    experience_years:  '+۱۰',
    founded_year:      '۱۳۹۳',
  })

  const stats = [
    { label: 'مشتری راضی',      value: cms.customers_count },
    { label: 'سال تجربه',       value: cms.experience_years },
    { label: 'سال تأسیس',       value: cms.founded_year },
    { label: 'پشتیبانی',        value: '۲۴/۷' },
  ]

  return (
    <main>
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-900 to-brand-700 py-16 sm:py-24 text-center">
        <div className="container-page">
          <h1 className="text-3xl sm:text-5xl font-black text-white mb-4">{cms.hero_title}</h1>
          <p className="text-white/75 text-lg max-w-xl mx-auto">{cms.hero_subtitle}</p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-white border-b border-surface-100">
        <div className="container-page">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-3xl sm:text-4xl font-black text-brand-700 mb-1">{s.value}</p>
                <p className="text-sm text-surface-500">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-14 sm:py-20">
        <div className="container-page max-w-3xl">
          <h2 className="text-2xl sm:text-3xl font-black text-surface-900 mb-6">{cms.story_title}</h2>
          <div
            className="prose prose-lg max-w-none text-surface-600 leading-8 [&_p]:mb-4"
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: cms.story_text ?? '' }}
          />
        </div>
      </section>

      {/* Values */}
      <section className="py-14 bg-surface-50">
        <div className="container-page">
          <h2 className="text-2xl font-black text-surface-900 mb-8 text-center">ارزش‌های ما</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { icon: '🏆', title: 'کیفیت اول',       desc: 'همه محصولات از خط تولید کنترل کیفیت سختگیرانه می‌گذرند' },
              { icon: '🤝', title: 'اعتماد دوطرفه',   desc: 'گارانتی ۱۸ ماهه و پشتیبانی واقعی، نه شعار' },
              { icon: '🇮🇷', title: 'ساخت ایران',      desc: 'طراحی و مونتاژ کامل در ایران، باکیفیت و اقتصادی' },
            ].map((v) => (
              <div key={v.title} className="bg-white rounded-2xl p-6 border border-surface-100 text-center">
                <div className="text-4xl mb-4">{v.icon}</div>
                <h3 className="font-bold text-surface-900 mb-2">{v.title}</h3>
                <p className="text-sm text-surface-500 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
