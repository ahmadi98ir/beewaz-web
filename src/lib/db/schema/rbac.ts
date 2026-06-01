import { pgTable, varchar, integer, boolean, timestamp } from 'drizzle-orm/pg-core'

// ── نقش‌ها (data-driven) ────────────────────────────────────────────────────
// لیست نقش‌ها در DB نگه‌داری می‌شود تا افزودن نقش جدید بدون تغییر کد ممکن باشد.
export const roles = pgTable('roles', {
  name:      varchar('name', { length: 30 }).primaryKey(),     // 'admin', 'warehouse', ...
  labelFa:   varchar('label_fa', { length: 60 }).notNull(),    // 'مدیر کل'
  color:     varchar('color', { length: 60 }),                 // کلاس Tailwind نمایش
  isSystem:  boolean('is_system').notNull().default(false),    // admin/customer قابل حذف نیست
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

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

export type Role           = typeof roles.$inferSelect
export type NewRole        = typeof roles.$inferInsert
export type Permission     = typeof permissions.$inferSelect
export type RolePermission = typeof rolePermissions.$inferSelect
