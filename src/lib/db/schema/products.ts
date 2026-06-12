import {
  pgTable, pgEnum, uuid, varchar, text, numeric, bigint, integer, smallint, boolean, timestamp, jsonb
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { categories } from './categories'
import { users } from './users'

export const productStatusEnum = pgEnum('product_status', [
  'draft', 'active', 'archived', 'out_of_stock',
])

export const products = pgTable('products', {
  id:           uuid('id').primaryKey().defaultRandom(),
  categoryId:   uuid('category_id').references(() => categories.id, { onDelete: 'set null' }),
  sku:          varchar('sku', { length: 50 }).unique().notNull(),
  nameFa:       text('name_fa').notNull(),
  slug:         varchar('slug', { length: 160 }).unique().notNull(),
  descriptionFa: text('description_fa'),
  price:        bigint('price', { mode: 'number' }).notNull().default(0),
  comparePrice:    bigint('compare_price', { mode: 'number' }),
  salePrice:       bigint('sale_price', { mode: 'number' }),
  salePriceFrom:   timestamp('sale_price_from', { withTimezone: true }),
  salePriceTo:     timestamp('sale_price_to', { withTimezone: true }),
  relatedProductIds: jsonb('related_product_ids').$type<string[]>().default([]),
  stock:           integer('stock').default(0).notNull(),
  status:       productStatusEnum('status').default('draft').notNull(),
  isFeatured:   boolean('is_featured').default(false).notNull(),
  warrantyDays: integer('warranty_days').notNull().default(0),
  ratingAvg:    numeric('rating_avg', { precision: 3, scale: 2 }).default('0'),
  ratingCount:  integer('rating_count').default(0).notNull(),
  metaTitle:    text('meta_title'),
  metaDesc:     text('meta_desc'),
  deletedAt:    timestamp('deleted_at', { withTimezone: true }),
  createdAt:    timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt:    timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

export const productVariants = pgTable('product_variants', {
  id:           uuid('id').primaryKey().defaultRandom(),
  productId:    uuid('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  nameFa:       varchar('name_fa', { length: 120 }).notNull(),
  sku:          varchar('sku', { length: 60 }).unique(),
  price:        bigint('price', { mode: 'number' }),
  comparePrice: bigint('compare_price', { mode: 'number' }),
  stock:        integer('stock').default(0).notNull(),
  weight:       integer('weight'),
  isActive:     boolean('is_active').default(true).notNull(),
  imageUrl:     text('image_url'),
  sortOrder:    integer('sort_order').default(0).notNull(),
  createdAt:    timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt:    timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

export const productImages = pgTable('product_images', {
  id:        uuid('id').primaryKey().defaultRandom(),
  productId: uuid('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  url:       text('url').notNull(),
  alt:       text('alt'),
  isPrimary: boolean('is_primary').default(false).notNull(),
  sortOrder: integer('sort_order').default(0).notNull(),
})

export const productSpecs = pgTable('product_specs', {
  id:        uuid('id').primaryKey().defaultRandom(),
  productId: uuid('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  keyFa:     varchar('key_fa', { length: 100 }).notNull(),
  valueFa:   varchar('value_fa', { length: 255 }).notNull(),
  sortOrder: integer('sort_order').default(0).notNull(),
})

export const productReviews = pgTable('product_reviews', {
  id:         uuid('id').primaryKey().defaultRandom(),
  productId:  uuid('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  userId:     uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  authorName: varchar('author_name', { length: 100 }).notNull(),
  rating:     smallint('rating').notNull(),
  body:       text('body'),
  approved:   boolean('approved').notNull().default(false),
  createdAt:  timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, { fields: [products.categoryId], references: [categories.id] }),
  images:   many(productImages),
  variants: many(productVariants),
  specs:    many(productSpecs),
  reviews:  many(productReviews),
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

export type Product         = typeof products.$inferSelect
export type NewProduct      = typeof products.$inferInsert
export type ProductVariant  = typeof productVariants.$inferSelect
export type NewProductVariant = typeof productVariants.$inferInsert
export type ProductImage    = typeof productImages.$inferSelect
export type NewProductImage = typeof productImages.$inferInsert
export type ProductSpec     = typeof productSpecs.$inferSelect
export type NewProductSpec  = typeof productSpecs.$inferInsert
export type ProductStatus   = (typeof productStatusEnum.enumValues)[number]
export type ProductReview    = typeof productReviews.$inferSelect
export type NewProductReview = typeof productReviews.$inferInsert
