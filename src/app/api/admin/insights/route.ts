/**
 * GET /api/admin/insights — هوشمندسازی مدیریت
 * هشدارهای هوشمند: موجودی کم، سفارش‌های در انتظار، و خلاصه تحلیلی اختیاری با AI
 */
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { products, orders } from '@/lib/db/schema'
import { requirePermission } from '@/lib/rbac'
import { and, eq, isNull, sql, gte, desc } from 'drizzle-orm'

export async function GET(req: NextRequest) {
  const auth = await requirePermission(req, 'dashboard:view')
  if (auth instanceof NextResponse) return auth

  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

  const [lowStock, pendingCount, recentSales, needsInstall] = await Promise.all([
    // محصولات با موجودی کم (≤ ۵ و فعال)
    db.select({ id: products.id, nameFa: products.nameFa, stock: products.stock })
      .from(products)
      .where(and(isNull(products.deletedAt), sql`${products.stock} <= 5`))
      .orderBy(products.stock)
      .limit(10),

    // سفارش‌های در انتظار پرداخت/پردازش
    db.select({ c: sql<number>`count(*)::int` })
      .from(orders)
      .where(eq(orders.status, 'pending')),

    // فروش ۲۴ ساعت اخیر
    db.select({
      count: sql<number>`count(*)::int`,
      sum: sql<number>`coalesce(sum(${orders.totalAmount}),0)::bigint`,
    })
      .from(orders)
      .where(and(gte(orders.createdAt, dayAgo), sql`${orders.status} != 'pending'`)),

    // سفارش‌های نیازمند نصب که هنوز نصب نشده‌اند
    db.select({ c: sql<number>`count(*)::int` })
      .from(orders)
      .where(and(eq(orders.needsInstallation, true), isNull(orders.installedAt))),
  ])

  // هشدارها
  const alerts: { level: 'warning' | 'info' | 'danger'; message: string }[] = []
  if (lowStock.length > 0) {
    alerts.push({
      level: lowStock.some((p) => p.stock === 0) ? 'danger' : 'warning',
      message: `${lowStock.length} محصول با موجودی کم — نیاز به تأمین`,
    })
  }
  const pending = pendingCount[0]?.c ?? 0
  if (pending > 0) {
    alerts.push({ level: 'info', message: `${pending} سفارش در انتظار پرداخت` })
  }
  const installs = needsInstall[0]?.c ?? 0
  if (installs > 0) {
    alerts.push({ level: 'info', message: `${installs} سفارش در انتظار نصب` })
  }

  return NextResponse.json({
    alerts,
    lowStock,
    pendingOrders: pending,
    pendingInstallations: installs,
    sales24h: {
      count: recentSales[0]?.count ?? 0,
      total: Number(recentSales[0]?.sum ?? 0),
    },
  })
}
