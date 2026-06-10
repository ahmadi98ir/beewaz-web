'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin }   from '@/lib/admin-auth'
import { db }             from '@/lib/db'
import { categories }     from '@/lib/db/schema'
import { eq }             from 'drizzle-orm'
import { z }              from 'zod'

const PATH = '/admin/categories'

const categorySchema = z.object({
  nameFa:   z.string().min(2, 'نام الزامی است').max(100),
  slug:     z.string().min(2).max(120).regex(/^[a-z0-9-]+$/, 'اسلاگ نامعتبر'),
  parentId: z.string().uuid().nullable().optional(),
  icon:     z.string().max(10).optional().or(z.literal('')),
})

export async function saveCategory(data: {
  nameFa: string; slug: string; parentId?: string | null; icon?: string
}): Promise<{ success: boolean; error?: string }> {
  const guard = await requireAdmin()
  if (!guard.ok) return { success: false, error: 'دسترسی مجاز نیست' }

  const parsed = categorySchema.safeParse(data)
  if (!parsed.success) return { success: false, error: parsed.error.errors[0]?.message }

  const d = parsed.data
  try {
    await db.insert(categories).values({
      nameFa:   d.nameFa,
      slug:     d.slug,
      parentId: d.parentId ?? null,
      icon:     d.icon || null,
    })
    revalidatePath(PATH)
    return { success: true }
  } catch (err) {
    const msg = err instanceof Error ? err.message : ''
    if (msg.includes('unique')) return { success: false, error: 'این اسلاگ قبلاً استفاده شده' }
    return { success: false, error: 'خطا در ذخیره‌سازی' }
  }
}

export async function updateCategory(
  id: string,
  data: { nameFa: string; slug: string; parentId?: string | null; icon?: string }
): Promise<{ success: boolean; error?: string }> {
  const guard = await requireAdmin()
  if (!guard.ok) return { success: false, error: 'دسترسی مجاز نیست' }

  const parsed = categorySchema.safeParse(data)
  if (!parsed.success) return { success: false, error: parsed.error.errors[0]?.message }

  const d = parsed.data
  try {
    await db.update(categories).set({
      nameFa:   d.nameFa,
      slug:     d.slug,
      parentId: d.parentId ?? null,
      icon:     d.icon || null,
    }).where(eq(categories.id, id))
    revalidatePath(PATH)
    return { success: true }
  } catch (err) {
    const msg = err instanceof Error ? err.message : ''
    if (msg.includes('unique')) return { success: false, error: 'این اسلاگ قبلاً استفاده شده' }
    return { success: false, error: 'خطا در ذخیره‌سازی' }
  }
}

export async function deleteCategory(id: string): Promise<{ success: boolean; error?: string }> {
  const guard = await requireAdmin()
  if (!guard.ok) return { success: false, error: 'دسترسی مجاز نیست' }

  try {
    await db.delete(categories).where(eq(categories.id, id))
    revalidatePath(PATH)
    return { success: true }
  } catch {
    return { success: false, error: 'خطا در حذف (ممکن است محصولاتی به این دسته وابسته باشند)' }
  }
}
