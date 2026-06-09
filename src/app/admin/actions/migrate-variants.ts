'use server'

import { db } from '@/lib/db'
import { products, productVariants } from '@/lib/db/schema'
import { sql, isNull, notInArray } from 'drizzle-orm'

/**
 * برای هر محصول فعال که variant ندارد، یک Variant پیش‌فرض می‌سازد.
 * ایمن و idempotent — قابل اجرای مکرر بدون ضرر.
 */
export async function migrateDefaultVariants(): Promise<{
  checked: number
  created: number
  skipped: number
  errors: string[]
}> {
  const errors: string[] = []

  // تمام product_idهایی که حداقل یک variant دارند
  const existingVariantProductIds = await db
    .selectDistinct({ productId: productVariants.productId })
    .from(productVariants)

  const alreadyHasVariant = existingVariantProductIds.map((r) => r.productId)

  // محصولاتی که هنوز variant ندارند
  const query = alreadyHasVariant.length > 0
    ? db
        .select({
          id:       products.id,
          nameFa:   products.nameFa,
          sku:      products.sku,
          price:    products.price,
          stock:    products.stock,
        })
        .from(products)
        .where(
          sql`${products.deletedAt} IS NULL AND ${products.id} NOT IN ${sql.raw(
            '(' + alreadyHasVariant.map((_, i) => `$${i + 1}`).join(',') + ')'
          )}`
        )
    : db
        .select({
          id:     products.id,
          nameFa: products.nameFa,
          sku:    products.sku,
          price:  products.price,
          stock:  products.stock,
        })
        .from(products)
        .where(isNull(products.deletedAt))

  const rows = await (alreadyHasVariant.length > 0
    ? db
        .select({ id: products.id, nameFa: products.nameFa, sku: products.sku, price: products.price, stock: products.stock })
        .from(products)
        .where(notInArray(products.id, alreadyHasVariant))
    : db
        .select({ id: products.id, nameFa: products.nameFa, sku: products.sku, price: products.price, stock: products.stock })
        .from(products)
        .where(isNull(products.deletedAt))
  )

  if (rows.length === 0) {
    return { checked: 0, created: 0, skipped: alreadyHasVariant.length, errors: [] }
  }

  let created = 0

  for (const product of rows) {
    try {
      await db.insert(productVariants).values({
        productId:   product.id,
        nameFa:      'پیش‌فرض',
        sku:         product.sku ?? null,
        price:       product.price ?? null,
        comparePrice: null,
        stock:       product.stock ?? 0,
        isActive:    true,
        sortOrder:   0,
      })
      created++
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      // اگر sku تکراری بود، بدون sku ثبت کن
      if (msg.includes('unique') || msg.includes('duplicate')) {
        try {
          await db.insert(productVariants).values({
            productId:   product.id,
            nameFa:      'پیش‌فرض',
            sku:         null,
            price:       product.price ?? null,
            comparePrice: null,
            stock:       product.stock ?? 0,
            isActive:    true,
            sortOrder:   0,
          })
          created++
        } catch (err2) {
          errors.push(`${product.nameFa}: ${err2 instanceof Error ? err2.message : String(err2)}`)
        }
      } else {
        errors.push(`${product.nameFa}: ${msg}`)
      }
    }
  }

  return {
    checked: rows.length + alreadyHasVariant.length,
    created,
    skipped: alreadyHasVariant.length,
    errors,
  }
}
