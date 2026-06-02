/**
 * صفحه حریم خصوصی — متصل به CMS
 */

import { getCmsContent } from '@/lib/cms'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'حریم خصوصی',
  description: 'سیاست حفظ حریم خصوصی و نحوه استفاده از اطلاعات کاربران در بیواز.',
}

export default async function PrivacyPage() {
  const cms = await getCmsContent('privacy', {
    hero_title:    'سیاست حریم خصوصی',
    hero_subtitle: 'حفاظت از اطلاعات شما برای ما در اولویت است',
    body: `
      <h2>۱. اطلاعاتی که جمع‌آوری می‌کنیم</h2>
      <p>برای ارائه خدمات بهتر، ممکن است اطلاعاتی مانند نام، شماره موبایل، آدرس و سابقه سفارش‌های شما را جمع‌آوری کنیم. این اطلاعات تنها برای پردازش سفارش و بهبود تجربه خرید استفاده می‌شوند.</p>

      <h2>۲. نحوه استفاده از اطلاعات</h2>
      <p>اطلاعات شما برای پردازش سفارش‌ها، ارسال کالا، اطلاع‌رسانی وضعیت سفارش و پشتیبانی مشتری به کار می‌رود. ما هرگز اطلاعات شخصی شما را به اشخاص ثالث نمی‌فروشیم.</p>

      <h2>۳. امنیت اطلاعات</h2>
      <p>تمام تراکنش‌های پرداخت از طریق درگاه‌های امن بانکی انجام می‌شود و اطلاعات حساس شما به‌صورت رمزنگاری‌شده نگهداری می‌گردد.</p>

      <h2>۴. کوکی‌ها</h2>
      <p>این وب‌سایت از کوکی‌ها برای حفظ نشست ورود و بهبود عملکرد استفاده می‌کند. با ادامه استفاده از سایت، استفاده از کوکی‌ها را می‌پذیرید.</p>

      <h2>۵. تماس با ما</h2>
      <p>در صورت هرگونه سؤال درباره سیاست حریم خصوصی، از طریق صفحه «تماس با ما» با تیم پشتیبانی در ارتباط باشید.</p>
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
