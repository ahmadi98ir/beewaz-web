import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { db } from '@/lib/db'
import { permissions, rolePermissions, roles } from '@/lib/db/schema'
import { eq, asc } from 'drizzle-orm'
import { invalidateRoleCache } from '@/lib/rbac'

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req)
  if (!auth.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [allPerms, allRolePerms] = await Promise.all([
    db.select().from(permissions).orderBy(asc(permissions.groupName), asc(permissions.sortOrder)),
    db.select().from(rolePermissions),
  ])

  // Group permissions
  const grouped: Record<string, typeof allPerms> = {}
  for (const p of allPerms) {
    if (!grouped[p.groupName]) grouped[p.groupName] = []
    grouped[p.groupName]!.push(p)
  }

  // Map role → permission set
  const byRole: Record<string, string[]> = {}
  for (const rp of allRolePerms) {
    if (!byRole[rp.role]) byRole[rp.role] = []
    byRole[rp.role]!.push(rp.permission)
  }

  return NextResponse.json({ grouped, byRole })
}

export async function PUT(req: NextRequest) {
  const auth = await requireAdmin(req)
  if (!auth.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json() as { role: string; permissions: string[] }
  const { role, permissions: perms } = body

  if (!role) {
    return NextResponse.json({ error: 'نقش نامعتبر است' }, { status: 400 })
  }
  // admin همیشه همه مجوزها را دارد و ویرایش نمی‌شود
  if (role === 'admin') {
    return NextResponse.json({ error: 'مجوزهای مدیر کل قابل تغییر نیست' }, { status: 400 })
  }
  // نقش باید در جدول roles موجود باشد
  const exists = await db.select({ name: roles.name }).from(roles).where(eq(roles.name, role)).limit(1)
  if (exists.length === 0) {
    return NextResponse.json({ error: 'نقش نامعتبر است' }, { status: 400 })
  }

  await db.transaction(async (tx) => {
    await tx.delete(rolePermissions).where(eq(rolePermissions.role, role))
    if (perms.length > 0) {
      await tx.insert(rolePermissions).values(perms.map((p) => ({ role, permission: p })))
    }
  })

  invalidateRoleCache(role)

  return NextResponse.json({ ok: true })
}
