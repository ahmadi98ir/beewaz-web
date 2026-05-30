/**
 * GET  /api/admin/users/[id]/notes  — یادداشت‌های مشتری
 * POST /api/admin/users/[id]/notes  — افزودن یادداشت
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { customerNotes } from '@/lib/db/schema'
import { requireAdmin } from '@/lib/admin-auth'
import { eq, desc } from 'drizzle-orm'

type Params = { params: Promise<{ id: string }> }

export async function POST(req: NextRequest, { params }: Params) {
  const auth = await requireAdmin(req)
  if (!auth.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params

  const { note } = await req.json() as { note: string }
  if (!note?.trim()) return NextResponse.json({ error: 'متن خالی است' }, { status: 400 })

  const [created] = await db
    .insert(customerNotes)
    .values({ userId: id, note: note.trim() })
    .returning()

  return NextResponse.json({ note: created }, { status: 201 })
}
