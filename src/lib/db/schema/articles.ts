import {
  pgTable,
  pgEnum,
  uuid,
  text,
  varchar,
  integer,
  timestamp,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { users } from './users'

// ─── Enums ────────────────────────────────────────────────────────────────────

export const articleCategoryEnum = pgEnum('article_category', [
  'blog',
  'knowledge_base',
])

export const articleStatusEnum = pgEnum('article_status', [
  'draft',
  'published',
  'archived',
])

// ─── Table ────────────────────────────────────────────────────────────────────

export const articles = pgTable('articles', {
  id: uuid('id').primaryKey().defaultRandom(),
  authorId: uuid('author_id').references(() => users.id, { onDelete: 'set null' }),

  category: articleCategoryEnum('category').notNull(),
  status: articleStatusEnum('status').default('draft').notNull(),

  titleFa: text('title_fa').notNull(),
  slug: varchar('slug', { length: 200 }).unique().notNull(),
  bodyFa: text('body_fa').notNull(),            // MDX / Rich text
  excerptFa: text('excerpt_fa'),                // خلاصه برای کارت‌ها

  coverImage: text('cover_image'),
  tags: text('tags').array().default([]).notNull(),
  readingTime: integer('reading_time'),          // دقیقه

  // SEO
  metaTitle: text('meta_title'),
  metaDesc: text('meta_desc'),

  publishedAt: timestamp('published_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

// ─── Relations ────────────────────────────────────────────────────────────────

export const articlesRelations = relations(articles, ({ one }) => ({
  author: one(users, { fields: [articles.authorId], references: [users.id] }),
}))

// ─── Types ────────────────────────────────────────────────────────────────────

export type Article = typeof articles.$inferSelect
export type NewArticle = typeof articles.$inferInsert
export type ArticleCategory = (typeof articleCategoryEnum.enumValues)[number]
export type ArticleStatus = (typeof articleStatusEnum.enumValues)[number]
