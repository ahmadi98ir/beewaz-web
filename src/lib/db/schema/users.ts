import {
  pgTable, pgEnum, uuid, varchar, text, boolean, timestamp, jsonb
} from 'drizzle-orm/pg-core'

// ─── Enums ──────────────────────────────────────────────────────────────────────────────

export const userRoleEnum = pgEnum('user_role', [
  'customer',
  'admin',
  'sales_agent',
])

// ─── Table ──────────────────────────────────────────────────────────────────────────────

type ShippingAddress = {
  fullName?: string; province?: string; city?: string
  street?: string; alley?: string; plaque?: string; unit?: string; postalCode?: string
}

export const users = pgTable('users', {
  id:                   uuid('id').primaryKey().defaultRandom(),
  phone:                varchar('phone', { length: 15 }).unique().notNull(),
  email:                varchar('email', { length: 255 }).unique(),
  fullName:             varchar('full_name', { length: 100 }),
  role:                 userRoleEnum('role').default('customer').notNull(),
  passwordHash:         text('password_hash'),
  isVerified:           boolean('is_verified').default(false).notNull(),
  lastShippingAddress:  jsonb('last_shipping_address').$type<ShippingAddress>(),
  createdAt:            timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt:            timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

// ─── Types ──────────────────────────────────────────────────────────────────────────────

export type User    = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type UserRole = (typeof userRoleEnum.enumValues)[number]
