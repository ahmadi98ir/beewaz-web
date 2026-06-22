/**
 * علاقه‌مندی‌ها (Wishlist)
 */
import { pgTable, uuid, timestamp, unique, index } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { products } from './products'
import { users } from './users'

export const wishlistItems = pgTable('wishlist_items', {
  id:        uuid('id').primaryKey().defaultRandom(),
  userId:    uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  productId: uuid('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  unique('wishlist_user_product_uq').on(t.userId, t.productId),
  index('wishlist_user_idx').on(t.userId),
])

export const wishlistItemsRelations = relations(wishlistItems, ({ one }) => ({
  user:    one(users,   { fields: [wishlistItems.userId],    references: [users.id] }),
  product: one(products, { fields: [wishlistItems.productId], references: [products.id] }),
}))

export type WishlistItem    = typeof wishlistItems.$inferSelect
export type NewWishlistItem = typeof wishlistItems.$inferInsert
