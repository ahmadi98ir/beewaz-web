import { Suspense } from 'react'
import type { Metadata } from 'next'
import RegisterForm from './register-form'

export const metadata: Metadata = {
  title: 'ثبت‌نام',
  robots: { index: false, follow: false },
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-surface-50 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  )
}
