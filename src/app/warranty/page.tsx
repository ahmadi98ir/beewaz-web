/**
 * صفحه گارانتی — متصل به CMS
 */

import { getCmsContent } from '@/lib/cms'
import Link from 'next/link'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'گارانتی و خدمات پس از فروش',
  description: 'شرایط گارانتی ۲۴ ماهه محصولات بیواز، موارد تحت پوشش، خدمات پس از فروش و راهنمای گام‌به‌گام استفاده از گارانتی.',
}

export default async function WarrantyPage() {
  const cms = await getCmsContent('warranty', {
    hero_title:      'گارانتی و خدمات پس از فروش',
    hero_subtitle:   'پشتیبانی واقعی، نه شعار',
    warranty_months: '۲۴',
  })

  const highlights = [
    { icon: '🛡️', title: `گارانتی ${cms.warranty_months} ماهه`, desc: 'پوشش کامل نقص فنی ناشی از تولید' },
    { icon: '🔧', title: 'تعمیر تخصصی',   desc: 'تیم فنی مجرب و استفاده از قطعات اصل' },
    { icon: '📞', title: 'پشتیبانی ۲۴/۷', desc: 'پاسخگویی در تمام ساعات شبانه‌روز' },
    { icon: '🚚', title: 'خدمات سراسری',  desc: 'پوشش گارانتی در تمام استان‌های کشور' },
  ]

  const covered = [
    'نقص فنی قطعات الکترونیکی برد و پنل مرکزی',
    'خرابی ناشی از فرآیند تولید و مونتاژ',
    'اختلال در عملکرد حسگرها در شرایط استفاده عادی',
    'ایراد در ماژول‌های ارتباطی (GSM / WiFi / RF)',
    'خرابی منبع تغذیه و مدار شارژ باتری',
  ]

  const notCovered = [
    'آسیب فیزیکی، شکستگی، ضربه یا نفوذ آب و رطوبت',
    'نصب نادرست توسط افراد غیرمتخصص',
    'دستکاری، باز کردن یا تعمیر توسط اشخاص غیرمجاز',
    'آسیب ناشی از نوسان شدید برق یا صاعقه (بدون محافظ ولتاژ)',
    'فرسودگی طبیعی باتری پس از پایان عمر مفید',
  ]

  const steps = [
    { n: '۱', title: 'تماس با پشتیبانی', desc: 'با شماره پشتیبانی تماس بگیرید یا درخواست خود را در صفحه تماس با ما ثبت کنید' },
    { n: '۲', title: 'بررسی اولیه',      desc: 'کارشناس فنی مشکل را از راه دور بررسی و راهنمایی می‌کند' },
    { n: '۳', title: 'ارجاع به تعمیر',   desc: 'در صورت نیاز، دستگاه به مرکز خدمات ارجاع یا تکنسین اعزام می‌شود' },
    { n: '۴', title: 'تعمیر یا تعویض',   desc: 'مشکل به‌صورت رایگان رفع و دستگاه به شما بازگردانده می‌شود' },
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

      {/* Highlights */}
      <section className="py-12 bg-surface-50 border-b border-surface-100">
        <div className="container-page">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {highlights.map((h) => (
              <div key={h.title} className="bg-white rounded-2xl p-6 border border-surface-100 text-center">
                <div className="text-4xl mb-4">{h.icon}</div>
                <h3 className="font-bold text-surface-900 mb-2">{h.title}</h3>
                <p className="text-sm text-surface-500 leading-relaxed">{h.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Intro */}
      <section className="py-14 sm:py-20">
        <div className="container-page max-w-3xl text-center">
          <h2 className="text-2xl sm:text-3xl font-black text-surface-900 mb-5">
            گارانتی {cms.warranty_months} ماهه بیواز
          </h2>
          <p className="text-surface-600 leading-8">
            تمام محصولات بیواز با گارانتی {cms.warranty_months} ماهه عرضه می‌شوند. ما به کیفیت محصولاتمان
            باور داریم؛ به همین دلیل در صورت بروز هرگونه نقص فنی ناشی از تولید، تعمیر یا تعویض به‌صورت
            کاملاً رایگان انجام می‌شود. هدف ما این است که شما با خیال راحت از سیستم امنیتی خود استفاده کنید.
          </p>
        </div>
      </section>

      {/* Covered / Not covered */}
      <section className="pb-16">
        <div className="container-page">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Covered */}
            <div className="bg-white rounded-2xl p-7 border border-green-100">
              <h3 className="flex items-center gap-2 text-lg font-black text-surface-900 mb-5">
                <span className="w-8 h-8 rounded-lg bg-green-100 text-green-600 flex items-center justify-center">✓</span>
                موارد تحت پوشش
              </h3>
              <ul className="space-y-3">
                {covered.map((c) => (
                  <li key={c} className="flex items-start gap-2.5 text-surface-700 leading-relaxed text-sm">
                    <span className="mt-1 text-green-500">●</span>
                    {c}
                  </li>
                ))}
              </ul>
            </div>

            {/* Not covered */}
            <div className="bg-white rounded-2xl p-7 border border-red-100">
              <h3 className="flex items-center gap-2 text-lg font-black text-surface-900 mb-5">
                <span className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">✕</span>
                موارد خارج از پوشش
              </h3>
              <ul className="space-y-3">
                {notCovered.map((c) => (
                  <li key={c} className="flex items-start gap-2.5 text-surface-700 leading-relaxed text-sm">
                    <span className="mt-1 text-red-400">●</span>
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="py-14 bg-surface-50 border-y border-surface-100">
        <div className="container-page">
          <h2 className="text-2xl font-black text-surface-900 mb-10 text-center">
            نحوه استفاده از گارانتی
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s) => (
              <div key={s.n} className="bg-white rounded-2xl p-6 border border-surface-100">
                <div className="w-11 h-11 rounded-xl bg-brand-700 text-white font-black text-lg flex items-center justify-center mb-4">
                  {s.n}
                </div>
                <h3 className="font-bold text-surface-900 mb-2">{s.title}</h3>
                <p className="text-sm text-surface-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-surface-500 mt-8">
            💡 لطفاً فاکتور خرید و کارت گارانتی را تا پایان دوره نزد خود نگه دارید.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-14">
        <div className="container-page max-w-2xl text-center">
          <h2 className="text-2xl font-black text-surface-900 mb-4">به کمک نیاز دارید؟</h2>
          <p className="text-surface-600 leading-8 mb-8">
            تیم خدمات پس از فروش بیواز آماده پاسخگویی به سوالات شما درباره گارانتی، تعمیر و نگهداری است.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center rounded-xl bg-brand-700 px-8 py-3.5 font-bold text-white hover:bg-brand-800 transition-colors"
          >
            ثبت درخواست خدمات
          </Link>
        </div>
      </section>
    </main>
  )
}
