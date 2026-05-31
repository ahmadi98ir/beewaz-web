import type { Metadata } from 'next'
import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import CheckoutClient from './checkout-client'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { siteSettings } from '@/lib/db/schema'
import { inArray } from 'drizzle-orm'

export const metadata: Metadata = {
  title: 'تکمیل خرید',
  robots: { index: false, follow: false },
}

export interface BankCardSettings {
  enabled: boolean
  number: string
  holder: string
  bank: string
}

async function getBankCardSettings(): Promise<BankCardSettings> {
  try {
    const rows = await db.select().from(siteSettings).where(
      inArray(siteSettings.key, ['bank_card_enabled', 'bank_card_number', 'bank_card_holder', 'bank_card_bank'])
    )
    const map: Record<string, string> = {}
    for (const r of rows) { if (r.key) map[r.key] = r.value ?? '' }
    return {
      enabled: map['bank_card_enabled'] === 'true',
      number:  map['bank_card_number'] ?? '',
      holder:  map['bank_card_holder'] ?? '',
      bank:    map['bank_card_bank'] ?? '',
    }
  } catch {
    return { enabled: false, number: '', holder: '', bank: '' }
  }
}

export default async function CheckoutPage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/login?callbackUrl=/checkout')
  }

  const phone = (session.user as { phone?: string }).phone ?? ''
  const userName = session.user.name ?? ''
  const bankCard = await getBankCardSettings()
  return (
    <Suspense fallback={<div className="min-h-screen bg-surface-50 flex items-center justify-center"><div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" /></div>}>
      <CheckoutClient bankCard={bankCard} phone={phone} userName={userName} />
    </Suspense>
  )
}
