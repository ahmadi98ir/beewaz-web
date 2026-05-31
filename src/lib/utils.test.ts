import { describe, it, expect } from 'vitest'
import {
  formatPrice, formatToman, toFaDigits, toEnDigits,
  discountPercent, slugify,
} from './utils'

describe('formatPrice', () => {
  it('converts rial to toman (divide by 10) with Persian separators', () => {
    expect(formatPrice(1_500_000)).toBe('۱۵۰٬۰۰۰ تومان')
  })
  it('floors fractional toman', () => {
    expect(formatPrice(155)).toBe('۱۵ تومان')
  })
  it('returns dash for null/undefined/zero', () => {
    expect(formatPrice(null)).toBe('—')
    expect(formatPrice(undefined)).toBe('—')
    expect(formatPrice(0)).toBe('—')
  })
})

describe('formatToman', () => {
  it('converts rial to toman with تومان unit', () => {
    expect(formatToman(2_000_000)).toBe('۲۰۰٬۰۰۰ تومان')
  })
})

describe('toFaDigits', () => {
  it('converts Latin digits to Persian', () => {
    expect(toFaDigits('0123456789')).toBe('۰۱۲۳۴۵۶۷۸۹')
  })
  it('accepts numbers', () => {
    expect(toFaDigits(42)).toBe('۴۲')
  })
  it('leaves non-digits untouched', () => {
    expect(toFaDigits('A-5')).toBe('A-۵')
  })
})

describe('toEnDigits', () => {
  it('converts Persian digits to Latin', () => {
    expect(toEnDigits('۰۹۱۲۳۴۵۶۷۸۹')).toBe('09123456789')
  })
  it('is the inverse of toFaDigits', () => {
    expect(toEnDigits(toFaDigits('09120000000'))).toBe('09120000000')
  })
})

describe('discountPercent', () => {
  it('computes rounded percentage off (price, comparePrice)', () => {
    expect(discountPercent(800, 1000)).toBe(20)
  })
  it('returns 0 when there is no discount', () => {
    expect(discountPercent(1000, 800)).toBe(0)
    expect(discountPercent(1000, 1000)).toBe(0)
  })
})

describe('slugify', () => {
  it('lowercases and hyphenates spaces', () => {
    expect(slugify('Hello World')).toBe('hello-world')
  })
  it('keeps Persian characters', () => {
    expect(slugify('دزدگیر اماکن')).toBe('دزدگیر-اماکن')
  })
})
