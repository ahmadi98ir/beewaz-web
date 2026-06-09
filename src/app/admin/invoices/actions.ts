'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { eq, inArray } from 'drizzle-orm'
import { siteSettings } from '@/lib/db/schema'

const PATH = '/admin/invoices'

// کلیدهای تنظیمات فاکتور در جدول site_settings
export const INVOICE_KEYS = [
  'invoice_company_name',
  'invoice_national_id',
  'invoice_economic_code',
  'invoice_registration_no',
  'invoice_address',
  'invoice_postal_code',
  'invoice_phone',
  'invoice_footer_text',
  'invoice_logo_url',
] as const

export type InvoiceSettingsKey = (typeof INVOICE_KEYS)[number]

export interface InvoiceSettings {
  invoice_company_name:    string
  invoice_national_id:     string
  invoice_economic_code:   string
  invoice_registration_no: string
  invoice_address:         string
  invoice_postal_code:     string
  invoice_phone:           string
  invoice_footer_text:     string
  invoice_logo_url:        string
}

const KEY_LABELS: Record<InvoiceSettingsKey, string> = {
  invoice_company_name:    'نام حقوقی شرکت / فروشگاه',
  invoice_national_id:     'شناسه ملی',
  invoice_economic_code:   'کد اقتصادی',
  invoice_registration_no: 'شماره ثبت',
  invoice_address:         'آدرس دقیق',
  invoice_postal_code:     'کد پستی',
  invoice_phone:           'تلفن تماس',
  invoice_footer_text:     'متن پاورقی فاکتور',
  invoice_logo_url:        'آدرس لوگو (URL)',
}

// ─── Invoice Order type (shared) ─────────────────────────────────────────────

export interface InvoiceOrder {
  id: string
  invoiceNumber: number | null
  createdAt: string
  paidAt: string | null
  status: string
  totalAmount: string
  shippingAmount: string
  discountAmount: string
  taxAmount: string
  paymentMethod: string | null
  customerName: string | null
  customerPhone: string
  shippingAddress: {
    fullName?: string
    phone?: string
    province?: string
    city?: string
    street?: string
    alley?: string
    plaque?: string
    unit?: string
    postalCode?: string
  } | null
  billingSnapshot: {
    customerType?: string
    nationalId?: string
    companyName?: string
    companyNationalId?: string
    economicCode?: string
    registrationNumber?: string
    legalAddress?: string
    legalPostalCode?: string
  } | null
  items: {
    id: string
    productName: string
    variantName: string | null
    sku: string | null
    quantity: number
    unitPrice: string
    totalPrice: string
  }[]
}

// ─── Load ─────────────────────────────────────────────────────────────────────

export async function loadInvoiceSettings(): Promise<InvoiceSettings> {
  const rows = await db
    .select({ key: siteSettings.key, value: siteSettings.value })
    .from(siteSettings)
    .where(inArray(siteSettings.key, [...INVOICE_KEYS]))

  const map = Object.fromEntries(rows.map((r) => [r.key, r.value ?? '']))
  return Object.fromEntries(
    INVOICE_KEYS.map((k) => [k, map[k] ?? ''])
  ) as unknown as InvoiceSettings
}

// ─── Save ─────────────────────────────────────────────────────────────────────

export async function saveInvoiceSettings(
  data: Partial<InvoiceSettings>
): Promise<{ success: boolean; error?: string }> {
  const session = await auth()
  if (!session?.user) return { success: false, error: 'ابتدا وارد شوید' }

  const entries = Object.entries(data) as [InvoiceSettingsKey, string][]

  await db.transaction(async (tx) => {
    for (const [key, value] of entries) {
      if (!INVOICE_KEYS.includes(key as InvoiceSettingsKey)) continue
      await tx
        .insert(siteSettings)
        .values({
          key,
          value: value ?? '',
          label: KEY_LABELS[key as InvoiceSettingsKey] ?? key,
          group: 'invoice',
          type: 'text',
        })
        .onConflictDoUpdate({
          target: siteSettings.key,
          set: { value: value ?? '' },
        })
    }
  })

  revalidatePath(PATH)
  return { success: true }
}
