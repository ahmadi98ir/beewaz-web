import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { orderNotes } from '@/lib/db/schema'
import { requireAdmin } from '@/lib/admin-auth'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

type Params = { params: Promise<{ id: string }> }

export async function GET(req: NextRequest, { params }: Params) {
  const auth = await requireAdmin(req)
  if (!auth.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const notes = await db.select().from(orderNotes).where(eq(orderNotes.orderId, id)).orderBy(orderNotes.createdAt)
  return NextResponse.json({ notes })
}

const schema = z.object({
  note: z.string().min(1).max(2000),
  type: z.enum(['internal', 'refund', 'customer']).default('internal'),
})

export async function POST(req: NextRequest, { params }: Params) {
  const auth = await requireAdmin(req)
  if (!auth.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const body = await req.json() as unknown
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'اطلاعات نامعتبر' }, { status: 400 })

  const [note] = await db.insert(orderNotes).values({
    orderId: id,
    note: parsed.data.note,
    type: parsed.data.type,
    createdBy: 'admin',
  }).returning()

  return NextResponse.json({ note })
}

export async function DELETE(req: NextRequest) {
  const auth = await requireAdmin(req)
  if (!auth.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const noteId = searchParams.get('noteId')
  if (!noteId) return NextResponse.json({ error: 'noteId الزامی است' }, { status: 400 })
  await db.delete(orderNotes).where(eq(orderNotes.id, noteId))
  return NextResponse.json({ ok: true })
}
