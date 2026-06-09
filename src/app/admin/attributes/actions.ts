'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { eq } from 'drizzle-orm'
import { productAttributeTypes, productAttributeValues } from '@/lib/db/schema'

const PATH = '/admin/attributes'

function unauthorized() {
  return { success: false as const, error: 'ابتدا وارد شوید' }
}

// ─── Attribute Types ──────────────────────────────────────────────────────────

export async function createAttributeType(data: {
  nameFa: string
  slug: string
  inputType: string
  sortOrder: number
}) {
  const session = await auth()
  if (!session?.user) return unauthorized()

  if (!data.nameFa.trim()) return { success: false as const, error: 'نام ویژگی الزامی است' }
  if (!data.slug.trim()) return { success: false as const, error: 'اسلاگ الزامی است' }

  try {
    const [row] = await db.insert(productAttributeTypes).values({
      nameFa:    data.nameFa.trim(),
      slug:      data.slug.trim().toLowerCase(),
      inputType: data.inputType,
      sortOrder: data.sortOrder,
    }).returning({ id: productAttributeTypes.id })

    revalidatePath(PATH)
    return { success: true as const, id: row!.id }
  } catch (err) {
    const msg = String(err)
    if (msg.includes('unique') && msg.includes('slug'))
      return { success: false as const, error: 'این اسلاگ قبلاً استفاده شده' }
    return { success: false as const, error: 'خطا در ایجاد ویژگی' }
  }
}

export async function updateAttributeType(id: string, data: {
  nameFa: string
  slug: string
  inputType: string
  sortOrder: number
}) {
  const session = await auth()
  if (!session?.user) return unauthorized()

  try {
    await db.update(productAttributeTypes)
      .set({
        nameFa:    data.nameFa.trim(),
        slug:      data.slug.trim().toLowerCase(),
        inputType: data.inputType,
        sortOrder: data.sortOrder,
      })
      .where(eq(productAttributeTypes.id, id))

    revalidatePath(PATH)
    return { success: true as const }
  } catch (err) {
    const msg = String(err)
    if (msg.includes('unique') && msg.includes('slug'))
      return { success: false as const, error: 'این اسلاگ قبلاً استفاده شده' }
    return { success: false as const, error: 'خطا در ویرایش ویژگی' }
  }
}

export async function deleteAttributeType(id: string) {
  const session = await auth()
  if (!session?.user) return unauthorized()

  await db.delete(productAttributeTypes).where(eq(productAttributeTypes.id, id))
  revalidatePath(PATH)
  return { success: true as const }
}

// ─── Attribute Values ─────────────────────────────────────────────────────────

export async function createAttributeValue(data: {
  typeId: string
  valueFa: string
  valueEn?: string
  colorHex?: string
  sortOrder: number
}) {
  const session = await auth()
  if (!session?.user) return unauthorized()

  if (!data.valueFa.trim()) return { success: false as const, error: 'نام مقدار الزامی است' }

  try {
    const [row] = await db.insert(productAttributeValues).values({
      typeId:    data.typeId,
      valueFa:   data.valueFa.trim(),
      valueEn:   data.valueEn?.trim() || null,
      colorHex:  data.colorHex?.trim() || null,
      sortOrder: data.sortOrder,
    }).returning({ id: productAttributeValues.id })

    revalidatePath(PATH)
    return { success: true as const, id: row!.id }
  } catch {
    return { success: false as const, error: 'خطا در ایجاد مقدار' }
  }
}

export async function updateAttributeValue(id: string, data: {
  valueFa: string
  valueEn?: string
  colorHex?: string
  sortOrder: number
}) {
  const session = await auth()
  if (!session?.user) return unauthorized()

  await db.update(productAttributeValues)
    .set({
      valueFa:   data.valueFa.trim(),
      valueEn:   data.valueEn?.trim() || null,
      colorHex:  data.colorHex?.trim() || null,
      sortOrder: data.sortOrder,
    })
    .where(eq(productAttributeValues.id, id))

  revalidatePath(PATH)
  return { success: true as const }
}

export async function deleteAttributeValue(id: string) {
  const session = await auth()
  if (!session?.user) return unauthorized()

  await db.delete(productAttributeValues).where(eq(productAttributeValues.id, id))
  revalidatePath(PATH)
  return { success: true as const }
}
