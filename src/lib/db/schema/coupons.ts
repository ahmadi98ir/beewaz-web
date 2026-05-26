/**
 * اسکیمای کوپن و تخفیف
 */
import { pgTable, pgEnum, uuid, varchar, numeric, integer, boolean, timestamp } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { users } from './users'
import { orders } from './orders'

// ─── Enums ────────────────────────────────────────────────────────────────────

export const couponTypeEnum = pgEnum('coupon_type', [
  'percentage', // درصدی
  'fixed',      // مبلغ ثابت (ریال)
])

// ─── Coupons ──────────────────────────────────────────────────────────────────

export const coupons = pgTable('coupons', {
  id: uuid('id').primaryKey().defaultRandom(),

  /** کد کوپن — یکتا، بزرگ، بدون فاصله */
  code: varchar('code', { length: 50 }).unique().notNull(),

  /** نوع تخفیف */
  type: couponTypeEnum('type').notNull(),

  /** مقدار: برای percentage => عدد 1-100 | برای fixed => مبلغ ریال */
  value: numeric('value', { precision: 10, scale: 2 }).notNull(),

  /** حداقل مبلغ سفارش برای استفاده (ریال) */
  minOrderAmount: numeric('min_order_amount', { precision: 14, scale: 0 }),

  /** حداکثر مبلغ تخفیف برای نوع درصدی (ریال) */
  maxDiscountAmount: numeric('max_discount_amount', { precision: 14, scale: 0 }),

  /** حداکثر تعداد کل استفاده (null = بی‌نهایت) */
  usageLimit: integer('usage_limit'),

  /** تعداد استفاده‌های فعلی */
  usageCount: integer('usage_count').notNull().default(0),

  /** حداکثر استفاده هر کاربر */
  perUserLimit: integer('per_user_limit').default(1),

  /** تاریخ انقضا */
  expiresAt: timestamp('expires_at', { withTimezone: true }),

  /** فعال / غیرفعال */
  active: boolean('active').notNull().default(true),

  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

// ─── Coupon Usages ────────────────────────────────────────────────────────────

export const couponUsages = pgTable('coupon_usages', {
  id: uuid('id').primaryKey().defaultRandom(),
  couponId: uuid('coupon_id').notNull().references(() => coupons.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  orderId: uuid('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  discountAmount: numeric('discount_amount', { precision: 14, scale: 0 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

// ─── Relations ────────────────────────────────────────────────────────────────

export const couponsRelations = relations(coupons, ({ many }) => ({
  usages: many(couponUsages),
}))

export const couponUsagesRelations = relations(couponUsages, ({ one }) => ({
  coupon: one(coupons, { fields: [couponUsages.couponId], references: [coupons.id] }),
  user: one(users, { fields: [couponUsages.userId], references: [users.id] }),
  order: one(orders, { fields: [couponUsages.orderId], references: [orders.id] }),
}))

// ─── Types ────────────────────────────────────────────────────────────────────

export type Coupon = typeof coupons.$inferSelect
export type NewCoupon = typeof coupons.$inferInsert
export type CouponType = (typeof couponTypeEnum.enumValues)[number]
export type CouponUsage = typeof couponUsages.$inferSelect
