/**
 * Utility helpers
 */

import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatToman(rial: string | number): string {
  const num = typeof rial === 'string' ? Number.parseInt(rial, 10) : rial
  if (Number.isNaN(num)) return '—'
  const toman = Math.floor(num / 10)
  return `${toman.toLocaleString('fa-IR')} تومان`
}

export function toFaDigits(input: string | number): string {
  const enToFa = ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹']
  return String(input).replace(/[0-9]/g, (d) => enToFa[Number.parseInt(d, 10)] ?? d)
}

export function toEnDigits(input: string): string {
  return input
    .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
}

export function normalizeFa(input: string): string {
  return input
    .replace(/ي/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/ۀ/g, 'ه')
    .replace(/[ًٌٍَُِّْٰ]/g, '')
    .toLowerCase()
    .trim()
}

export function formatPrice(amount: string | number | null | undefined): string {
  if (amount === null || amount === undefined) return '—'
  const num = typeof amount === 'string' ? Number.parseFloat(amount) : amount
  if (Number.isNaN(num) || num === 0) return '—'
  const toman = Math.floor(num / 10)
  if (toman >= 1_000_000) return `${toFaDigits((toman / 1_000_000).toFixed(1))}م ت`
  if (toman >= 1_000) return `${toFaDigits((toman / 1_000).toFixed(0))}ه ت`
  return `${toman.toLocaleString('fa-IR')} ت`
}

/**
 * Calculate discount percentage between price and comparePrice
 * discountPercent(15000000, 18000000) => 17
 */
export function discountPercent(
  price: number | null | undefined,
  comparePrice: number | null | undefined
): number {
  if (!price || !comparePrice || comparePrice <= price) return 0
  return Math.round(((comparePrice - price) / comparePrice) * 100)
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\u0600-\u06ff-]/g, '')
    .replace(/-+/g, '-')
}
