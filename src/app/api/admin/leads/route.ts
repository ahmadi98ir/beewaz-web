import { NextResponse } from 'next/server'
import { desc } from 'drizzle-orm'
import { db } from '@/lib/db'
import { leads } from '@/lib/db/schema'
import { requireAdmin } from '@/lib/admin-auth'

export async function GET() {
  const guard = await requireAdmin()
  if (guard.error) return guard.error

  try {
    const allLeads = await db
      .select()
      .from(leads)
      .orderBy(desc(leads.createdAt))

    return NextResponse.json({ leads: allLeads })
  } catch (err) {
    console.error('[API GET /admin/leads]', err)
    return NextResponse.json({ error: 'خطا در بارگیری لیدها' }, { status: 500 })
  }
}
