import { db } from '@/lib/db'
import { smsLogs } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

const SMS_IR_API = 'https://api.sms.ir/v1'

function apiKey() {
  return process.env.SMS_IR_API_KEY ?? ''
}

function lineNumber() {
  return Number(process.env.SMS_IR_LINE_NUMBER ?? '10000047956')
}

export const SMS_TEMPLATES = {
  OTP: 821506,
  ORDER_CONFIRM: 171874,
} as const

export type SmsTrigger =
  | 'order_status_change'
  | 'otp'
  | 'payment_success'
  | 'shipment_tracking'
  | 'low_stock_alert'
  | 'manual'
  | 'invoice_request'
  | 'cart_abandonment'

export interface SmsLogMeta {
  trigger: SmsTrigger
  userId?: string
  relatedType?: string
  relatedId?: string
}

async function logSms(phone: string, message: string, meta: SmsLogMeta) {
  try {
    const [row] = await db.insert(smsLogs).values({
      phone,
      message,
      status: 'queued',
      trigger: meta.trigger,
      userId: meta.userId,
      relatedType: meta.relatedType,
      relatedId: meta.relatedId,
    }).returning({ id: smsLogs.id })
    return row?.id
  } catch (err) {
    console.error('[sms] log insert failed:', err)
    return undefined
  }
}

async function finalizeSmsLog(logId: string | undefined, ok: boolean, errorMessage?: string) {
  if (!logId) return
  try {
    await db.update(smsLogs)
      .set({
        status: ok ? 'sent' : 'failed',
        sentAt: ok ? new Date() : undefined,
        errorMessage,
      })
      .where(eq(smsLogs.id, logId))
  } catch (err) {
    console.error('[sms] log update failed:', err)
  }
}

export async function sendVerifySms(
  mobile: string,
  templateId: number,
  params: Record<string, string>,
  meta?: SmsLogMeta,
): Promise<boolean> {
  const logId = meta ? await logSms(mobile, `قالب ${templateId}: ${JSON.stringify(params)}`, meta) : undefined
  try {
    const res = await fetch(`${SMS_IR_API}/send/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey() },
      body: JSON.stringify({
        mobile,
        templateId,
        parameters: Object.entries(params).map(([name, value]) => ({ name, value })),
      }),
    })
    const data = await res.json() as { status: number; message: string }
    if (data.status !== 1) {
      console.error('[sms] verify failed:', data.message)
      await finalizeSmsLog(logId, false, data.message)
      return false
    }
    await finalizeSmsLog(logId, true)
    return true
  } catch (err) {
    console.error('[sms] verify error:', err)
    await finalizeSmsLog(logId, false, err instanceof Error ? err.message : String(err))
    return false
  }
}

export async function sendBulkSms(mobile: string, message: string, meta?: SmsLogMeta): Promise<boolean> {
  const logId = meta ? await logSms(mobile, message, meta) : undefined
  try {
    const res = await fetch(`${SMS_IR_API}/send/bulk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey() },
      body: JSON.stringify({
        lineNumber: lineNumber(),
        messageText: message,
        mobiles: [mobile],
      }),
    })
    const data = await res.json() as { status: number; message: string }
    if (data.status !== 1) {
      console.error('[sms] bulk failed:', data.message)
      await finalizeSmsLog(logId, false, data.message)
      return false
    }
    await finalizeSmsLog(logId, true)
    return true
  } catch (err) {
    console.error('[sms] bulk error:', err)
    await finalizeSmsLog(logId, false, err instanceof Error ? err.message : String(err))
    return false
  }
}
