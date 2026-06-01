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
  return `${toman.toLocaleString('fa-IR')} تومان`
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

/**
 * \u0627\u0639\u062a\u0628\u0627\u0631\u0633\u0646\u062c\u06cc \u06a9\u062f \u0645\u0644\u06cc \u0627\u06cc\u0631\u0627\u0646\u06cc (\u06f1\u06f0 \u0631\u0642\u0645\u06cc \u0628\u0627 \u0627\u0644\u06af\u0648\u0631\u06cc\u062a\u0645 \u0686\u06a9\u200c\u062f\u06cc\u062c\u06cc\u062a)
 * \u0648\u0631\u0648\u062f\u06cc \u0645\u06cc\u200c\u062a\u0648\u0627\u0646\u062f \u0641\u0627\u0631\u0633\u06cc \u06cc\u0627 \u0644\u0627\u062a\u06cc\u0646 \u0628\u0627\u0634\u062f.
 */
export function isValidNationalId(input: string): boolean {
  const code = toEnDigits(String(input)).replace(/\D/g, '')
  if (!/^\d{10}$/.test(code)) return false
  // \u0631\u062f \u0627\u0631\u0642\u0627\u0645 \u062a\u06a9\u0631\u0627\u0631\u06cc (\u0645\u062b\u0644 0000000000)
  if (/^(\d)\1{9}$/.test(code)) return false
  const check = Number(code[9])
  let sum = 0
  for (let i = 0; i < 9; i++) sum += Number(code[i]) * (10 - i)
  const r = sum % 11
  return (r < 2 && check === r) || (r >= 2 && check === 11 - r)
}

/**
 * \u0627\u0639\u062a\u0628\u0627\u0631\u0633\u0646\u062c\u06cc \u0634\u0646\u0627\u0633\u0647 \u0645\u0644\u06cc \u0627\u0634\u062e\u0627\u0635 \u062d\u0642\u0648\u0642\u06cc (\u06f1\u06f1 \u0631\u0642\u0645\u06cc)
 */
export function isValidCompanyId(input: string): boolean {
  const code = toEnDigits(String(input)).replace(/\D/g, '')
  return /^\d{11}$/.test(code)
}
