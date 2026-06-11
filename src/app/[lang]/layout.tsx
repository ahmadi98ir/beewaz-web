import type { ReactNode } from 'react'
import { notFound } from 'next/navigation'
import { localeConfig, isValidLocale } from '@/lib/i18n'
import type { Locale } from '@/lib/i18n'

export function generateStaticParams() {
  return [{ lang: 'fa' }, { lang: 'en' }, { lang: 'fr' }, { lang: 'ar' }]
}

export default async function LangLayout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  if (!isValidLocale(lang)) notFound()

  const { dir } = localeConfig[lang as Locale]

  return (
    <div lang={lang} dir={dir}>
      {children}
    </div>
  )
}
