import { pgTable, varchar, integer, primaryKey } from 'drizzle-orm/pg-core'

export const permissions = pgTable('permissions', {
  key:       varchar('key', { length: 80 }).primaryKey(),
  label:     varchar('label', { length: 120 }).notNull(),
  groupName: varchar('group_name', { length: 60 }).notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
})

export const rolePermissions = pgTable('role_permissions', {
  role:       varchar('role', { length: 30 }).notNull(),
  permission: varchar('permission', { length: 80 }).notNull().references(() => permissions.key, { onDelete: 'cascade' }),
}, (t) => [primaryKey({ columns: [t.role, t.permission] })])

export type Permission    = typeof permissions.$inferSelect
export type RolePermission = typeof rolePermissions.$inferSelect
