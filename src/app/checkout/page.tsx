import type { Metadata } from 'next'
import { Suspense } from 'react'
import CheckoutClient from './checkout-client'

export const metadata: Metadata = {
  title: 'تکمیل خرید',
  robots: { index: false, follow: false },
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-surface-50 flex items-center justify-center"><div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" /></div>}>
      <CheckoutClient />
    </Suspense>
  )
}
