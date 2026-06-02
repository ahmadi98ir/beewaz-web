/**
 * صفحه گارانتی — متصل به CMS
 */

import { getCmsContent } from '@/lib/cms'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'گارانتی و خدمات پس از فروش',
  description: 'شرایط گارانتی محصولات بیواز، خدمات پس از فروش و نحوه استفاده از گارانتی.',
}

export default async function WarrantyPage() {
  const cms = await getCmsContent('warranty', {
    hero_title:    'گارانتی و خدمات پس از فروش',
    hero_subtitle: 'پشتیبانی واقعی، نه شعار',
    warranty_months: '۱۸',
    body: `
      <h2>گارانتی ۱۸ ماهه</h2>
      <p>تمام محصولات بیواز با گارانتی ۱۸ ماهه عرضه می‌شوند. در صورت بروز هرگونه نقص فنی ناشی از تولید، تعمیر یا تعویض رایگان انجام می‌شود.</p>

      <h2>موارد تحت پوشش</h2>
      <ul>
        <li>نقص فنی قطعات الکترونیکی</li>
        <li>خرابی ناشی از فرآیند تولید</li>
        <li>اختلال در عملکرد در شرایط استفاده عادی</li>
      </ul>

      <h2>موارد خارج از پوشش</h2>
      <ul>
        <li>آسیب فیزیکی، شکستگی یا نفوذ آب</li>
        <li>نصب نادرست توسط افراد غیرمتخصص</li>
        <li>دستکاری یا باز کردن دستگاه</li>
      </ul>

      <h2>نحوه استفاده از گارانتی</h2>
      <p>برای استفاده از خدمات گارانتی، کافیست با شماره پشتیبانی تماس بگیرید یا از طریق صفحه «تماس با ما» درخواست خود را ثبت کنید. لطفاً فاکتور خرید را نزد خود نگه دارید.</p>
    `,
  })

  const highlights = [
    { icon: '🛡️', title: `گارانتی ${cms.warranty_months} ماهه`, desc: 'پوشش کامل نقص فنی' },
    { icon: '🔧', title: 'تعمیر تخصصی',  desc: 'تیم فنی مجرب و قطعات اصل' },
    { icon: '📞', title: 'پشتیبانی ۲۴/۷', desc: 'پاسخگویی در تمام ساعات' },
  ]

  return (
    <main>
      <section className="bg-gradient-to-br from-brand-900 to-brand-700 py-16 sm:py-24 text-center">
        <div className="container-page">
          <h1 className="text-3xl sm:text-5xl font-black text-white mb-4">{cms.hero_title}</h1>
          <p className="text-white/75 text-lg max-w-xl mx-auto">{cms.hero_subtitle}</p>
        </div>
      </section>

      <section className="py-12 bg-surface-50 border-b border-surface-100">
        <div className="container-page">
          <div className="grid sm:grid-cols-3 gap-6">
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

      <section className="py-14 sm:py-20">
        <div className="container-page max-w-3xl">
          <div
            className="prose prose-lg max-w-none text-surface-600 leading-8 [&_h2]:text-surface-900 [&_h2]:font-black [&_h2]:text-xl [&_h2]:mt-8 [&_h2]:mb-3 [&_p]:mb-4 [&_ul]:list-disc [&_ul]:pr-6 [&_ul]:mb-4 [&_li]:mb-1.5"
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: cms.body ?? '' }}
          />
        </div>
      </section>
    </main>
  )
}
