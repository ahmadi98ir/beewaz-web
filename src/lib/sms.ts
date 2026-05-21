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

export async function sendVerifySms(
  mobile: string,
  templateId: number,
  params: Record<string, string>,
): Promise<boolean> {
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
      return false
    }
    return true
  } catch (err) {
    console.error('[sms] verify error:', err)
    return false
  }
}

export async function sendBulkSms(mobile: string, message: string): Promise<boolean> {
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
      return false
    }
    return true
  } catch (err) {
    console.error('[sms] bulk error:', err)
    return false
  }
}
