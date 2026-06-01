import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { rolePermissions } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function GET() {
  const session = await auth()
  const role = (session?.user as { role?: string } | undefined)?.role

  if (!role || role === 'customer') {
    return NextResponse.json({ permissions: [] })
  }

  // admin همه مجوزها را دارد
  if (role === 'admin') {
    return NextResponse.json({ permissions: ['*'] })
  }

  const rows = await db
    .select({ permission: rolePermissions.permission })
    .from(rolePermissions)
    .where(eq(rolePermissions.role, role))

  return NextResponse.json({ permissions: rows.map((r) => r.permission) })
}
