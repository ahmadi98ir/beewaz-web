'use server'

import { revalidatePath } from 'next/cache'
import { eq } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { orders } from '@/lib/db/schema/orders'

export type DeleteOrderResult =
  | { success: true }
  | { success: false; error: string }

export async function deleteOrder(id: string): Promise<DeleteOrderResult> {
  const session = await auth()
  if (!session?.user) return { success: false, error: 'ابتدا وارد شوید' }

  if (!id) return { success: false, error: 'شناسه سفارش الزامی است' }

  try {
    // orderItems and orderNotes both have onDelete: 'cascade' in schema
    await db.delete(orders).where(eq(orders.id, id))
    revalidatePath('/admin/orders')
    return { success: true }
  } catch (err) {
    console.error('[deleteOrder]', err)
    return { success: false, error: 'خطا در حذف سفارش' }
  }
}
