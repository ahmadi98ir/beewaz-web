/**
 * صفحه شرایط استفاده — متصل به CMS
 */

import { getCmsContent } from '@/lib/cms'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'شرایط استفاده',
  description: 'قوانین و شرایط استفاده از خدمات و فروشگاه اینترنتی بیواز.',
}

export default async function TermsPage() {
  const cms = await getCmsContent('terms', {
    hero_title:    'شرایط و قوانین استفاده',
    hero_subtitle: 'لطفاً پیش از خرید این شرایط را مطالعه کنید',
    body: `
      <h2>۱. پذیرش شرایط</h2>
      <p>با ثبت سفارش در فروشگاه بیواز، شما تمام شرایط و قوانین مندرج در این صفحه را می‌پذیرید.</p>

      <h2>۲. ثبت سفارش و پرداخت</h2>
      <p>قیمت‌ها به تومان و شامل مالیات بر ارزش افزوده هستند. پس از ثبت سفارش و پرداخت موفق، سفارش شما پردازش و آماده ارسال می‌شود.</p>

      <h2>۳. ارسال کالا</h2>
      <p>زمان ارسال بسته به موقعیت جغرافیایی متفاوت است. هزینه ارسال برای سفارش‌های بالای سقف مشخص رایگان است.</p>

      <h2>۴. بازگشت و تعویض کالا</h2>
      <p>در صورت وجود مغایرت یا نقص فنی، امکان بازگشت یا تعویض کالا مطابق قوانین حمایت از حقوق مصرف‌کننده فراهم است.</p>

      <h2>۵. مسئولیت‌ها</h2>
      <p>بیواز متعهد به ارائه کالای اصل و باکیفیت است. نصب نادرست یا استفاده خارج از دستورالعمل، مشمول گارانتی نمی‌شود.</p>

      <h2>۶. تغییر شرایط</h2>
      <p>بیواز حق تغییر این شرایط را در هر زمان محفوظ می‌دارد. تغییرات از زمان انتشار در این صفحه معتبر خواهند بود.</p>
    `,
  })

  return (
    <main>
      <section className="bg-gradient-to-br from-brand-900 to-brand-700 py-16 sm:py-24 text-center">
        <div className="container-page">
          <h1 className="text-3xl sm:text-5xl font-black text-white mb-4">{cms.hero_title}</h1>
          <p className="text-white/75 text-lg max-w-xl mx-auto">{cms.hero_subtitle}</p>
        </div>
      </section>

      <section className="py-14 sm:py-20">
        <div className="container-page max-w-3xl">
          <div
            className="prose prose-lg max-w-none text-surface-600 leading-8 [&_h2]:text-surface-900 [&_h2]:font-black [&_h2]:text-xl [&_h2]:mt-8 [&_h2]:mb-3 [&_p]:mb-4"
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: cms.body ?? '' }}
          />
        </div>
      </section>
    </main>
  )
}
