/**
 * GET  /api/admin/installations — لیست سفارش‌های نیازمند نصب
 * PATCH /api/admin/installations — ثبت گزارش نصب (توسط نصاب)
 */
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { orders } from '@/lib/db/schema'
import { requirePermission } from '@/lib/rbac'
import { and, desc, eq, isNull } from 'drizzle-orm'

export async function GET(req: NextRequest) {
  const auth = await requirePermission(req, 'installation:read')
  if (auth instanceof NextResponse) return auth

  const { searchParams } = new URL(req.url)
  const done = searchParams.get('done') // 'true' | 'false' | null(=همه)

  const filters = [eq(orders.needsInstallation, true)]
  if (done === 'true') filters.push(eq(orders.status, 'delivered'))
  if (done === 'false') filters.push(isNull(orders.installedAt))

  const rows = await db
    .select({
      id: orders.id,
      status: orders.status,
      shippingAddress: orders.shippingAddress,
      needsInstallation: orders.needsInstallation,
      installationNote: orders.installationNote,
      installedAt: orders.installedAt,
      createdAt: orders.createdAt,
    })
    .from(orders)
    .where(and(...filters))
    .orderBy(desc(orders.createdAt))
    .limit(100)

  return NextResponse.json({ orders: rows })
}

export async function PATCH(req: NextRequest) {
  const auth = await requirePermission(req, 'installation:write')
  if (auth instanceof NextResponse) return auth

  const body = await req.json() as { orderId?: string; note?: string; completed?: boolean }
  if (!body.orderId) {
    return NextResponse.json({ error: 'orderId الزامی است' }, { status: 400 })
  }

  const updates: Record<string, unknown> = { updatedAt: new Date() }
  if (body.note !== undefined) updates.installationNote = body.note
  if (body.completed) updates.installedAt = new Date()

  const [updated] = await db
    .update(orders)
    .set(updates)
    .where(and(eq(orders.id, body.orderId), eq(orders.needsInstallation, true)))
    .returning({ id: orders.id })

  if (!updated) {
    return NextResponse.json({ error: 'سفارش یافت نشد یا نیازمند نصب نیست' }, { status: 404 })
  }

  return NextResponse.json({ ok: true })
}
