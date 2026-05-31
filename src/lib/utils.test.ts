import { describe, it, expect } from 'vitest'
import {
  formatPrice, formatToman, toFaDigits, toEnDigits,
  discountPercent, slugify, truncate,
} from './utils'

describe('formatPrice', () => {
  it('converts rial to toman (divide by 10) with Persian separators', () => {
    expect(formatPrice(1_500_000)).toBe('۱۵۰٬۰۰۰ تومان')
  })
  it('floors fractional toman', () => {
    expect(formatPrice(155)).toBe('۱۵ تومان')
  })
  it('handles zero', () => {
    expect(formatPrice(0)).toBe('۰ تومان')
  })
})

describe('formatToman', () => {
  it('returns number string without unit', () => {
    expect(formatToman(2_000_000)).toBe('۲۰۰٬۰۰۰')
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
  it('computes rounded percentage off', () => {
    expect(discountPercent(1000, 800)).toBe(20)
  })
  it('rounds to nearest integer', () => {
    expect(discountPercent(3000, 2000)).toBe(33)
  })
})

describe('slugify', () => {
  it('lowercases and hyphenates spaces', () => {
    expect(slugify('Hello World')).toBe('hello-world')
  })
})

describe('truncate', () => {
  it('truncates long text with ellipsis', () => {
    expect(truncate('abcdefgh', 4)).toBe('abcd…')
  })
  it('leaves short text alone', () => {
    expect(truncate('abc', 10)).toBe('abc')
  })
})
