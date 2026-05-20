/**
 * کمکی‌های اشتراکی schema
 * - timestampها، soft delete و کلید اولیه استاندارد
 */

import { sql } from 'drizzle-orm'
import { timestamp, uuid } from 'drizzle-orm/pg-core'

/** UUID v7 (مرتب با زمان) — نیاز به extension pgcrypto یا uuid-ossp */
export const primaryId = () => uuid('id').primaryKey().defaultRandom()

/** ستون‌های زمانی استاندارد برای هر جدول */
export const timestamps = {
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .default(sql`now()`),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .default(sql`now()`)
    .$onUpdate(() => new Date()),
}

/** Soft delete — برای جداول حساس (orders, users, products) */
export const softDelete = {
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
}
