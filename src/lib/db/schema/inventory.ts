import {
  pgTable, pgEnum, uuid, varchar, text, integer, timestamp, index
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { products, productVariants } from './products'
import { users } from './users'

export const inventoryTxTypeEnum = pgEnum('inventory_tx_type', [
  'sale',
  'return',
  'adjustment',
  'restock',
  'damage',
  'initial',
])

export const inventoryTransactions = pgTable('inventory_transactions', {
  id:             uuid('id').primaryKey().defaultRandom(),
  productId:      uuid('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  variantId:      uuid('variant_id').references(() => productVariants.id, { onDelete: 'set null' }),
  type:           inventoryTxTypeEnum('type').notNull(),
  quantityChange: integer('quantity_change').notNull(),
  stockAfter:     integer('stock_after').notNull(),
  referenceId:    uuid('reference_id'),
  referenceType:  varchar('reference_type', { length: 30 }),
  note:           text('note'),
  createdBy:      uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
  createdAt:      timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  index('inv_tx_product_idx').on(t.productId),
  index('inv_tx_variant_idx').on(t.variantId),
  index('inv_tx_type_idx').on(t.type),
  index('inv_tx_created_at_idx').on(t.createdAt),
  index('inv_tx_reference_idx').on(t.referenceType, t.referenceId),
])

export const lowStockAlerts = pgTable('low_stock_alerts', {
  id:            uuid('id').primaryKey().defaultRandom(),
  productId:     uuid('product_id').notNull().unique().references(() => products.id, { onDelete: 'cascade' }),
  threshold:     integer('threshold').notNull().default(5),
  lastAlertedAt: timestamp('last_alerted_at', { withTimezone: true }),
  silenceUntil:  timestamp('silence_until', { withTimezone: true }),
  createdAt:     timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  index('low_stock_product_idx').on(t.productId),
])

export const inventoryTransactionsRelations = relations(inventoryTransactions, ({ one }) => ({
  product: one(products, { fields: [inventoryTransactions.productId], references: [products.id] }),
  variant: one(productVariants, { fields: [inventoryTransactions.variantId], references: [productVariants.id] }),
  creator: one(users, { fields: [inventoryTransactions.createdBy], references: [users.id] }),
}))

export type InventoryTransaction    = typeof inventoryTransactions.$inferSelect
export type NewInventoryTransaction = typeof inventoryTransactions.$inferInsert
export type InventoryTxType         = (typeof inventoryTxTypeEnum.enumValues)[number]
export type LowStockAlert           = typeof lowStockAlerts.$inferSelect
