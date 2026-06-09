// Types and constants shared between server actions and client components

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

export const KEY_LABELS: Record<InvoiceSettingsKey, string> = {
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
