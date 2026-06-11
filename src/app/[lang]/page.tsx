import { redirect, notFound } from 'next/navigation'
import { isValidLocale } from '@/lib/i18n'

export default async function LangHomePage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  if (!isValidLocale(lang)) notFound()

  // fa → صفحه اصلی موجود
  if (lang === 'fa') redirect('/')

  // سایر زبان‌ها → فعلاً به فروشگاه هدایت می‌شوند (تا صفحات ترجمه شده آماده شوند)
  redirect('/shop')
}
