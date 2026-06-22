import {
  pgTable, pgEnum, uuid, varchar, text, timestamp, index
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { users } from './users'

export const smsStatusEnum = pgEnum('sms_status', [
  'queued', 'sent', 'delivered', 'failed',
])

export const smsTriggerEnum = pgEnum('sms_trigger', [
  'order_status_change',
  'otp',
  'payment_success',
  'shipment_tracking',
  'low_stock_alert',
  'manual',
  'invoice_request',
  'cart_abandonment',
])

export const smsLogs = pgTable('sms_logs', {
  id:           uuid('id').primaryKey().defaultRandom(),
  phone:        varchar('phone', { length: 15 }).notNull(),
  userId:       uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  message:      text('message').notNull(),
  status:       smsStatusEnum('status').notNull().default('queued'),
  trigger:      smsTriggerEnum('trigger').notNull(),
  relatedType:  varchar('related_type', { length: 30 }),
  relatedId:    varchar('related_id', { length: 100 }),
  providerRef:  varchar('provider_ref', { length: 100 }),
  errorMessage: text('error_message'),
  sentAt:       timestamp('sent_at', { withTimezone: true }),
  createdAt:    timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  index('sms_log_phone_idx').on(t.phone),
  index('sms_log_user_idx').on(t.userId),
  index('sms_log_related_idx').on(t.relatedType, t.relatedId),
  index('sms_log_created_at_idx').on(t.createdAt),
  index('sms_log_status_idx').on(t.status),
])

export const smsLogsRelations = relations(smsLogs, ({ one }) => ({
  user: one(users, { fields: [smsLogs.userId], references: [users.id] }),
}))

export type SmsLog    = typeof smsLogs.$inferSelect
export type NewSmsLog = typeof smsLogs.$inferInsert
export type SmsStatus  = (typeof smsStatusEnum.enumValues)[number]
export type SmsTrigger = (typeof smsTriggerEnum.enumValues)[number]
