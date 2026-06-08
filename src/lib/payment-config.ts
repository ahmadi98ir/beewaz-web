/**
 * خواندن تنظیمات درگاه پرداخت از DB (با fallback به env)
 */

import { db } from '@/lib/db'
import { siteSettings } from '@/lib/db/schema'
import { inArray } from 'drizzle-orm'

async function getValues(keys: string[]): Promise<Record<string, string>> {
  try {
    const rows = await db.select().from(siteSettings).where(inArray(siteSettings.key, keys))
    const result: Record<string, string> = {}
    for (const row of rows) result[row.key] = row.value ?? ''
    return result
  } catch {
    return {}
  }
}

export async function getZarinpalConfig() {
  const vals = await getValues(['zarinpal_merchant_id', 'zarinpal_sandbox', 'zarinpal_enabled'])
  const merchantId = vals['zarinpal_merchant_id'] || process.env.ZARINPAL_MERCHANT_ID || ''
  const sandbox = vals['zarinpal_sandbox'] === 'true' || process.env.ZARINPAL_SANDBOX === 'true'
  const enabled = vals['zarinpal_enabled'] !== 'false'

  const base = sandbox ? 'https://sandbox.zarinpal.com' : 'https://api.zarinpal.com'
  const startPayBase = sandbox ? 'https://sandbox.zarinpal.com' : 'https://www.zarinpal.com'

  return {
    merchantId,
    sandbox,
    enabled,
    requestUrl: `${base}/pg/v4/payment/request.json`,
    verifyUrl: `${base}/pg/v4/payment/verify.json`,
    startPayUrl: `${startPayBase}/pg/StartPay/`,
  }
}

export async function getIdpayConfig() {
  const vals = await getValues(['idpay_api_key', 'idpay_sandbox', 'idpay_enabled'])
  const apiKey = vals['idpay_api_key'] || process.env.IDPAY_API_KEY || ''
  const sandbox = vals['idpay_sandbox'] === 'true' || process.env.IDPAY_SANDBOX === 'true'
  const enabled = vals['idpay_enabled'] !== 'false'

  return { apiKey, sandbox, enabled }
}
