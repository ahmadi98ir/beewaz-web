/**
 * CRM Extended Tables
 * lead_notes, lead_activities, follow_ups, customer_notes
 */

import { pgTable, uuid, varchar, text, timestamp, jsonb, boolean } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { users } from './users'
import { leads } from './chat'

// ─── یادداشت‌های لید ──────────────────────────────────────────────────────────

export const leadNotes = pgTable('lead_notes', {
  id:          uuid('id').primaryKey().defaultRandom(),
  leadId:      uuid('lead_id').notNull().references(() => leads.id, { onDelete: 'cascade' }),
  note:        text('note').notNull(),
  createdBy:   uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
  createdAt:   timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export const leadNotesRelations = relations(leadNotes, ({ one }) => ({
  lead:      one(leads,  { fields: [leadNotes.leadId],    references: [leads.id] }),
  createdBy: one(users,  { fields: [leadNotes.createdBy], references: [users.id] }),
}))

// ─── فعالیت‌های لید (تاریخچه تماس) ──────────────────────────────────────────

export const leadActivities = pgTable('lead_activities', {
  id:          uuid('id').primaryKey().defaultRandom(),
  leadId:      uuid('lead_id').notNull().references(() => leads.id, { onDelete: 'cascade' }),
  /** call | sms | meeting | email | note | status_change */
  type:        varchar('type', { length: 32 }).notNull(),
  description: text('description').notNull(),
  metadata:    jsonb('metadata').default({}).$type<Record<string, unknown>>(),
  createdBy:   uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
  createdAt:   timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export const leadActivitiesRelations = relations(leadActivities, ({ one }) => ({
  lead:      one(leads,  { fields: [leadActivities.leadId],    references: [leads.id] }),
  createdBy: one(users,  { fields: [leadActivities.createdBy], references: [users.id] }),
}))

// ─── فالوآپ‌ها ────────────────────────────────────────────────────────────────

export const followUps = pgTable('follow_ups', {
  id:          uuid('id').primaryKey().defaultRandom(),
  leadId:      uuid('lead_id').references(() => leads.id, { onDelete: 'cascade' }),
  userId:      uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  scheduledAt: timestamp('scheduled_at', { withTimezone: true }).notNull(),
  note:        text('note'),
  doneAt:      timestamp('done_at', { withTimezone: true }),
  createdAt:   timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export const followUpsRelations = relations(followUps, ({ one }) => ({
  lead: one(leads, { fields: [followUps.leadId], references: [leads.id] }),
  user: one(users, { fields: [followUps.userId], references: [users.id] }),
}))

// ─── یادداشت‌های مشتری (روی پروفایل users) ────────────────────────────────────

export const customerNotes = pgTable('customer_notes', {
  id:        uuid('id').primaryKey().defaultRandom(),
  userId:    uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  note:      text('note').notNull(),
  createdBy: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export const customerNotesRelations = relations(customerNotes, ({ one }) => ({
  user:      one(users, { fields: [customerNotes.userId],    references: [users.id], relationName: 'userNotes' }),
  createdBy: one(users, { fields: [customerNotes.createdBy], references: [users.id], relationName: 'noteAuthor' }),
}))

// ─── Types ────────────────────────────────────────────────────────────────────

export type LeadNote        = typeof leadNotes.$inferSelect
export type NewLeadNote     = typeof leadNotes.$inferInsert
export type LeadActivity    = typeof leadActivities.$inferSelect
export type NewLeadActivity = typeof leadActivities.$inferInsert
export type FollowUp        = typeof followUps.$inferSelect
export type NewFollowUp     = typeof followUps.$inferInsert
export type CustomerNote    = typeof customerNotes.$inferSelect
export type NewCustomerNote = typeof customerNotes.$inferInsert
