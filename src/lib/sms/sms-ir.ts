const BASE_URL = 'https://api.sms.ir/v1'

function apiKey() {
  return process.env.SMS_IR_API_KEY ?? ''
}

export interface SmsParameter {
  name: string
  value: string
}

export interface SendPatternResult {
  ok: boolean
  messageId?: string
  error?: string
}

export const SMS_TEMPLATES = {
  OTP:             821506,
  ORDER_CONFIRM:   171874,
  INVOICE_REQUEST: 100000, // placeholder — replace with real template ID
} as const

export async function sendSmsPattern(
  mobile: string,
  templateId: number,
  parameters: SmsParameter[],
): Promise<SendPatternResult> {
  try {
    const res = await fetch(`${BASE_URL}/send/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': apiKey(),
      },
      body: JSON.stringify({ mobile, templateId, parameters }),
    })
    const data = await res.json() as { status: number; message: string; data?: { messageId: string } }
    if (data.status !== 1) {
      console.error('[sms-ir] pattern send failed:', data.message)
      return { ok: false, error: data.message }
    }
    return { ok: true, messageId: data.data?.messageId }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[sms-ir] pattern send error:', msg)
    return { ok: false, error: msg }
  }
}
