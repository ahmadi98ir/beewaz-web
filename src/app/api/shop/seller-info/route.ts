import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { siteSettings } from '@/lib/db/schema'
import { inArray } from 'drizzle-orm'

// اطلاعات فروشنده برای سربرگ فاکتور رسمی
export async function GET() {
  try {
    const rows = await db
      .select({ key: siteSettings.key, value: siteSettings.value })
      .from(siteSettings)
      .where(inArray(siteSettings.key, ['invoice_seller_name', 'tax_code', 'invoice_economic_code']))

    const map = Object.fromEntries(rows.map((r) => [r.key, r.value]))
    return NextResponse.json({
      name: map['invoice_seller_name'] || 'بیواز',
      taxCode: map['tax_code'] || '',
      economicCode: map['invoice_economic_code'] || '',
    }, {
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' },
    })
  } catch {
    return NextResponse.json({ name: 'بیواز', taxCode: '', economicCode: '' })
  }
}
