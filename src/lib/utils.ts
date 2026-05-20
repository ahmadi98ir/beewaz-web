/**
 * ابزارهای کمکی عمومی
 */

import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * ادغام کلاس‌های Tailwind با حل تداخل
 *
 * استفاده:
 *   cn('px-2', condition && 'px-4', 'text-sm')
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * فرمت قیمت ریال به تومان با جداکننده فارسی
 *
 * formatToman('8500000') → '۸۵۰٬۰۰۰ تومان'
 */
export function formatToman(rial: string | number): string {
  const num = typeof rial === 'string' ? Number.parseInt(rial, 10) : rial
  if (Number.isNaN(num)) return '—'
  const toman = Math.floor(num / 10)
  return `${toman.toLocaleString('fa-IR')} تومان`
}

/**
 * تبدیل اعداد انگلیسی به فارسی
 */
export function toFaDigits(input: string | number): string {
  const enToFa = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']
  return String(input).replace(/[0-9]/g, (d) => enToFa[Number.parseInt(d, 10)] ?? d)
}

/**
 * تبدیل اعداد فارسی/عربی به انگلیسی (برای ورودی‌های فرم)
 */
export function toEnDigits(input: string): string {
  return input
    .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
}

/**
 * نرمال‌سازی متن فارسی (تطبیق با تابع SQL در trigger)
 * ي عربی → ی، ك عربی → ک
 */
export function normalizeFa(input: string): string {
  return input
    .replace(/ي/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/ۀ/g, 'ه')
    .replace(/[ًٌٍَُِّْٰ]/g, '') // حذف اعراب
    .toLowerCase()
    .trim()
}

/**
 * فرمت قیمت کوتاه برای نمایش در جداول داشبورد
 *
 * formatPrice('8500000') → '850K ت'
 * formatPrice('150000000') → '15.0M ت'
 */
export function formatPrice(amount: string | number | null | undefined): string {
  if (amount === null || amount === undefined) return '—'
  const num = typeof amount === 'string' ? Number.parseFloat(amount) : amount
  if (Number.isNaN(num) || num === 0) return '—'
  const toman = Math.floor(num / 10)
  if (toman >= 1_000_000) return `${(toman / 1_000_000).toFixed(1)}M ت`
  if (toman >= 1_000) return `${(toman / 1_000).toFixed(0)}K ت`
  return `${toman.toLocaleString('fa-IR')} ت`
}
