'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { inArray } from 'drizzle-orm'
import {
  products, productVariants, productVariantOptions,
  productAttributeTypeAssignments, productAttributeValues,
  productImages,
} from '@/lib/db/schema'
import { productFormSchema, type ProductFormValues } from '../_components/schema'

// ─── Return type ─────────────────────────────────────────────────────────────

export type SaveProductResult =
  | { success: true;  productId: string }
  | { success: false; error: string; field?: string }

// ─── Main action ─────────────────────────────────────────────────────────────

export async function saveProduct(
  raw: ProductFormValues
): Promise<SaveProductResult> {
  const session = await auth()
  if (!session?.user) return { success: false, error: 'ابتدا وارد شوید' }

  // Validation سمت سرور (دفاع در عمق)
  const parsed = productFormSchema.safeParse(raw)
  if (!parsed.success) {
    const first = parsed.error.errors[0]
    return { success: false, error: first?.message ?? 'اطلاعات نامعتبر', field: first?.path.join('.') }
  }

  const data = parsed.data

  try {
    const productId = await db.transaction(async (tx) => {

      // ── ۱. ثبت در products ───────────────────────────────────────────────
      const totalStock = data.hasVariants
        ? (data.variants?.reduce((s, v) => s + (v.stock ?? 0), 0) ?? 0)
        : data.stock

      const [newProduct] = await tx
        .insert(products)
        .values({
          categoryId:    data.categoryId,
          sku:           data.sku,
          nameFa:        data.nameFa,
          slug:          data.slug,
          descriptionFa: data.descriptionFa || null,
          price:         data.price,
          comparePrice:  data.comparePrice || null,
          stock:         totalStock,
          status:        data.status,
          isFeatured:    data.isFeatured,
          metaTitle:     data.metaTitle || null,
          metaDesc:      data.metaDesc || null,
        })
        .returning({ id: products.id })

      if (!newProduct) throw new Error('insert_product_failed')
      const pid = newProduct.id

      // ── ۲. ثبت Variants ──────────────────────────────────────────────────
      if (data.hasVariants && data.variants?.length) {

        // همه attribute value idهای درگیر را یکجا جمع می‌کنیم
        const allValueIds = [...new Set(
          data.variants.flatMap((v) => v.attributeValueIds)
        )]

        // نگاشت valueId → typeId برای ساخت assignments
        const valueTypeMap = new Map<string, string>()
        if (allValueIds.length > 0) {
          const rows = await tx
            .select({ id: productAttributeValues.id, typeId: productAttributeValues.typeId })
            .from(productAttributeValues)
            .where(inArray(productAttributeValues.id, allValueIds))
          rows.forEach((r) => valueTypeMap.set(r.id, r.typeId))
        }

        // ثبت هر variant
        for (const variant of data.variants) {
          const [newVariant] = await tx
            .insert(productVariants)
            .values({
              productId: pid,
              name:      variant.label,
              sku:       variant.sku || null,
              price:     String(variant.price ?? data.price),
              stock:     variant.stock ?? 0,
            })
            .returning({ id: productVariants.id })

          if (!newVariant) throw new Error('insert_variant_failed')

          // ثبت ارتباط variant ↔ attribute values
          if (variant.attributeValueIds.length > 0) {
            await tx
              .insert(productVariantOptions)
              .values(
                variant.attributeValueIds.map((avId) => ({
                  variantId:        newVariant.id,
                  attributeValueId: avId,
                }))
              )
          }
        }

        // ── ۳. ثبت attribute type assignments روی product ────────────────
        const usedTypeIds = [...new Set([...valueTypeMap.values()])]
        if (usedTypeIds.length > 0) {
          await tx
            .insert(productAttributeTypeAssignments)
            .values(usedTypeIds.map((typeId) => ({ productId: pid, attributeTypeId: typeId })))
            .onConflictDoNothing()
        }

      } else {
        // محصول ساده — یک variant پیش‌فرض (برای سازگاری با معماری جدید)
        await tx.insert(productVariants).values({
          productId: pid,
          name:      'پیش‌فرض',
          sku:       data.sku,
          price:     String(data.price),
          stock:     data.stock,
        })
      }

      // ── ۴. ثبت تصاویر محصول ─────────────────────────────────────────────
      if (data.images && data.images.length > 0) {
        await tx.insert(productImages).values(
          data.images.map((img, i) => ({
            productId: pid,
            url:       img.url,
            alt:       null,
            isPrimary: img.isPrimary,
            sortOrder: i,
          }))
        )
      }

      return pid
    })

    revalidatePath('/admin/products')
    return { success: true, productId }

  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    if (msg.includes('unique') && msg.includes('sku'))
      return { success: false, error: 'این SKU قبلاً استفاده شده', field: 'sku' }
    if (msg.includes('unique') && msg.includes('slug'))
      return { success: false, error: 'این اسلاگ قبلاً استفاده شده', field: 'slug' }
    console.error('[saveProduct]', err)
    return { success: false, error: 'خطا در ذخیره‌سازی: ' + msg }
  }
}
