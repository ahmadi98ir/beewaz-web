import { db } from '@/lib/db'
import { adminAuditLogs } from '@/lib/db/schema/audit'

export async function auditLog(
  adminId: string,
  action: string,
  entityType: string,
  entityId?: string,
  before?: unknown,
  after?: unknown,
) {
  try {
    await db.insert(adminAuditLogs).values({
      adminId,
      action,
      entityType,
      entityId: entityId ?? null,
      before: before as never ?? null,
      after: after as never ?? null,
    })
  } catch (e) {
    console.error('[audit] failed to write log', e)
  }
}
