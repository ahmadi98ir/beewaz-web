import {
  pgTable,
  pgEnum,
  uuid,
  text,
  integer,
  bigint,
  timestamp,
  jsonb,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { users } from './users'
import { products } from './products'

// ─── Enums ────────────────────────────────────────────────────────────────────

export const orderStatusEnum = pgEnum('order_status', [
  'pending',
  'paid',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'refunded',
])

export const paymentMethodEnum = pgEnum('payment_method', [
  'zarinpal',
  'idpay',
  'wallet',
  'cod',
])

// ─── Orders ───────────────────────────────────────────────────────────────────

export const orders = pgTable('orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'restrict' })
    .notNull(),

  status: orderStatusEnum('status').default('pending').notNull(),
  totalAmount: bigint('total_amount', { mode: 'number' }).notNull(),

  // آدرس ارسال — ذخیره snapshot در زمان سفارش
  shippingAddress: jsonb('shipping_address').$type<{
    fullName: string
    phone: string
    province: string
    city: string
    address: string
    postalCode: string
  }>(),

  paymentMethod: paymentMethodEnum('payment_method'),
  paymentRef: text('payment_ref'),      // شناسه تراکنش درگاه
  paymentAuthority: text('payment_authority'),

  notes: text('notes'),
  paidAt: timestamp('paid_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

// ─── Order Items ──────────────────────────────────────────────────────────────

export const orderItems = pgTable('order_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id')
    .references(() => orders.id, { onDelete: 'cascade' })
    .notNull(),
  productId: uuid('product_id')
    .references(() => products.id, { onDelete: 'restrict' })
    .notNull(),

  quantity: integer('quantity').notNull(),
  unitPrice: bigint('unit_price', { mode: 'number' }).notNull(),

  // snapshot محصول در لحظه خرید — برای تاریخچه سفارش
  snapshot: jsonb('snapshot').$type<{
    name: string
    sku: string
    imageUrl?: string
  }>().notNull(),
})

// ─── Relations ────────────────────────────────────────────────────────────────

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, { fields: [orders.userId], references: [users.id] }),
  items: many(orderItems),
}))

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}))

// ─── Types ────────────────────────────────────────────────────────────────────

export type Order = typeof orders.$inferSelect
export type NewOrder = typeof orders.$inferInsert
export type OrderStatus = (typeof orderStatusEnum.enumValues)[number]
export type OrderItem = typeof orderItems.$inferSelect
export type NewOrderItem = typeof orderItems.$inferInsert
