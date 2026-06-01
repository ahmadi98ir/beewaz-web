import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { db } from '@/lib/db'
import { roles, rolePermissions } from '@/lib/db/schema'
import { asc, eq } from 'drizzle-orm'
import { invalidateRoleCache } from '@/lib/rbac'

// GET — لیست همه نقش‌ها (data-driven)
export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req)
  if (!auth.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const list = await db.select().from(roles).orderBy(asc(roles.sortOrder))
  return NextResponse.json({ roles: list })
}

// POST — ایجاد نقش جدید
export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req)
  if (!auth.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json() as { name?: string; labelFa?: string; color?: string }
  const name = (body.name ?? '').trim().toLowerCase().replace(/[^a-z0-9_]/g, '')
  const labelFa = (body.labelFa ?? '').trim()

  if (!name || !labelFa) {
    return NextResponse.json({ error: 'نام انگلیسی و عنوان فارسی الزامی است' }, { status: 400 })
  }

  const existing = await db.select({ name: roles.name }).from(roles).where(eq(roles.name, name)).limit(1)
  if (existing.length > 0) {
    return NextResponse.json({ error: 'این نقش از قبل وجود دارد' }, { status: 409 })
  }

  const maxSort = await db.select({ s: roles.sortOrder }).from(roles).orderBy(asc(roles.sortOrder))
  const nextSort = (maxSort.at(-1)?.s ?? 0) + 10

  await db.insert(roles).values({
    name,
    labelFa,
    color: body.color || 'bg-surface-100 text-surface-700 border-surface-200',
    isSystem: false,
    sortOrder: nextSort,
  })

  return NextResponse.json({ ok: true })
}

// DELETE — حذف نقش (نقش‌های سیستمی قابل حذف نیستند)
export async function DELETE(req: NextRequest) {
  const auth = await requireAdmin(req)
  if (!auth.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const name = searchParams.get('name')
  if (!name) return NextResponse.json({ error: 'name الزامی است' }, { status: 400 })

  const [role] = await db.select().from(roles).where(eq(roles.name, name)).limit(1)
  if (!role) return NextResponse.json({ error: 'نقش یافت نشد' }, { status: 404 })
  if (role.isSystem) {
    return NextResponse.json({ error: 'نقش‌های سیستمی قابل حذف نیستند' }, { status: 400 })
  }

  await db.transaction(async (tx) => {
    await tx.delete(rolePermissions).where(eq(rolePermissions.role, name))
    await tx.delete(roles).where(eq(roles.name, name))
  })

  invalidateRoleCache(name)
  return NextResponse.json({ ok: true })
}
