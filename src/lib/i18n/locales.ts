export const locales = ['fa', 'en', 'fr', 'ar'] as const
export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = 'fa'

export const localeConfig: Record<Locale, { label: string; dir: 'rtl' | 'ltr'; flag: string }> = {
  fa: { label: 'فارسی',   dir: 'rtl', flag: '🇮🇷' },
  en: { label: 'English', dir: 'ltr', flag: '🇬🇧' },
  fr: { label: 'Français',dir: 'ltr', flag: '🇫🇷' },
  ar: { label: 'العربية', dir: 'rtl', flag: '🇸🇦' },
}

export function isValidLocale(v: unknown): v is Locale {
  return locales.includes(v as Locale)
}
