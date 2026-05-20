import { pgTable, uuid, varchar, text, integer, timestamp } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

export const categories = pgTable('categories', {
  id:        uuid('id').primaryKey().defaultRandom(),
  parentId:  uuid('parent_id'),
  nameFa:    varchar('name_fa', { length: 100 }).notNull(),
  slug:      varchar('slug', { length: 120 }).unique().notNull(),
  icon:      text('icon'),
  sortOrder: integer('sort_order').default(0).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  parent:   one(categories, { fields: [categories.parentId], references: [categories.id] }),
  children: many(categories),
}))

export type Category    = typeof categories.$inferSelect
export type NewCategory = typeof categories.$inferInsert
