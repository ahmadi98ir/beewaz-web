import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { products, productImages } from '@/lib/db/schema'
import { eq, inArray } from 'drizzle-orm'

// نقشه SKU به عکس‌های اصلی محصول
const SKU_IMAGES: Record<string, string[]> = {
  'BH10': ['https://beewaz-co.com/wp-content/uploads/2026/04/bh10-copy.jpg'],
  'BH11': ['https://beewaz-co.com/wp-content/uploads/2026/04/bh11-beewaz-ir.jpg'],
  'BSP10': ['https://beewaz-co.com/wp-content/uploads/2026/04/bsp10-beewaz-ir.jpg'],
  'BSP30': ['https://beewaz-co.com/wp-content/uploads/2026/04/bsp30-beewaz-ir.jpg'],
  'P110': ['https://beewaz-co.com/wp-content/uploads/2026/04/p110-beewaz-ir.jpg'],
  'P100': ['https://beewaz-co.com/wp-content/uploads/2026/04/p100-beewaz-ir.jpg'],
  'BSH30': ['https://beewaz-co.com/wp-content/uploads/2026/04/bsh30-beewaz-ir.jpg'],
  'MG11': ['https://beewaz-co.com/wp-content/uploads/2026/04/mg11-beewaz-ir.jpg'],
  'MG10': ['https://beewaz-co.com/wp-content/uploads/2026/04/mg10-beewaz-ir.jpg'],
  'PS175': ['https://beewaz-co.com/wp-content/uploads/2026/04/ps175-beewaz-ir.jpg'],
  'AT10': ['https://beewaz-co.com/wp-content/uploads/2026/04/at10-beewaz-ir.jpg'],
  'AG10': ['https://beewaz-co.com/wp-content/uploads/2026/04/ag10-beewaz-ir.jpg'],
  'R10': ['https://beewaz-co.com/wp-content/uploads/2026/04/r10-beewaz-ir.jpg'],
  'PZ120': ['https://beewaz-co.com/wp-content/uploads/2026/04/pz120-beewaz-ir.jpg'],
}

export async function POST(req: Request) {
  const token = req.headers.get('x-seed-token')
  if (token !== 'beewaz-seed-2026') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const skus = Object.keys(SKU_IMAGES)
  const dbProducts = await db
    .select({ id: products.id, sku: products.sku })
    .from(products)
    .where(inArray(products.sku, skus))

  const log: string[] = []
  let inserted = 0

  for (const product of dbProducts) {
    const urls = SKU_IMAGES[product.sku]
    if (!urls) continue

    // حذف عکس‌های قبلی
    await db.delete(productImages).where(eq(productImages.productId, product.id))

    // درج عکس‌های جدید
    await db.insert(productImages).values(
      urls.map((url, i) => ({
        productId: product.id,
        url,
        alt: product.sku,
        sortOrder: i,
      }))
    )

    log.push(`${product.sku}: ${urls.length} image(s)`)
    inserted += urls.length
  }

  return NextResponse.json({ ok: true, inserted, log })
}