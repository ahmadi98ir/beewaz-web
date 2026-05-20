/**
 * GET /api/admin/orders — لیست سفارشات با فیلتر و صفحه‌بندی
 */
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { orders } from '@/lib/db/schema'
import { requireAdmin } from '@/lib/admin-auth'
import { eq, desc, ilike, or, sql, and } from 'drizzle-orm'
import type { OrderStatus } from '@/lib/db/schema'

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req)
  if (!auth.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const search = searchParams.get('q')?.trim()
  const page   = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
  const limit  = Math.min(100, parseInt(searchParams.get('limit') ?? '50', 10))
  const offset = (page - 1) * limit

  try {
    const validStatuses: OrderStatus[] = ['pending','paid','processing','shipped','delivered','cancelled','refunded']
    const statusFilter = status && status !== 'all' && validStatuses.includes(status as OrderStatus)
      ? eq(orders.status, status as OrderStatus)
      : undefined

    const where = statusFilter

    const [rows, countResult, statusCounts] = await Promise.all([
      db.select({
        id: orders.id,
        status: orders.status,
        totalAmount: orders.totalAmount,
        shippingAddress: orders.shippingAddress,
        paymentMethod: orders.paymentMethod,
        trackingCode: orders.trackingCode,
        createdAt: orders.createdAt,
        paidAt: orders.paidAt,
      })
      .from(orders)
      .where(where)
      .orderBy(desc(orders.createdAt))
      .limit(limit)
      .offset(offset),

      db.select({ total: sql<number>`count(*)::int` }).from(orders).where(where),

      db.select({ status: orders.status, count: sql<number>`count(*)::int` })
        .from(orders).groupBy(orders.status),
    ])

    const counts: Record<string, number> = { all: 0 }
    for (const r of statusCounts) { counts[r.status] = r.count }
    counts.all = statusCounts.reduce((s, r) => s + r.count, 0)

    return NextResponse.json({ orders: rows, total: countResult[0]?.total ?? 0, page, counts })
  } catch (err) {
    console.error('[orders GET]', err)
    return NextResponse.json({ error: 'خطا در دریافت سفارشات' }, { status: 500 })
  }
}
