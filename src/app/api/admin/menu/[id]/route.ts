/**
 * PATCH  /api/admin/menu/[id]  — ویرایش
 * DELETE /api/admin/menu/[id]  — حذف
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { menuItems } from '@/lib/db/schema'
import { requireAdmin } from '@/lib/admin-auth'
import { eq } from 'drizzle-orm'

type Params = { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, { params }: Params) {
  const auth = await requireAdmin(req)
  if (!auth.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params

  const body = await req.json() as Partial<{
    location: string; parentId: string | null; label: string; href: string
    description: string | null; sortOrder: number; active: boolean
  }>

  const [updated] = await db
    .update(menuItems)
    .set({ ...body, updatedAt: new Date() })
    .where(eq(menuItems.id, id))
    .returning()

  return NextResponse.json({ item: updated })
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const auth = await requireAdmin(req)
  if (!auth.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params

  await db.delete(menuItems).where(eq(menuItems.id, id))
  return NextResponse.json({ ok: true })
}
