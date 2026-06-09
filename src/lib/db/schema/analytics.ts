import {
  pgTable, uuid, varchar, integer, bigint,
  date, timestamp, boolean, jsonb, index
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { products } from './products'
import { users } from './users'

// ─── بازدید محصولات ───────────────────────────────────────────────────────────

export const productViews = pgTable('product_views', {
  id:        uuid('id').primaryKey().defaultRandom(),
  productId: uuid('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  userId:    uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  sessionId: varchar('session_id', { length: 64 }),
  source:    varchar('source', { length: 40 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  index('pv_product_idx').on(t.productId),
  index('pv_created_at_idx').on(t.createdAt),
  index('pv_session_idx').on(t.sessionId),
])

// ─── سبدهای رها شده ───────────────────────────────────────────────────────────

export const cartAbandonmentSessions = pgTable('cart_abandonment_sessions', {
  id:          uuid('id').primaryKey().defaultRandom(),
  userId:      uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  sessionId:   varchar('session_id', { length: 64 }),
  cartSnapshot: jsonb('cart_snapshot').$type<{
    items: Array<{
      productId: string
      variantId?: string
      productName: string
      quantity: number
      unitPrice: number
    }>
  }>().notNull(),
  totalAmountRial:  bigint('total_amount_rial', { mode: 'number' }).notNull(),
  itemCount:        integer('item_count').notNull(),
  recovered:        boolean('recovered').notNull().default(false),
  recoveredOrderId: uuid('recovered_order_id'),
  lastSeenAt:  timestamp('last_seen_at', { withTimezone: true }).notNull(),
  recoveredAt: timestamp('recovered_at', { withTimezone: true }),
  createdAt:   timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  index('cart_ab_user_idx').on(t.userId),
  index('cart_ab_recovered_idx').on(t.recovered),
  index('cart_ab_last_seen_idx').on(t.lastSeenAt),
])

// ─── KPI روزانه پیش‌محاسبه‌شده ────────────────────────────────────────────────

export const analyticsDailySnapshots = pgTable('analytics_daily_snapshots', {
  date:                date('date').primaryKey(),
  totalOrders:         integer('total_orders').notNull().default(0),
  paidOrders:          integer('paid_orders').notNull().default(0),
  cancelledOrders:     integer('cancelled_orders').notNull().default(0),
  revenueRial:         bigint('revenue_rial', { mode: 'number' }).notNull().default(0),
  revenueToman:        bigint('revenue_toman', { mode: 'number' }).notNull().default(0),
  aovToman:            bigint('aov_toman', { mode: 'number' }).notNull().default(0),
  newUsers:            integer('new_users').notNull().default(0),
  activeUsers:         integer('active_users').notNull().default(0),
  productViewsCount:   integer('product_views_count').notNull().default(0),
  abandonedCarts:      integer('abandoned_carts').notNull().default(0),
  recoveredCarts:      integer('recovered_carts').notNull().default(0),
  abandonedValueToman: bigint('abandoned_value_toman', { mode: 'number' }).notNull().default(0),
  conversionRateBps:   integer('conversion_rate_bps').notNull().default(0),
  computedAt:          timestamp('computed_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  index('snapshot_date_idx').on(t.date),
])

// ─── Relations ────────────────────────────────────────────────────────────────

export const productViewsRelations = relations(productViews, ({ one }) => ({
  product: one(products, { fields: [productViews.productId], references: [products.id] }),
  user:    one(users, { fields: [productViews.userId], references: [users.id] }),
}))

export const cartAbandonmentRelations = relations(cartAbandonmentSessions, ({ one }) => ({
  user: one(users, { fields: [cartAbandonmentSessions.userId], references: [users.id] }),
}))

// ─── Types ────────────────────────────────────────────────────────────────────

export type ProductView               = typeof productViews.$inferSelect
export type CartAbandonmentSession    = typeof cartAbandonmentSessions.$inferSelect
export type NewCartAbandonmentSession = typeof cartAbandonmentSessions.$inferInsert
export type AnalyticsDailySnapshot    = typeof analyticsDailySnapshots.$inferSelect
