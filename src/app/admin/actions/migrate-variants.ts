'use server'

import { db } from '@/lib/db'
import { products, productVariants } from '@/lib/db/schema'
import { sql, isNull } from 'drizzle-orm'

export async function migrateDefaultVariants(): Promise<{
  checked: number
  created: number
  skipped: number
  errors: string[]
}> {
  const errors: string[] = []

  // محصولاتی که هنوز هیچ variant ندارند — با LEFT JOIN
  const productRows = await db
    .select({
      id:     products.id,
      nameFa: products.nameFa,
      sku:    products.sku,
      price:  products.price,
      stock:  products.stock,
    })
    .from(products)
    .leftJoin(productVariants, sql`${productVariants.productId} = ${products.id}`)
    .where(sql`${products.deletedAt} IS NULL AND ${productVariants.id} IS NULL`)

  // تعداد محصولاتی که از قبل variant دارند
  const [skippedRow] = await db
    .select({ cnt: sql<number>`COUNT(DISTINCT ${productVariants.productId})::int` })
    .from(productVariants)
  const skipped = skippedRow?.cnt ?? 0

  if (productRows.length === 0) {
    return { checked: skipped, created: 0, skipped, errors: [] }
  }

  let created = 0

  for (const p of productRows) {
    // اول با SKU امتحان کن
    const inserted = await db
      .insert(productVariants)
      .values({
        productId:    p.id,
        nameFa:       'پیش‌فرض',
        sku:          p.sku ?? null,
        price:        p.price ?? null,
        comparePrice: null,
        stock:        p.stock ?? 0,
        isActive:     true,
        sortOrder:    0,
      })
      .onConflictDoNothing()
      .returning({ id: productVariants.id })

    if (inserted.length > 0) {
      created++
      continue
    }

    // اگر SKU conflict داشت، بدون SKU ثبت کن
    try {
      await db.insert(productVariants).values({
        productId:    p.id,
        nameFa:       'پیش‌فرض',
        sku:          null,
        price:        p.price ?? null,
        comparePrice: null,
        stock:        p.stock ?? 0,
        isActive:     true,
        sortOrder:    0,
      })
      created++
    } catch (err) {
      errors.push(`${p.nameFa}: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  return {
    checked: productRows.length + skipped,
    created,
    skipped,
    errors,
  }
}
