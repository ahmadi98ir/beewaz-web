import { pgTable, varchar, integer, uniqueIndex } from 'drizzle-orm/pg-core'

export const permissions = pgTable('permissions', {
  key:       varchar('key', { length: 80 }).primaryKey(),
  label:     varchar('label', { length: 120 }).notNull(),
  groupName: varchar('group_name', { length: 60 }).notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
})

export const rolePermissions = pgTable('role_permissions', {
  role:       varchar('role', { length: 30 }).notNull(),
  permission: varchar('permission', { length: 80 }).notNull(),
})

export type Permission    = typeof permissions.$inferSelect
export type RolePermission = typeof rolePermissions.$inferSelect
