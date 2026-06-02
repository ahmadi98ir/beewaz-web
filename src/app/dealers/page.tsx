/**
 * صفحه نمایندگی‌ها — متصل به CMS
 */

import { getCmsContent } from '@/lib/cms'
import Link from 'next/link'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'نمایندگی‌ها',
  description: 'لیست نمایندگی‌های رسمی بیواز و فرم درخواست نمایندگی فروش.',
}

export default async function DealersPage() {
  const cms = await getCmsContent('dealers', {
    hero_title:    'نمایندگی‌های بیواز',
    hero_subtitle: 'شبکه گسترده نمایندگان رسمی در سراسر کشور',
    become_title:  'نماینده بیواز شوید',
    become_text:   'اگر در حوزه فروش تجهیزات امنیتی فعالیت می‌کنید و مایل به همکاری با بیواز هستید، از طریق صفحه تماس با ما درخواست خود را ثبت کنید. کارشناسان ما در اسرع وقت با شما تماس خواهند گرفت.',
  })

  const benefits = [
    { icon: '💰', title: 'حاشیه سود مناسب',   desc: 'قیمت‌گذاری ویژه نمایندگان' },
    { icon: '📦', title: 'تأمین پایدار کالا', desc: 'موجودی همیشگی و ارسال سریع' },
    { icon: '🎓', title: 'آموزش فنی',         desc: 'دوره‌های نصب و پشتیبانی محصول' },
    { icon: '🤝', title: 'پشتیبانی اختصاصی',  desc: 'کارشناس فروش ویژه هر نماینده' },
  ]

  return (
    <main>
      <section className="bg-gradient-to-br from-brand-900 to-brand-700 py-16 sm:py-24 text-center">
        <div className="container-page">
          <h1 className="text-3xl sm:text-5xl font-black text-white mb-4">{cms.hero_title}</h1>
          <p className="text-white/75 text-lg max-w-xl mx-auto">{cms.hero_subtitle}</p>
        </div>
      </section>

      <section className="py-14 sm:py-20">
        <div className="container-page">
          <h2 className="text-2xl sm:text-3xl font-black text-surface-900 mb-8 text-center">مزایای نمایندگی</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((b) => (
              <div key={b.title} className="bg-white rounded-2xl p-6 border border-surface-100 text-center">
                <div className="text-4xl mb-4">{b.icon}</div>
                <h3 className="font-bold text-surface-900 mb-2">{b.title}</h3>
                <p className="text-sm text-surface-500 leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

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
