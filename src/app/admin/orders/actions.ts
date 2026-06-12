'use server'

import { revalidatePath } from 'next/cache'
import { eq } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { orders } from '@/lib/db/schema/orders'
import { returnRequests } from '@/lib/db/schema/returns'

export type DeleteOrderResult =
  | { success: true }
  | { success: false; error: string }

export async function deleteOrder(id: string): Promise<DeleteOrderResult> {
  const session = await auth()
  if (!session?.user) return { success: false, error: 'ابتدا وارد شوید' }

  if (!id) return { success: false, error: 'شناسه سفارش الزامی است' }

  try {
    await db.delete(orders).where(eq(orders.id, id))
    revalidatePath('/admin/orders')
    return { success: true }
  } catch (err) {
    console.error('[deleteOrder]', err)
    return { success: false, error: 'خطا در حذف سفارش' }
  }
}

export type UpdateReturnResult =
  | { success: true }
  | { success: false; error: string }

export async function updateReturnStatus(
  returnId: string,
  status: 'approved' | 'rejected' | 'refunded',
  adminNotes?: string,
): Promise<UpdateReturnResult> {
  const session = await auth()
  if (!session?.user) return { success: false, error: 'ابتدا وارد شوید' }

  if (!returnId) return { success: false, error: 'شناسه مرجوعی الزامی است' }

  try {
    const shouldResolve = status === 'refunded' || status === 'rejected'
    await db.update(returnRequests)
      .set({
        status,
        adminNotes: adminNotes ?? null,
        ...(shouldResolve ? { resolvedAt: new Date() } : {}),
      })
      .where(eq(returnRequests.id, returnId))

    revalidatePath('/admin/orders')
    return { success: true }
  } catch (err) {
    console.error('[updateReturnStatus]', err)
    return { success: false, error: 'خطا در بروزرسانی وضعیت مرجوعی' }
  }
}
