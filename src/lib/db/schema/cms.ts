/**
 * CMS Schema — site_settings, page_content, page_views
 *
 * site_settings : key-value store برای تنظیمات کلی سایت (نام سایت، متادیتا، ...)
 * page_content  : بلاک‌های محتوای قابل‌ویرایش هر بخش (hero, banner, announcement, ...)
 * page_views    : آمار بازدید صفحات (analytics سبک)
 */

import { pgTable, pgEnum, text, boolean, timestamp, integer, varchar, uuid, jsonb } from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'

// ─── Enums ────────────────────────────────────────────────────────────────────

export const contentTypeEnum = pgEnum('content_type', [
  'text',       // متن ساده
  'richtext',   // HTML / MDX
  'image',      // URL تصویر
  'url',        // لینک
  'boolean',    // روشن/خاموش
  'json',       // آرایه یا آبجکت
  'number',     // عدد
  'color',      // کد رنگ
])

// ─── site_settings ────────────────────────────────────────────────────────────
// تنظیمات کلی سایت — فقط از پنل ادمین قابل‌ویرایش

export const siteSettings = pgTable('site_settings', {
  key: varchar('key', { length: 100 }).primaryKey(),

  /** مقدار به‌صورت رشته ذخیره می‌شود — نوع تعیین می‌کند چطور parse شود */
  value: text('value'),

  type: contentTypeEnum('type').notNull().default('text'),

  /** برچسب نمایشی در پنل ادمین */
  label: varchar('label', { length: 200 }).notNull(),

  /** گروه‌بندی در UI پنل (general, seo, contact, social, ...) */
  group: varchar('group', { length: 64 }).notNull().default('general'),

  /** توضیح کوتاه برای ادمین */
  hint: text('hint'),

  /** آیا فیلد ضروری است */
  isRequired: boolean('is_required').notNull().default(false),

  /** آیا از پنل قابل‌ویرایش است (برخی تنظیمات فقط از env قابل تغییرند) */
  isEditable: boolean('is_editable').notNull().default(true),

  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .default(sql`now()`)
    .$onUpdate(() => new Date()),
})

export type SiteSetting = typeof siteSettings.$inferSelect
export type NewSiteSetting = typeof siteSettings.$inferInsert

// ─── page_content ─────────────────────────────────────────────────────────────
// بلاک‌های محتوایی قابل‌ویرایش هر صفحه

export const pageContent = pgTable('page_content', {
  id: uuid('id').primaryKey().defaultRandom(),

  /**
   * شناسه صفحه: home, shop, about, contact, ...
   * یا global برای بلاک‌های مشترک (header, footer, ...)
   */
  page: varchar('page', { length: 64 }).notNull(),

  /**
   * کلید بلاک در آن صفحه:
   * hero_title, hero_subtitle, hero_cta_text, hero_cta_url,
   * announcement_text, announcement_active, announcement_url,
   * banner_title, banner_image, ...
   */
  key: varchar('key', { length: 100 }).notNull(),

  /** مقدار فارسی */
  valueFa: text('value_fa'),
  /** مقدار انگلیسی (اختیاری) */
  valueEn: text('value_en'),

  type: contentTypeEnum('type').notNull().default('text'),

  label: varchar('label', { length: 200 }).notNull(),
  hint: text('hint'),

  /** متادیتای اضافه: alt تصویر، dimensions، ... */
  meta: jsonb('meta').default(sql`'{}'::jsonb`),

  isActive: boolean('is_active').notNull().default(true),

  /** ترتیب نمایش در پنل ادمین */
  position: integer('position').notNull().default(0),

  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .default(sql`now()`)
    .$onUpdate(() => new Date()),
})

export type PageContent = typeof pageContent.$inferSelect
export type NewPageContent = typeof pageContent.$inferInsert

// ─── page_views ───────────────────────────────────────────────────────────────
// آمار بازدید سبک — جایگزین Umami برای شروع

export const pageViews = pgTable('page_views', {
  id: uuid('id').primaryKey().defaultRandom(),

  /** مسیر صفحه: /shop, /shop/alarm-panels/bh11, ... */
  path: varchar('path', { length: 500 }).notNull(),

  /** referrer سایت ارجاع‌دهنده */
  referrer: text('referrer'),

  /** User-Agent خلاصه‌شده */
  userAgent: text('user_agent'),

  /** کشور (در آینده از IP) */
  country: varchar('country', { length: 2 }),

  /** نوع دستگاه: desktop | mobile | tablet */
  device: varchar('device', { length: 16 }),

  /** Session شناسه تصادفی (cookie) برای تشخیص کاربر یکتا */
  sessionId: varchar('session_id', { length: 64 }),

  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .default(sql`now()`),
})

export type PageView = typeof pageViews.$inferSelect
export type NewPageView = typeof pageViews.$inferInsert
