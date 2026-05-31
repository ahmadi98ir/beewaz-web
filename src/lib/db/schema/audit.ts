import { pgTable, uuid, varchar, jsonb, timestamp, index } from 'drizzle-orm/pg-core'

export const adminAuditLogs = pgTable('admin_audit_logs', {
  id:         uuid('id').primaryKey().defaultRandom(),
  adminId:    varchar('admin_id', { length: 100 }).notNull(),
  action:     varchar('action', { length: 100 }).notNull(),
  entityType: varchar('entity_type', { length: 50 }).notNull(),
  entityId:   varchar('entity_id', { length: 100 }),
  before:     jsonb('before'),
  after:      jsonb('after'),
  createdAt:  timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  index('audit_admin_id_idx').on(t.adminId),
  index('audit_entity_idx').on(t.entityType, t.entityId),
  index('audit_created_at_idx').on(t.createdAt),
])

export type AdminAuditLog = typeof adminAuditLogs.$inferSelect
export type NewAdminAuditLog = typeof adminAuditLogs.$inferInsert
