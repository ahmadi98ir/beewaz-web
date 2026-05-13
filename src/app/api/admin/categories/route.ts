import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/admin-auth'

export async function GET() {
  const guard = await requireAdmin()
  if (guard.error) return guard.error

  try {
    const list = await db.query.categories.findMany({
      orderBy: (c, { asc }) => [asc(c.sortOrder), asc(c.nameFa)],
    })
    return NextResponse.json({ categories: list })
  } catch (err) {
    console.error('[API GET /admin/categories]', err)
    return NextResponse.json({ error: 'خطا در بارگیری دسته‌بندی‌ها' }, { status: 500 })
  }
}
