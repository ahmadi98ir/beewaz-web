import { pgTable, pgEnum, uuid, varchar, text, integer, timestamp, index } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { users } from './users'
import { products } from './products'

export const serialStatusEnum = pgEnum('serial_status', ['unregistered', 'active', 'expired'])
export const warrantyStatusEnum = pgEnum('warranty_status', ['active', 'claimed', 'expired'])

export const productSerials = pgTable('product_serials', {
  id: uuid('id').primaryKey().defaultRandom(),
  productId: uuid('product_id').references(() => products.id, { onDelete: 'set null' }),
  serialNumber: varchar('serial_number', { length: 100 }).notNull().unique(),
  status: serialStatusEnum('status').notNull().default('unregistered'),
  generatedAt: timestamp('generated_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  index('ps_product_id_idx').on(t.productId),
  index('ps_serial_number_idx').on(t.serialNumber),
  index('ps_status_idx').on(t.status),
])

export const warranties = pgTable('warranties', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  serialNumberId: uuid('serial_number_id').notNull().references(() => productSerials.id, { onDelete: 'cascade' }),
  activatedAt: timestamp('activated_at', { withTimezone: true }).defaultNow().notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  status: warrantyStatusEnum('status').notNull().default('active'),
  invoiceFile: text('invoice_file'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  index('w_user_id_idx').on(t.userId),
  index('w_serial_id_idx').on(t.serialNumberId),
  index('w_status_idx').on(t.status),
])

export const productSerialsRelations = relations(productSerials, ({ one, many }) => ({
  product: one(products, { fields: [productSerials.productId], references: [products.id] }),
  warranties: many(warranties),
}))

export const warrantiesRelations = relations(warranties, ({ one }) => ({
  user: one(users, { fields: [warranties.userId], references: [users.id] }),
  serial: one(productSerials, { fields: [warranties.serialNumberId], references: [productSerials.id] }),
}))

export type ProductSerial = typeof productSerials.$inferSelect
export type Warranty = typeof warranties.$inferSelect
