import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { siteSettings } from '@/lib/db/schema'
import { inArray } from 'drizzle-orm'

const PUBLIC_KEYS = ['return_window_days', 'site_name', 'site_phone', 'contact_phone']

export async function GET() {
  const rows = await db.select().from(siteSettings).where(inArray(siteSettings.key, PUBLIC_KEYS))
  const result: Record<string, string> = {}
  for (const r of rows) { if (r.value) result[r.key] = r.value }
  return NextResponse.json(result)
}
