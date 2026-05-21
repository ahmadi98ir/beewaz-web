import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core'

export const phoneOtps = pgTable('phone_otps', {
  id:        uuid('id').primaryKey().defaultRandom(),
  phone:     varchar('phone', { length: 15 }).notNull(),
  code:      varchar('code', { length: 6 }).notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  usedAt:    timestamp('used_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export type PhoneOtp    = typeof phoneOtps.$inferSelect
export type NewPhoneOtp = typeof phoneOtps.$inferInsert
