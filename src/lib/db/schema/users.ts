import {
  pgTable, uuid, varchar, text, boolean, timestamp, jsonb
} from 'drizzle-orm/pg-core'

// ─── Table ──────────────────────────────────────────────────────────────────────────────

type ShippingAddress = {
  fullName?: string; province?: string; city?: string
  street?: string; alley?: string; plaque?: string; unit?: string; postalCode?: string
}

// نوع مشتری: حقیقی یا حقوقی
type CustomerType = 'individual' | 'legal'

// اطلاعات صورتحساب رسمی (برای فاکتور رسمی)
type BillingInfo = {
  customerType?: CustomerType
  // شخص حقیقی
  nationalId?: string          // کد ملی ۱۰ رقمی
  // شخص حقوقی
  companyName?: string         // نام شرکت
  companyNationalId?: string   // شناسه ملی شرکت
  economicCode?: string        // کد اقتصادی
  registrationNumber?: string  // شماره ثبت
  legalAddress?: string        // نشانی قانونی
  legalPostalCode?: string     // کد پستی قانونی
}

// نکته: ستون role از enum به varchar تبدیل شده تا نقش‌ها data-driven باشند
// (لیست نقش‌ها در جدول roles نگه‌داری می‌شود، نه در enum پستگرس).
export const users = pgTable('users', {
  id:                   uuid('id').primaryKey().defaultRandom(),
  phone:                varchar('phone', { length: 15 }).unique().notNull(),
  email:                varchar('email', { length: 255 }).unique(),
  fullName:             varchar('full_name', { length: 100 }),
  role:                 varchar('role', { length: 30 }).default('customer').notNull(),
  passwordHash:         text('password_hash'),
  isVerified:           boolean('is_verified').default(false).notNull(),
  lastShippingAddress:  jsonb('last_shipping_address').$type<ShippingAddress>(),
  billingInfo:          jsonb('billing_info').$type<BillingInfo>(),
  createdAt:            timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt:            timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

// ─── Types ──────────────────────────────────────────────────────────────────────────────

export type User    = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type UserRole = string
export type { CustomerType, BillingInfo }
