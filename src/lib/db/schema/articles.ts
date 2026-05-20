import { pgTable, pgEnum, uuid, varchar, text, integer, timestamp, jsonb } from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'

export const articleStatusEnum = pgEnum('article_status', ['draft', 'published', 'archived'])

export const articles = pgTable('articles', {
  id:          uuid('id').primaryKey().defaultRandom(),
  authorId:    uuid('author_id'),
  slug:        varchar('slug', { length: 200 }).unique().notNull(),
  titleFa:     varchar('title_fa', { length: 300 }).notNull(),
  excerptFa:   text('excerpt_fa'),
  bodyFa:      text('body_fa'),
  coverImage:  text('cover_image'),
  category:    varchar('category', { length: 64 }),
  tags:        jsonb('tags').default(sql`'[]'::jsonb`).$type<string[]>(),
  readingTime: integer('reading_time'),
  status:      articleStatusEnum('status').default('draft').notNull(),
  metaTitle:   text('meta_title'),
  metaDesc:    text('meta_desc'),
  publishedAt: timestamp('published_at', { withTimezone: true }),
  createdAt:   timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt:   timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

export type Article    = typeof articles.$inferSelect
export type NewArticle = typeof articles.$inferInsert
export type ArticleStatus = (typeof articleStatusEnum.enumValues)[number]
