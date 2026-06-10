'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { orders, orderBillingDetails, smsLogs } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { sendSmsPattern, SMS_TEMPLATES } from '@/lib/sms/sms-ir'
import { billingSchema, type BillingFormData } from './_schemas/billing'

export async function requestOfficialInvoice(
  orderId: string,
  rawData: BillingFormData,
): Promise<{ success: boolean; error?: string }> {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: 'ابتدا وارد شوید' }

  // بررسی مالکیت سفارش
  const [order] = await db.select({ userId: orders.userId, status: orders.status })
    .from(orders).where(eq(orders.id, orderId))
  if (!order) return { success: false, error: 'سفارش یافت نشد' }
  if (order.userId !== session.user.id) return { success: false, error: 'دسترسی مجاز نیست' }

  const parsed = billingSchema.safeParse(rawData)
  if (!parsed.success) {
    const msg = parsed.error.errors[0]?.message ?? 'داده‌های وارد شده معتبر نیستند'
    return { success: false, error: msg }
  }

  const data = parsed.data

  const billingRow =
    data.customerType === 'individual'
      ? {
          orderId,
          customerType: 'individual' as const,
          fullName:   data.fullName,
          nationalId: data.nationalId,
          postalCode: data.postalCode,
          address:    data.address,
        }
      : {
          orderId,
          customerType:       'legal' as const,
          companyName:        data.companyName,
          companyNationalId:  data.companyNationalId,
          economicCode:       data.economicCode,
          registrationNumber: data.registrationNumber,
          companyPhone:       data.companyPhone,
          postalCode:         data.postalCode,
          address:            data.address,
        }

  await db.transaction(async (tx) => {
    // ثبت یا بروزرسانی اطلاعات فاکتور
    await tx
      .insert(orderBillingDetails)
      .values(billingRow)
      .onConflictDoUpdate({
        target: orderBillingDetails.orderId,
        set: { ...billingRow, status: 'pending', updatedAt: new Date() },
      })

    // ثبت لاگ پیامک
    await tx.insert(smsLogs).values({
      phone:      session.user!.phone ?? '',
      userId:     session.user!.id,
      message:    `درخواست فاکتور رسمی برای سفارش ${orderId}`,
      status:     'queued',
      trigger:    'invoice_request',
      relatedType: 'order',
      relatedId:  orderId,
    })
  })

  // ارسال پیامک (خارج از تراکنش — شکست آن سفارش را لغو نمی‌کند)
  void sendSmsPattern(
    session.user!.phone ?? '',
    SMS_TEMPLATES.INVOICE_REQUEST,
    [{ name: 'ORDER_ID', value: orderId.slice(0, 8).toUpperCase() }],
  )

  return { success: true }
}
