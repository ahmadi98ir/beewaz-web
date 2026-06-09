import {
  pgTable, serial, varchar, boolean, integer, index
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

export const provinces = pgTable('provinces', {
  id:        serial('id').primaryKey(),
  nameFa:    varchar('name_fa', { length: 60 }).notNull().unique(),
  code:      varchar('code', { length: 4 }).notNull().unique(),
  sortOrder: integer('sort_order').notNull().default(0),
})

export const cities = pgTable('cities', {
  id:         serial('id').primaryKey(),
  provinceId: integer('province_id').notNull().references(() => provinces.id, { onDelete: 'cascade' }),
  nameFa:     varchar('name_fa', { length: 80 }).notNull(),
  isActive:   boolean('is_active').notNull().default(true),
  sortOrder:  integer('sort_order').notNull().default(0),
}, (t) => [
  index('city_province_idx').on(t.provinceId),
])

export const provincesRelations = relations(provinces, ({ many }) => ({
  cities: many(cities),
}))

export const citiesRelations = relations(cities, ({ one }) => ({
  province: one(provinces, { fields: [cities.provinceId], references: [provinces.id] }),
}))

export type Province = typeof provinces.$inferSelect
export type City     = typeof cities.$inferSelect
