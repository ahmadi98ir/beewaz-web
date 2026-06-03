/**
 * صفحه نمایندگی‌ها — متصل به CMS
 */

import { getCmsContent } from '@/lib/cms'
import Link from 'next/link'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'نمایندگی‌ها',
  description: 'لیست نمایندگی‌های رسمی بیواز و فرم درخواست نمایندگی فروش. شرایط، مزایا و مراحل همکاری با شبکه فروش بیواز.',
}

export default async function DealersPage() {
  const cms = await getCmsContent('dealers', {
    hero_title:    'نمایندگی‌های بیواز',
    hero_subtitle: 'شبکه گسترده نمایندگان رسمی در سراسر کشور',
    become_title:  'نماینده بیواز شوید',
    become_text:   'اگر در حوزه فروش تجهیزات امنیتی فعالیت می‌کنید و مایل به همکاری با بیواز هستید، از طریق صفحه تماس با ما درخواست خود را ثبت کنید. کارشناسان ما در اسرع وقت با شما تماس خواهند گرفت.',
  })

  const benefits = [
    { icon: '💰', title: 'حاشیه سود مناسب',    desc: 'قیمت‌گذاری پلکانی ویژه نمایندگان؛ هرچه فروش بیشتر، تخفیف بیشتر' },
    { icon: '📦', title: 'تأمین پایدار کالا',  desc: 'موجودی همیشگی انبار و ارسال سریع به سراسر کشور' },
    { icon: '🎓', title: 'آموزش فنی رایگان',   desc: 'دوره‌های نصب، راه‌اندازی و عیب‌یابی محصولات برای تیم شما' },
    { icon: '🤝', title: 'پشتیبانی اختصاصی',   desc: 'کارشناس فروش ویژه و خط پشتیبانی فنی مستقیم برای هر نماینده' },
    { icon: '🛡️', title: 'گارانتی متمرکز',     desc: 'فرآیند گارانتی و خدمات پس از فروش کاملاً توسط بیواز مدیریت می‌شود' },
    { icon: '📣', title: 'حمایت بازاریابی',    desc: 'بنر، کاتالوگ، محتوای دیجیتال و معرفی در سایت رسمی بیواز' },
  ]

  const steps = [
    { n: '۱', title: 'ثبت درخواست',   desc: 'فرم همکاری را از طریق صفحه تماس با ما تکمیل کنید' },
    { n: '۲', title: 'بررسی و تماس',  desc: 'کارشناسان ما سوابق و موقعیت شما را بررسی و با شما هماهنگ می‌کنند' },
    { n: '۳', title: 'عقد قرارداد',   desc: 'شرایط همکاری و سطح نمایندگی مشخص و قرارداد منعقد می‌شود' },
    { n: '۴', title: 'شروع همکاری',   desc: 'پنل نمایندگی فعال و اولین سفارش شما با شرایط ویژه ثبت می‌شود' },
  ]

  const requirements = [
    'داشتن مجوز کسب یا فعالیت مرتبط در حوزه تجهیزات امنیتی، برق یا الکترونیک',
    'تجربه فروش یا نصب سیستم‌های دزدگیر و حفاظتی (ترجیحی)',
    'تعهد به ارائه خدمات نصب و پشتیبانی به مشتریان نهایی',
    'حداقل سفارش اولیه طبق سطح نمایندگی توافق‌شده',
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
      <section className="py-10 bg-white border-b border-surface-100">
        <div className="container-page">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {[
              { v: '+۱۲۰', l: 'نماینده فعال' },
              { v: '۳۱',   l: 'استان تحت پوشش' },
              { v: '+۱۰',  l: 'سال تجربه برند' },
              { v: '۲۴',   l: 'ماه گارانتی محصولات' },
            ].map((s) => (
              <div key={s.l}>
                <p className="text-3xl sm:text-4xl font-black text-brand-700 mb-1">{s.v}</p>
                <p className="text-sm text-surface-500">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-14 sm:py-20">
        <div className="container-page">
          <h2 className="text-2xl sm:text-3xl font-black text-surface-900 mb-3 text-center">مزایای نمایندگی بیواز</h2>
          <p className="text-surface-500 text-center max-w-2xl mx-auto mb-10">
            ما فقط محصول نمی‌فروشیم؛ یک شراکت بلندمدت می‌سازیم. این چیزی است که با همکاری با بیواز به دست می‌آورید:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((b) => (
              <div key={b.title} className="bg-white rounded-2xl p-6 border border-surface-100 hover:shadow-card hover:-translate-y-1 transition-all">
                <div className="text-4xl mb-4">{b.icon}</div>
                <h3 className="font-bold text-surface-900 mb-2">{b.title}</h3>
                <p className="text-sm text-surface-500 leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="py-14 bg-surface-50 border-y border-surface-100">
        <div className="container-page">
          <h2 className="text-2xl font-black text-surface-900 mb-10 text-center">مراحل اخذ نمایندگی</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s) => (
              <div key={s.n} className="relative bg-white rounded-2xl p-6 border border-surface-100">
                <div className="w-11 h-11 rounded-xl bg-brand-700 text-white font-black text-lg flex items-center justify-center mb-4">
                  {s.n}
                </div>
                <h3 className="font-bold text-surface-900 mb-2">{s.title}</h3>
                <p className="text-sm text-surface-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Requirements */}
      <section className="py-14 sm:py-20">
        <div className="container-page max-w-3xl">
          <h2 className="text-2xl font-black text-surface-900 mb-6 text-center">شرایط همکاری</h2>
          <ul className="space-y-4">
            {requirements.map((r) => (
              <li key={r} className="flex items-start gap-3 bg-white rounded-xl p-4 border border-surface-100">
                <span className="mt-0.5 flex-shrink-0 w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-sm font-bold">✓</span>
                <span className="text-surface-700 leading-relaxed">{r}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 bg-surface-50">
        <div className="container-page max-w-2xl text-center">
          <h2 className="text-2xl font-black text-surface-900 mb-4">{cms.become_title}</h2>
          <p className="text-surface-600 leading-8 mb-8">{cms.become_text}</p>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center rounded-xl bg-brand-700 px-8 py-3.5 font-bold text-white hover:bg-brand-800 transition-colors"
          >
            ثبت درخواست نمایندگی
          </Link>
        </div>
      </section>
    </main>
  )
}
