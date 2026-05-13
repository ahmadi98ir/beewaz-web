import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { db } from '@/lib/db'
import { productImages } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin()
  if (error) return error
  const { id } = await params
  const images = await db.select().from(productImages).where(eq(productImages.productId, id)).orderBy(productImages.sortOrder)
  return NextResponse.json({ images })
}

const addSchema = z.object({ url: z.string().url().or(z.string().startsWith('/')), alt: z.string().max(200).optional() })

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin()
  if (error) return error
  const { id } = await params
  const body = await req.json() as unknown
  const parsed = addSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'اطلاعات نامعتبر' }, { status: 400 })

  const existing = await db.select({ sortOrder: productImages.sortOrder }).from(productImages).where(eq(productImages.productId, id))
  const maxOrder = existing.reduce((m, r) => Math.max(m, r.sortOrder), -1)

  const [img] = await db.insert(productImages).values({
    productId: id,
    url: parsed.data.url,
    alt: parsed.data.alt ?? null,
    sortOrder: maxOrder + 1,
  }).returning()

  return NextResponse.json({ image: img })
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin()
  if (error) return error
  const { searchParams } = new URL(req.url)
  const imageId = searchParams.get('imageId')
  if (!imageId) return NextResponse.json({ error: 'imageId الزامی است' }, { status: 400 })
  await db.delete(productImages).where(eq(productImages.id, imageId))
  return NextResponse.json({ ok: true })
}