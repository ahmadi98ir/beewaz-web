/**
 * PATCH  /api/admin/banners/[id]  — ویرایش
 * DELETE /api/admin/banners/[id]  — حذف
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { banners } from '@/lib/db/schema'
import { requireAdmin } from '@/lib/admin-auth'
import { eq } from 'drizzle-orm'

type Params = { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, { params }: Params) {
  const auth = await requireAdmin(req)
  if (!auth.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params

  const body = await req.json() as Partial<{
    name: string; image: string; link: string
    target: string; position: string; orderIdx: number; active: boolean
  }>

  const [updated] = await db
    .update(banners)
    .set(body)
    .where(eq(banners.id, id))
    .returning()

  return NextResponse.json({ banner: updated })
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const auth = await requireAdmin(req)
  if (!auth.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params

  await db.delete(banners).where(eq(banners.id, id))
  return NextResponse.json({ ok: true })
}
