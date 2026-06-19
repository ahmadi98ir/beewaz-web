/**
 * Menu schema — مدیریت منوهای هدر و فوتر از طریق CMS
 */

import { pgTable, uuid, varchar, text, integer, boolean, timestamp } from 'drizzle-orm/pg-core'

// مکان نمایش آیتم منو:
// header | footer_shop | footer_knowledge | footer_company
export const menuItems = pgTable('menu_items', {
  id:          uuid('id').primaryKey().defaultRandom(),
  location:    varchar('location', { length: 32 }).notNull(),
  /** فقط برای location='header' — زیرمنوهای مگامنو */
  parentId:    uuid('parent_id'),
  label:       varchar('label', { length: 200 }).notNull(),
  href:        varchar('href', { length: 300 }).notNull(),
  description: text('description'),
  sortOrder:   integer('sort_order').notNull().default(0),
  active:      boolean('active').notNull().default(true),
  createdAt:   timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt:   timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

export type MenuItem    = typeof menuItems.$inferSelect
export type NewMenuItem = typeof menuItems.$inferInsert
