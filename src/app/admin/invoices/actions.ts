'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { inArray } from 'drizzle-orm'
import { siteSettings } from '@/lib/db/schema'
import {
  INVOICE_KEYS, KEY_LABELS,
  type InvoiceSettings, type InvoiceSettingsKey,
} from './types'

const PATH = '/admin/invoices'

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
