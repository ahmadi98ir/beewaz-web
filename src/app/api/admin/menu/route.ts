/**
 * GET  /api/admin/menu  — لیست آیتم‌های منو
 * POST /api/admin/menu  — آیتم جدید
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { menuItems } from '@/lib/db/schema'
import { requireAdmin } from '@/lib/admin-auth'
import { asc } from 'drizzle-orm'

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req)
  if (!auth.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const all = await db.select().from(menuItems).orderBy(asc(menuItems.sortOrder))
  return NextResponse.json({ items: all })
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req)
  if (!auth.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json() as {
    location: string; parentId?: string | null; label: string; href: string
    description?: string; sortOrder?: number
  }
  if (!body.location || !body.label || !body.href)
    return NextResponse.json({ error: 'محل، عنوان و آدرس الزامی است' }, { status: 400 })

  const [item] = await db.insert(menuItems).values({
    location:    body.location,
    parentId:    body.parentId ?? null,
    label:       body.label,
    href:        body.href,
    description: body.description ?? null,
    sortOrder:   body.sortOrder ?? 0,
  }).returning()

  return NextResponse.json({ item }, { status: 201 })
}
