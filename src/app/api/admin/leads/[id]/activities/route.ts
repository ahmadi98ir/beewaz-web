/**
 * GET  /api/admin/leads/[id]/activities  — تاریخچه فعالیت‌ها
 * POST /api/admin/leads/[id]/activities  — ثبت فعالیت جدید
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { leadActivities } from '@/lib/db/schema'
import { requireAdmin } from '@/lib/admin-auth'
import { eq, desc } from 'drizzle-orm'

type Params = { params: Promise<{ id: string }> }

export async function GET(req: NextRequest, { params }: Params) {
  const auth = await requireAdmin(req)
  if (!auth.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params

  const activities = await db
    .select()
    .from(leadActivities)
    .where(eq(leadActivities.leadId, id))
    .orderBy(desc(leadActivities.createdAt))

  return NextResponse.json({ activities })
}

export async function POST(req: NextRequest, { params }: Params) {
  const auth = await requireAdmin(req)
  if (!auth.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params

  const { type, description } = await req.json() as { type: string; description: string }
  if (!type || !description?.trim())
    return NextResponse.json({ error: 'نوع و توضیح الزامی است' }, { status: 400 })

  const [created] = await db
    .insert(leadActivities)
    .values({ leadId: id, type, description: description.trim(), createdBy: auth.userId ?? undefined })
    .returning()

  return NextResponse.json({ activity: created }, { status: 201 })
}
