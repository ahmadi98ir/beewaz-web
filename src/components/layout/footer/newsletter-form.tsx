'use client'

import { useState } from 'react'

export function NewsletterForm() {
  const [phone, setPhone] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (phone.length >= 10) setSubmitted(true)
  }

  if (submitted) {
    return (
      <p className="text-xs text-green-400 py-2">
        ✓ شماره شما ثبت شد. متشکریم!
      </p>
    )
  }

  return (
    <form className="flex gap-2" onSubmit={onSubmit} aria-label="عضویت در خبرنامه">
      <input
        type="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="شماره موبایل"
        className="flex-1 min-w-0 px-3 py-2 text-sm rounded-lg bg-white/10 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-brand-500 focus:bg-white/15 transition-colors"
        dir="ltr"
        maxLength={11}
      />
      <button
        type="submit"
        className="flex-shrink-0 px-3 py-2 text-xs font-semibold rounded-lg bg-brand-600 hover:bg-brand-700 transition-colors"
      >
        عضو شو
      </button>
    </form>
  )
}
