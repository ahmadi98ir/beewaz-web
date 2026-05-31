/**
 * منطق محاسبه قیمت — توابع خالص و قابل تست
 * همه مبالغ به ریال
 */

export const DEFAULT_SHIPPING_COST = 150_000
export const DEFAULT_FREE_SHIPPING_THRESHOLD = 2_000_000

/** محاسبه هزینه ارسال بر اساس جمع سبد و تنظیمات */
export function calcShipping(
  subtotal: number,
  opts: { shippingCost?: number; freeThreshold?: number } = {},
): number {
  const shippingCost = opts.shippingCost ?? DEFAULT_SHIPPING_COST
  const freeThreshold = opts.freeThreshold ?? DEFAULT_FREE_SHIPPING_THRESHOLD
  if (subtotal <= 0) return 0
  return subtotal >= freeThreshold ? 0 : shippingCost
}

export interface CouponInput {
  type: 'percentage' | 'fixed'
  value: number
  maxDiscountAmount?: number | null
}

/** محاسبه مبلغ تخفیف کوپن (هرگز بیشتر از جمع سبد) */
export function calcCouponDiscount(subtotal: number, coupon: CouponInput): number {
  if (subtotal <= 0) return 0
  let discount = 0
  if (coupon.type === 'percentage') {
    discount = Math.floor((subtotal * coupon.value) / 100)
    if (coupon.maxDiscountAmount != null) {
      discount = Math.min(discount, coupon.maxDiscountAmount)
    }
  } else {
    discount = Math.min(coupon.value, subtotal)
  }
  return Math.max(0, Math.min(discount, subtotal))
}

/** محاسبه مبلغ نهایی سفارش */
export function calcOrderTotal(params: {
  subtotal: number
  shipping: number
  discount: number
}): number {
  return Math.max(0, params.subtotal + params.shipping - params.discount)
}
