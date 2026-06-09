import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { productAttributeTypes, productAttributeValues } from '@/lib/db/schema'
import { requireAdmin } from '@/lib/admin-auth'
import { asc } from 'drizzle-orm'

export async function GET() {
  const guard = await requireAdmin()
  if (!guard.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const types = await db
    .select()
    .from(productAttributeTypes)
    .orderBy(asc(productAttributeTypes.sortOrder))

  const values = await db
    .select()
    .from(productAttributeValues)
    .orderBy(asc(productAttributeValues.sortOrder))

  // گروه‌بندی values زیر type مربوطه
  const result = types.map((t) => ({
    ...t,
    values: values.filter((v) => v.typeId === t.id),
  }))

  return NextResponse.json({ attributes: result })
}
