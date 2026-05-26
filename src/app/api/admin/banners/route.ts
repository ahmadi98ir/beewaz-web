/**
 * GET  /api/admin/banners  — لیست بنرها
 * POST /api/admin/banners  — بنر جدید
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { banners } from '@/lib/db/schema'
import { requireAdmin } from '@/lib/admin-auth'
import { asc, eq } from 'drizzle-orm'

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req)
  if (!auth.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const all = await db.select().from(banners).orderBy(asc(banners.orderIdx))
  return NextResponse.json({ banners: all })
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req)
  if (!auth.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json() as {
    name: string; image: string; link?: string
    target?: string; position?: string; orderIdx?: number
  }
  if (!body.name || !body.image)
    return NextResponse.json({ error: 'نام و تصویر الزامی است' }, { status: 400 })

  const [banner] = await db.insert(banners).values({
    name:     body.name,
    image:    body.image,
    link:     body.link,
    target:   body.target   ?? '_self',
    position: body.position ?? 'home_hero',
    orderIdx: body.orderIdx ?? 0,
  }).returning()

  return NextResponse.json({ banner }, { status: 201 })
}
