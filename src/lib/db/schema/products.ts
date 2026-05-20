import {
  pgTable, pgEnum, uuid, varchar, text, numeric, integer, boolean, timestamp
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// ─── Enums ─────────────────────────────────────────────────────────────────────────────

export const productStatusEnum = pgEnum('product_status', [
  'draft',
  'active',
  'archived',
  'out_of_stock',
])

// ─── Products ──────────────────────────────────────────────────────────────────────────

export const products = pgTable('products', {
  id:               uuid('id').primaryKey().defaultRandom(),
  categoryId:       uuid('category_id'),
  name:             varchar('name', { length: 200 }).notNull(),
  slug:             varchar('slug', { length: 200 }).unique().notNull(),
  modelCode:        varchar('model_code', { length: 64 }),
  shortDescription: text('short_description'),
  description:      text('description'),
  basePrice:        numeric('base_price', { precision: 14, scale: 0 }),
  status:           productStatusEnum('status').default('draft').notNull(),
  isFeatured:       boolean('is_featured').default(false).notNull(),
  ratingAvg:        numeric('rating_avg', { precision: 3, scale: 2 }).default('0'),
  ratingCount:      integer('rating_count').default(0).notNull(),
  salesCount:       integer('sales_count').default(0).notNull(),
  publishedAt:      timestamp('published_at', { withTimezone: true }),
  deletedAt:        timestamp('deleted_at', { withTimezone: true }),
  createdAt:        timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt:        timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

// ─── Product Variants ────────────────────────────────────────────────────────────────

export const productVariants = pgTable('product_variants', {
  id:        uuid('id').primaryKey().defaultRandom(),
  productId: uuid('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  name:      varchar('name', { length: 100 }).notNull(),
  sku:       varchar('sku', { length: 50 }),
  price:     numeric('price', { precision: 14, scale: 0 }),
  stock:     integer('stock').default(0).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

// ─── Product Images ───────────────────────────────────────────────────────────────────

export const productImages = pgTable('product_images', {
  id:        uuid('id').primaryKey().defaultRandom(),
  productId: uuid('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  url:       text('url').notNull(),
  alt:       text('alt'),
  isPrimary: boolean('is_primary').default(false).notNull(),
  sortOrder: integer('sort_order').default(0).notNull(),
})

// ─── Product Specs ───────────────────────────────────────────────────────────────────

export const productSpecs = pgTable('product_specs', {
  id:        uuid('id').primaryKey().defaultRandom(),
  productId: uuid('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  keyFa:     varchar('key_fa', { length: 100 }).notNull(),
  valueFa:   varchar('value_fa', { length: 255 }).notNull(),
  sortOrder: integer('sort_order').default(0).notNull(),
})

// ─── Relations ────────────────────────────────────────────────────────────────────────────

export const productsRelations = relations(products, ({ many }) => ({
  images:   many(productImages),
  variants: many(productVariants),
  specs:    many(productSpecs),
}))

export const productVariantsRelations = relations(productVariants, ({ one }) => ({
  product: one(products, { fields: [productVariants.productId], references: [products.id] }),
}))

export const productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(products, { fields: [productImages.productId], references: [products.id] }),
}))

export const productSpecsRelations = relations(productSpecs, ({ one }) => ({
  product: one(products, { fields: [productSpecs.productId], references: [products.id] }),
}))

// ─── Types ───────────────────────────────────────────────────────────────────────────────

export type Product         = typeof products.$inferSelect
export type NewProduct      = typeof products.$inferInsert
export type ProductVariant  = typeof productVariants.$inferSelect
export type NewProductVariant = typeof productVariants.$inferInsert
export type ProductImage    = typeof productImages.$inferSelect
export type NewProductImage = typeof productImages.$inferInsert
export type ProductSpec     = typeof productSpecs.$inferSelect
export type NewProductSpec  = typeof productSpecs.$inferInsert
export type ProductStatus   = (typeof productStatusEnum.enumValues)[number]
