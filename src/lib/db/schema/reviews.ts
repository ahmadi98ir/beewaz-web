/**
 * نظرات محصولات
 */
import { pgTable, uuid, varchar, text, integer, timestamp } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { products } from './products'
import { users } from './users'
import { orders } from './orders'

export const productReviews = pgTable('product_reviews', {
  id:        uuid('id').primaryKey().defaultRandom(),
  productId: uuid('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  userId:    uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  orderId:   uuid('order_id').references(() => orders.id, { onDelete: 'set null' }),
  rating:    integer('rating').notNull(),        // 1-5
  title:     varchar('title', { length: 200 }),
  body:      text('body'),
  status:    varchar('status', { length: 16 }).notNull().default('pending'), // pending | approved | rejected
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

export const productReviewsRelations = relations(productReviews, ({ one }) => ({
  product: one(products, { fields: [productReviews.productId], references: [products.id] }),
  user:    one(users,    { fields: [productReviews.userId],    references: [users.id] }),
  order:   one(orders,  { fields: [productReviews.orderId],   references: [orders.id] }),
}))

export type ProductReview    = typeof productReviews.$inferSelect
export type NewProductReview = typeof productReviews.$inferInsert
