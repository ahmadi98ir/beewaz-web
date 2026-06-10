import {
  pgTable, pgEnum, uuid, varchar, text, timestamp, index,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { users }      from './users'
import { orders }     from './orders'
import { orderItems } from './orders'

// ─── Enums ────────────────────────────────────────────────────────────────────

export const returnReasonEnum = pgEnum('return_reason', [
  'defective',         // معیوب / خراب
  'wrong_item',        // کالای اشتباه
  'not_as_described',  // مطابق توضیحات نیست
  'changed_mind',      // انصراف از خرید
  'other',             // سایر
])

export const returnStatusEnum = pgEnum('return_status', [
  'pending',   // در انتظار بررسی
  'approved',  // تأیید شده
  'rejected',  // رد شده
  'refunded',  // مبلغ بازگشت داده شده
])

// ─── Table ────────────────────────────────────────────────────────────────────

export const returnRequests = pgTable('return_requests', {
  id:          uuid('id').primaryKey().defaultRandom(),
  orderId:     uuid('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  userId:      uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  orderItemId: uuid('order_item_id').references(() => orderItems.id, { onDelete: 'set null' }),

  reason:      returnReasonEnum('reason').notNull(),
  reasonText:  text('reason_text'),          // توضیح اختیاری مشتری

  status:      returnStatusEnum('status').notNull().default('pending'),
  adminNotes:  text('admin_notes'),          // یادداشت ادمین

  requestedAt: timestamp('requested_at', { withTimezone: true }).defaultNow().notNull(),
  resolvedAt:  timestamp('resolved_at',  { withTimezone: true }),
  createdAt:   timestamp('created_at',   { withTimezone: true }).defaultNow().notNull(),
  updatedAt:   timestamp('updated_at',   { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  index('rr_order_id_idx').on(t.orderId),
  index('rr_user_id_idx').on(t.userId),
  index('rr_status_idx').on(t.status),
  index('rr_requested_at_idx').on(t.requestedAt),
])

export const returnRequestsRelations = relations(returnRequests, ({ one }) => ({
  order:     one(orders,     { fields: [returnRequests.orderId],     references: [orders.id] }),
  user:      one(users,      { fields: [returnRequests.userId],      references: [users.id] }),
  orderItem: one(orderItems, { fields: [returnRequests.orderItemId], references: [orderItems.id] }),
}))

export type ReturnRequest    = typeof returnRequests.$inferSelect
export type NewReturnRequest = typeof returnRequests.$inferInsert
export type ReturnReason     = (typeof returnReasonEnum.enumValues)[number]
export type ReturnStatus     = (typeof returnStatusEnum.enumValues)[number]
