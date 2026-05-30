/**
 * CMS Pages + Banners schema
 */

import { pgTable, uuid, varchar, text, timestamp, jsonb, boolean, integer } from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'

// ─── صفحات سایت ──────────────────────────────────────────────────────────────

export const pages = pgTable('pages', {
  id:          uuid('id').primaryKey().defaultRandom(),
  slug:        varchar('slug', { length: 200 }).unique().notNull(),
  titleFa:     varchar('title_fa', { length: 300 }).notNull(),
  /** draft | published */
  status:      varchar('status', { length: 16 }).notNull().default('draft'),
  /** آرایه بلاک‌های JSON: [{type, props}] */
  blocks:      jsonb('blocks').notNull().default(sql`'[]'::jsonb`).$type<Block[]>(),
  metaTitle:   text('meta_title'),
  metaDesc:    text('meta_desc'),
  ogImage:     text('og_image'),
  publishedAt: timestamp('published_at', { withTimezone: true }),
  createdAt:   timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt:   timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

// ─── بنرها ────────────────────────────────────────────────────────────────────

export const banners = pgTable('banners', {
  id:       uuid('id').primaryKey().defaultRandom(),
  name:     varchar('name', { length: 100 }).notNull(),
  image:    text('image').notNull(),
  link:     text('link'),
  /** _self | _blank */
  target:   varchar('target', { length: 10 }).notNull().default('_self'),
  /** home_hero | shop_top | sidebar | popup */
  position: varchar('position', { length: 64 }).notNull().default('home_hero'),
  orderIdx: integer('order_idx').notNull().default(0),
  active:   boolean('active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

// ─── Block type ──────────────────────────────────────────────────────────────

export type BlockType =
  | 'hero'
  | 'text'
  | 'image'
  | 'gallery'
  | 'cta'
  | 'faq'
  | 'features'
  | 'divider'

export interface Block {
  id:    string
  type:  BlockType
  props: Record<string, unknown>
}

// ─── Types ───────────────────────────────────────────────────────────────────

export type Page      = typeof pages.$inferSelect
export type NewPage   = typeof pages.$inferInsert
export type Banner    = typeof banners.$inferSelect
export type NewBanner = typeof banners.$inferInsert
