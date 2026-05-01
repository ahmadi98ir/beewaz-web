import {
  pgTable,
  uuid,
  varchar,
  integer,
  type AnyPgColumn,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { products } from './products'

// ─── Table ────────────────────────────────────────────────────────────────────

export const categories = pgTable('categories', {
  id: uuid('id').primaryKey().defaultRandom(),

  // self-referential برای دسته‌بندی‌های چندسطحی (مثلاً: دزدگیر > حسگرها > حسگر حرکتی)
  parentId: uuid('parent_id').references((): AnyPgColumn => categories.id, {
    onDelete: 'set null',
  }),

  nameFa: varchar('name_fa', { length: 100 }).notNull(),
  nameEn: varchar('name_en', { length: 100 }),
  slug: varchar('slug', { length: 120 }).unique().notNull(),

  // نام کلاس آیکون (مثلاً Heroicon یا Lucide)
  icon: varchar('icon', { length: 50 }),

  sortOrder: integer('sort_order').default(0).notNull(),
})

// ─── Relations ────────────────────────────────────────────────────────────────

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  parent: one(categories, {
    fields: [categories.parentId],
    references: [categories.id],
    relationName: 'subcategories',
  }),
  children: many(categories, {
    relationName: 'subcategories',
  }),
  products: many(products),
}))

// ─── Types ────────────────────────────────────────────────────────────────────

export type Category = typeof categories.$inferSelect
export type NewCategory = typeof categories.$inferInsert
