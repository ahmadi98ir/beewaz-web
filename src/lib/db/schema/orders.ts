/**
 * اسکیمای سفارشات
 */

import { pgTable, pgEnum, uuid, varchar, text, numeric, integer, jsonb, timestamp, boolean } from 'drizzle-orm/pg-core'
import { relations, sql } from 'drizzle-orm'
import { users } from './users'
import { products, productVariants } from './products'

// ─── Enums ────────────────────────────────────────────────────────────────────

export const orderStatusEnum = pgEnum('order_status', [
  'pending',    // در انتظار پرداخت
  'paid',       // پرداخت شده
  'processing', // در حال آماده‌سازی
  'shipped',    // ارسال شده
  'delivered',  // تحویل داده شده
  'cancelled',  // لغو شده
  'refunded',   // مسترد شده
])

export const paymentMethodEnum = pgEnum('payment_method', [
  'online',       // درگاه آنلاین
  'card_to_card', // کارت به کارت
  'cash_on_delivery', // پرداخت در محل
  'installment',  // اقساطی
])

// ─── Orders ───────────────────────────────────────────────────────────────────

export const orders = pgTable('orders', {
  id: uuid('id').primaryKey().defaultRandom(),

  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),

  /** اطلاعات ارسال */
  shippingAddress: jsonb('shipping_address').$type<{
    fullName?: string
    phone?: string
    province?: string
    city?: string
    street?: string
    alley?: string
    plaque?: string
    unit?: string
    postalCode?: string
  }>(),

  status: orderStatusEnum('status').notNull().default('pending'),
  paymentMethod: paymentMethodEnum('payment_method'),

  /** مبلغ کل به ریال */
  totalAmount: numeric('total_amount', { precision: 14, scale: 0 }).notNull().default('0'),
  /** هزینه ارسال */
  shippingAmount: numeric('shipping_amount', { precision: 14, scale: 0 }).notNull().default('0'),
  /** تخفیف */
  discountAmount: numeric('discount_amount', { precision: 14, scale: 0 }).notNull().default('0'),

  /** کد تراکنش درگاه */
  transactionId: varchar('transaction_id', { length: 100 }),
  /** کد پیگیری */
  trackingCode: varchar('tracking_code', { length: 100 }),

  /** یادداشت مشتری */
  customerNote: text('customer_note'),
  /** یادداشت داخلی ادمین */
  adminNote: text('admin_note'),

  /** کد کوپن استفاده‌شده */
  couponCode: varchar('coupon_code', { length: 50 }),

  paidAt: timestamp('paid_at', { withTimezone: true }),
  shippedAt: timestamp('shipped_at', { withTimezone: true }),
  deliveredAt: timestamp('delivered_at', { withTimezone: true }),

  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

// ─── Order Items ──────────────────────────────────────────────────────────────

export const orderItems = pgTable('order_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id')
    .notNull()
    .references(() => orders.id, { onDelete: 'cascade' }),

  productId: uuid('product_id').references(() => products.id, { onDelete: 'set null' }),
  variantId: uuid('variant_id').references(() => productVariants.id, { onDelete: 'set null' }),

  /** اطلاعات snapshot محصول در لحظه خرید */
  productName: varchar('product_name', { length: 200 }).notNull(),
  variantName: varchar('variant_name', { length: 128 }),
  sku: varchar('sku', { length: 64 }),

  quantity: integer('quantity').notNull().default(1),
  unitPrice: numeric('unit_price', { precision: 14, scale: 0 }).notNull(),
  totalPrice: numeric('total_price', { precision: 14, scale: 0 }).notNull(),

  /** snapshot مشخصات محصول */
  meta: jsonb('meta').default(sql`'{}'::jsonb`),

  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

// ─── Order Notes ─────────────────────────────────────────────────────────────

export const orderNoteTypeEnum = pgEnum('order_note_type', ['internal', 'refund', 'customer'])

export const orderNotes = pgTable('order_notes', {
  id:        uuid('id').primaryKey().defaultRandom(),
  orderId:   uuid('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  note:      text('note').notNull(),
  type:      orderNoteTypeEnum('type').notNull().default('internal'),
  createdBy: varchar('created_by', { length: 100 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

// ─── Relations ────────────────────────────────────────────────────────────────

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, { fields: [orders.userId], references: [users.id] }),
  items: many(orderItems),
  notes: many(orderNotes),
}))

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
  product: one(products, { fields: [orderItems.productId], references: [products.id] }),
  variant: one(productVariants, { fields: [orderItems.variantId], references: [productVariants.id] }),
}))

export const orderNotesRelations = relations(orderNotes, ({ one }) => ({
  order: one(orders, { fields: [orderNotes.orderId], references: [orders.id] }),
}))

// ─── Types ────────────────────────────────────────────────────────────────────

export type Order = typeof orders.$inferSelect
export type NewOrder = typeof orders.$inferInsert
export type OrderStatus = (typeof orderStatusEnum.enumValues)[number]
export type OrderItem = typeof orderItems.$inferSelect
export type NewOrderItem = typeof orderItems.$inferInsert
export type OrderNote = typeof orderNotes.$inferSelect
export type NewOrderNote = typeof orderNotes.$inferInsert
export type OrderNoteType = (typeof orderNoteTypeEnum.enumValues)[number]
