import {
  pgTable, uuid, varchar, text, timestamp, index, uniqueIndex,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { orders } from './orders'

export const orderBillingDetails = pgTable('order_billing_details', {
  id:                  uuid('id').primaryKey().defaultRandom(),
  orderId:             uuid('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  customerType:        varchar('customer_type', { length: 10 }).notNull(), // 'individual' | 'legal'

  // حقیقی
  fullName:            varchar('full_name', { length: 200 }),
  nationalId:          varchar('national_id', { length: 10 }),

  // حقوقی
  companyName:         varchar('company_name', { length: 200 }),
  companyNationalId:   varchar('company_national_id', { length: 11 }),
  economicCode:        varchar('economic_code', { length: 16 }),
  registrationNumber:  varchar('registration_number', { length: 50 }),
  companyPhone:        varchar('company_phone', { length: 15 }),

  // مشترک
  postalCode:          varchar('postal_code', { length: 10 }).notNull(),
  address:             text('address').notNull(),

  status:              varchar('status', { length: 20 }).notNull().default('pending'), // pending | approved | rejected
  adminNote:           text('admin_note'),

  createdAt:           timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt:           timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  uniqueIndex('obilling_order_id_idx').on(t.orderId),
  index('obilling_status_idx').on(t.status),
])

export const orderBillingDetailsRelations = relations(orderBillingDetails, ({ one }) => ({
  order: one(orders, { fields: [orderBillingDetails.orderId], references: [orders.id] }),
}))

export type OrderBillingDetails    = typeof orderBillingDetails.$inferSelect
export type NewOrderBillingDetails = typeof orderBillingDetails.$inferInsert
