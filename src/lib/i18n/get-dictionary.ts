import type { Locale } from './locales'
import type { Dictionary } from './dictionaries/fa'

const loaders: Record<Locale, () => Promise<{ default: Dictionary }>> = {
  fa: () => import('./dictionaries/fa'),
  en: () => import('./dictionaries/en'),
  fr: () => import('./dictionaries/fr'),
  ar: () => import('./dictionaries/ar'),
}

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  const mod = await loaders[locale]()
  return mod.default
}
