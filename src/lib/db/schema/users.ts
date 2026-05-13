import {
  pgTable,
  pgEnum,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { orders } from './orders'

// ─── Enums ────────────────────────────────────────────────────────────────────

export const userRoleEnum = pgEnum('user_role', [
  'customer',
  'admin',
  'sales_agent',
])

// ─── Table ────────────────────────────────────────────────────────────────────

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),

  // احراز هویت اصلی با شماره موبایل (بازار ایران)
  phone: varchar('phone', { length: 15 }).unique().notNull(),
  email: varchar('email', { length: 255 }).unique(),
  fullName: varchar('full_name', { length: 100 }),

  role: userRoleEnum('role').default('customer').notNull(),
  passwordHash: text('password_hash'),
  isVerified: boolean('is_verified').default(false).notNull(),

  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
})

// ─── Relations ────────────────────────────────────────────────────────────────

export const usersRelations = relations(users, ({ many }) => ({
  orders: many(orders),
}))

// ─── Types ────────────────────────────────────────────────────────────────────

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type UserRole = (typeof userRoleEnum.enumValues)[number]
