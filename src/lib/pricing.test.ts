import { describe, it, expect } from 'vitest'
import {
  calcShipping, calcCouponDiscount, calcOrderTotal,
  DEFAULT_SHIPPING_COST, DEFAULT_FREE_SHIPPING_THRESHOLD,
} from './pricing'

describe('calcShipping', () => {
  it('charges default shipping below threshold', () => {
    expect(calcShipping(1_000_000)).toBe(DEFAULT_SHIPPING_COST)
  })
  it('is free at or above threshold', () => {
    expect(calcShipping(DEFAULT_FREE_SHIPPING_THRESHOLD)).toBe(0)
    expect(calcShipping(DEFAULT_FREE_SHIPPING_THRESHOLD + 1)).toBe(0)
  })
  it('is free for empty/zero cart', () => {
    expect(calcShipping(0)).toBe(0)
  })
  it('honors custom config from settings', () => {
    expect(calcShipping(500_000, { shippingCost: 80_000, freeThreshold: 1_000_000 })).toBe(80_000)
    expect(calcShipping(1_000_000, { shippingCost: 80_000, freeThreshold: 1_000_000 })).toBe(0)
  })
})

describe('calcCouponDiscount', () => {
  it('applies percentage discount', () => {
    expect(calcCouponDiscount(1_000_000, { type: 'percentage', value: 20 })).toBe(200_000)
  })
  it('caps percentage discount at maxDiscountAmount', () => {
    expect(calcCouponDiscount(1_000_000, { type: 'percentage', value: 50, maxDiscountAmount: 100_000 })).toBe(100_000)
  })
  it('applies fixed discount', () => {
    expect(calcCouponDiscount(1_000_000, { type: 'fixed', value: 300_000 })).toBe(300_000)
  })
  it('never exceeds the subtotal (fixed)', () => {
    expect(calcCouponDiscount(50_000, { type: 'fixed', value: 300_000 })).toBe(50_000)
  })
  it('returns 0 for empty cart', () => {
    expect(calcCouponDiscount(0, { type: 'percentage', value: 20 })).toBe(0)
  })
})

describe('calcOrderTotal', () => {
  it('sums subtotal + shipping - discount', () => {
    expect(calcOrderTotal({ subtotal: 1_000_000, shipping: 150_000, discount: 200_000 })).toBe(950_000)
  })
  it('never goes negative', () => {
    expect(calcOrderTotal({ subtotal: 100_000, shipping: 0, discount: 500_000 })).toBe(0)
  })
})
