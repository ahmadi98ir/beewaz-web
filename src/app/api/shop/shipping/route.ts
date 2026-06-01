import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { siteSettings } from '@/lib/db/schema'
import { inArray } from 'drizzle-orm'

const DEFAULTS = { shippingCost: 150_000, freeThreshold: 2_000_000, vatRate: 10 }

export async function GET() {
  try {
    const rows = await db
      .select({ key: siteSettings.key, value: siteSettings.value })
      .from(siteSettings)
      .where(inArray(siteSettings.key, ['shipping_cost', 'free_shipping_threshold', 'vat_rate']))

    const map = Object.fromEntries(rows.map((r) => [r.key, r.value]))
    return NextResponse.json({
      shippingCost:  parseInt(map['shipping_cost'] ?? String(DEFAULTS.shippingCost), 10),
      freeThreshold: parseInt(map['free_shipping_threshold'] ?? String(DEFAULTS.freeThreshold), 10),
      vatRate:       parseInt(map['vat_rate'] ?? String(DEFAULTS.vatRate), 10),
    }, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
    })
  } catch {
    return NextResponse.json(DEFAULTS)
  }
}
