/**
 * Enum های مشترک schema
 *
 * نکته: تغییر مقادیر enum در Postgres غیرتخریبی نیست؛ هرگاه مقدار جدید
 * اضافه می‌کنید، migration جدید لازم است (drizzle خودش تولید می‌کند).
 */

import { pgEnum } from 'drizzle-orm/pg-core'

// =====================================================================
// کاربران
// =====================================================================
// نکته: نقش‌ها (role) دیگر enum نیستند — اکنون data-driven در جدول `roles`.

export const userStatusEnum = pgEnum('user_status', [
  'pending', // ثبت‌نام شده، تأیید نشده
  'active',
  'suspended',
  'banned',
])

export const otpPurposeEnum = pgEnum('otp_purpose', [
  'login',
  'register',
  'reset_password',
  'verify_phone',
  'verify_email',
])

// =====================================================================
// محصولات
// =====================================================================
export const productStatusEnum = pgEnum('product_status', [
  'draft',
  'active',
  'archived', // حذف نرم — قابل بازیابی
  'out_of_stock',
])

export const productConditionEnum = pgEnum('product_condition', [
  'new',
  'refurbished',
  'used',
])

// =====================================================================
// نظرات
// =====================================================================
export const reviewStatusEnum = pgEnum('review_status', [
  'pending',
  'approved',
  'rejected',
])
