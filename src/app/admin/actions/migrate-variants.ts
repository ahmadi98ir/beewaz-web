'use server'

import { db } from '@/lib/db'
import { products, productVariants } from '@/lib/db/schema'
import { sql } from 'drizzle-orm'

export async function migrateDefaultVariants(): Promise<{
  checked: number
  created: number
  skipped: number
  errors: string[]
}> {
  // اطمینان از وجود جدول product_variants (اگر migration هنوز اجرا نشده)
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "product_variants" (
      "id"            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      "product_id"    UUID NOT NULL REFERENCES "products"("id") ON DELETE CASCADE,
      "name_fa"       VARCHAR(120) NOT NULL,
      "sku"           VARCHAR(60) UNIQUE,
      "price"         BIGINT,
      "compare_price" BIGINT,
      "stock"         INTEGER NOT NULL DEFAULT 0,
      "weight"        INTEGER,
      "is_active"     BOOLEAN NOT NULL DEFAULT true,
      "image_url"     TEXT,
      "sort_order"    INTEGER NOT NULL DEFAULT 0,
      "created_at"    TIMESTAMPTZ NOT NULL DEFAULT now(),
      "updated_at"    TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `)

  const errors: string[] = []

  // محصولاتی که هنوز variant ندارند
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

  const [skippedRow] = await db
    .select({ cnt: sql<number>`COUNT(DISTINCT ${productVariants.productId})::int` })
    .from(productVariants)
  const skipped = Number(skippedRow?.cnt ?? 0)

  if (productRows.length === 0) {
    return { checked: skipped, created: 0, skipped, errors: [] }
  }

  let created = 0

  for (const p of productRows) {
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

    // SKU conflict — بدون SKU امتحان کن
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
