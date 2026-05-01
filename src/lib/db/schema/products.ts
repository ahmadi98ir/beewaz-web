import {
  pgTable,
  pgEnum,
  uuid,
  varchar,
  text,
  integer,
  bigint,
  boolean,
  timestamp,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { categories } from './categories'

// ─── Enums ────────────────────────────────────────────────────────────────────

export const productStatusEnum = pgEnum('product_status', [
  'draft',
  'active',
  'archived',
])

// ─── Products ─────────────────────────────────────────────────────────────────

export const products = pgTable('products', {
  id: uuid('id').primaryKey().defaultRandom(),

  categoryId: uuid('category_id')
    .references(() => categories.id, { onDelete: 'set null' }),

  // کد انحصاری محصول — برای انبارداری و بارکد
  sku: varchar('sku', { length: 50 }).unique().notNull(),

  nameFa: text('name_fa').notNull(),
  nameEn: text('name_en'),
  slug: varchar('slug', { length: 160 }).unique().notNull(),
  descriptionFa: text('description_fa'),

  // قیمت به تومان (bigint برای جلوگیری از overflow)
  price: bigint('price', { mode: 'number' }).notNull(),
  // قیمت اصلی پیش از تخفیف — اگر null باشد تخفیفی وجود ندارد
  comparePrice: bigint('compare_price', { mode: 'number' }),

  stock: integer('stock').default(0).notNull(),
  status: productStatusEnum('status').default('draft').notNull(),
  isFeatured: boolean('is_featured').default(false).notNull(),

  // فیلدهای SEO
  metaTitle: text('meta_title'),
  metaDesc: text('meta_desc'),

  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
})

// ─── Product Images ───────────────────────────────────────────────────────────

export const productImages = pgTable('product_images', {
  id: uuid('id').primaryKey().defaultRandom(),
  productId: uuid('product_id')
    .references(() => products.id, { onDelete: 'cascade' })
    .notNull(),
  url: text('url').notNull(),
  alt: text('alt'),
  sortOrder: integer('sort_order').default(0).notNull(),
})

// ─── Product Specs ────────────────────────────────────────────────────────────
// مشخصات فنی به‌صورت key/value — مثلاً: "برد سیگنال" → "تا ۱۰۰ متر"

export const productSpecs = pgTable('product_specs', {
  id: uuid('id').primaryKey().defaultRandom(),
  productId: uuid('product_id')
    .references(() => products.id, { onDelete: 'cascade' })
    .notNull(),
  keyFa: varchar('key_fa', { length: 100 }).notNull(),
  valueFa: varchar('value_fa', { length: 255 }).notNull(),
  sortOrder: integer('sort_order').default(0).notNull(),
})

// ─── Relations ────────────────────────────────────────────────────────────────

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  images: many(productImages),
  specs: many(productSpecs),
}))

export const productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(products, {
    fields: [productImages.productId],
    references: [products.id],
  }),
}))

export const productSpecsRelations = relations(productSpecs, ({ one }) => ({
  product: one(products, {
    fields: [productSpecs.productId],
    references: [products.id],
  }),
}))

// ─── Types ────────────────────────────────────────────────────────────────────

export type Product = typeof products.$inferSelect
export type NewProduct = typeof products.$inferInsert
export type ProductStatus = (typeof productStatusEnum.enumValues)[number]

export type ProductImage = typeof productImages.$inferSelect
export type NewProductImage = typeof productImages.$inferInsert

export type ProductSpec = typeof productSpecs.$inferSelect
export type NewProductSpec = typeof productSpecs.$inferInsert

// محصول کامل با تمام روابط — برای صفحات محصول
export type ProductWithDetails = Product & {
  category: import('./categories').Category | null
  images: ProductImage[]
  specs: ProductSpec[]
}
