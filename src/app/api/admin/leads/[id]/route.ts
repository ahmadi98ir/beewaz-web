import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { leads } from '@/lib/db/schema'
import { requireAdmin } from '@/lib/admin-auth'

type Params = { params: Promise<{ id: string }> }

const VALID_STATUSES = ['new', 'contacted', 'converted', 'lost'] as const
type LeadStatus = (typeof VALID_STATUSES)[number]

export async function PUT(req: NextRequest, { params }: Params) {
  const guard = await requireAdmin()
  if (guard.error) return guard.error

  const { id } = await params
  try {
    const body = await req.json()
    if (!VALID_STATUSES.includes(body.status)) {
      return NextResponse.json({ error: 'وضعیت نامعتبر' }, { status: 400 })
    }

    await db
      .update(leads)
      .set({ status: body.status as LeadStatus, updatedAt: new Date() })
      .where(eq(leads.id, id))

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[API PUT /admin/leads/:id]', err)
    return NextResponse.json({ error: 'خطا در بروزرسانی' }, { status: 500 })
  }
}
