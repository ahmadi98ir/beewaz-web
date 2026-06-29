/**
 * دفترچه آدرس کاربر (User Addresses) — چند آدرس ذخیره‌شده با امکان انتخاب پیش‌فرض
 */
import { pgTable, uuid, varchar, boolean, timestamp, index } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { users } from './users'

export const userAddresses = pgTable('user_addresses', {
  id:         uuid('id').primaryKey().defaultRandom(),
  userId:     uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title:      varchar('title', { length: 50 }),          // برچسب: خانه، محل کار، ...
  fullName:   varchar('full_name', { length: 100 }),
  province:   varchar('province', { length: 50 }),
  city:       varchar('city', { length: 50 }),
  street:     varchar('street', { length: 255 }),
  alley:      varchar('alley', { length: 255 }),
  plaque:     varchar('plaque', { length: 20 }),
  unit:       varchar('unit', { length: 20 }),
  postalCode: varchar('postal_code', { length: 10 }),
  isDefault:  boolean('is_default').default(false).notNull(),
  createdAt:  timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt:  timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  index('user_addresses_user_idx').on(t.userId),
])

export const userAddressesRelations = relations(userAddresses, ({ one }) => ({
  user: one(users, { fields: [userAddresses.userId], references: [users.id] }),
}))

export type UserAddress    = typeof userAddresses.$inferSelect
export type NewUserAddress = typeof userAddresses.$inferInsert
