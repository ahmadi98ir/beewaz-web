'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { inArray } from 'drizzle-orm'
import {
  products, productVariants, productVariantOptions,
  productAttributeTypeAssignments, productAttributeValues,
  productImages, productSpecs,
} from '@/lib/db/schema'
import { productFormSchema, type ProductFormValues } from '../_components/schema'

export type SaveProductResult =
  | { success: true;  productId: string }
  | { success: false; error: string; field?: string }

export async function saveProduct(
  raw: ProductFormValues
): Promise<SaveProductResult> {
  const session = await auth()
  if (!session?.user) return { success: false, error: 'ابتدا وارد شوید' }

  const parsed = productFormSchema.safeParse(raw)
  if (!parsed.success) {
    const first = parsed.error.errors[0]
    return { success: false, error: first?.message ?? 'اطلاعات نامعتبر', field: first?.path.join('.') }
  }

  const data = parsed.data

  try {
    const productId = await db.transaction(async (tx) => {

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

      if (data.hasVariants && data.variants?.length) {
        const allValueIds = [...new Set(
          data.variants.flatMap((v) => v.attributeValueIds)
        )]

        const valueTypeMap = new Map<string, string>()
        if (allValueIds.length > 0) {
          const rows = await tx
            .select({ id: productAttributeValues.id, typeId: productAttributeValues.typeId })
            .from(productAttributeValues)
            .where(inArray(productAttributeValues.id, allValueIds))
          rows.forEach((r) => valueTypeMap.set(r.id, r.typeId))
        }

        for (const variant of data.variants) {
          const [newVariant] = await tx
            .insert(productVariants)
            .values({
              productId:    pid,
              nameFa:       variant.label,
              sku:       variant.sku || null,
              price:        variant.price ?? data.price,
              comparePrice: typeof variant.comparePrice === 'number' ? variant.comparePrice : null,
              stock:     variant.stock ?? 0,
            })
            .returning({ id: productVariants.id })

          if (!newVariant) throw new Error('insert_variant_failed')

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

        const usedTypeIds = [...new Set([...valueTypeMap.values()])]
        if (usedTypeIds.length > 0) {
          await tx
            .insert(productAttributeTypeAssignments)
            .values(usedTypeIds.map((typeId) => ({ productId: pid, attributeTypeId: typeId })))
            .onConflictDoNothing()
        }

      } else {
        await tx.insert(productVariants).values({
          productId:    pid,
          nameFa:       'پیش‌فرض',
          sku:       data.sku,
          price:        data.price,
          comparePrice: data.comparePrice || null,
          isActive:     true,
          sortOrder:    0,
          stock:     data.stock,
        })
      }

      // ساخت آرایه تصاویر: تصویر اصلی + گالری
      const imageRows: { productId: string; url: string; alt: null; isPrimary: boolean; sortOrder: number }[] = []
      if (data.mainImage) {
        imageRows.push({ productId: pid, url: data.mainImage, alt: null, isPrimary: true, sortOrder: 0 })
      }
      if (data.gallery?.length) {
        data.gallery.forEach((url, i) => {
          imageRows.push({ productId: pid, url, alt: null, isPrimary: false, sortOrder: i + 1 })
        })
      }
      if (imageRows.length > 0) {
        await tx.insert(productImages).values(imageRows)
      }

      if (data.specs && data.specs.length > 0) {
        await tx.insert(productSpecs).values(
          data.specs.map((spec, i) => ({
            productId: pid,
            keyFa:     spec.keyFa,
            valueFa:   spec.valueFa,
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
