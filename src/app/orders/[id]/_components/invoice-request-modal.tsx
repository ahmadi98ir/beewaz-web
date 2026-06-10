'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { billingSchema, type BillingFormData } from '../_schemas/billing'
import { requestOfficialInvoice } from '../actions'

interface Props {
  orderId: string
  onClose: () => void
}

type Tab = 'individual' | 'legal'

function Field({
  label, error, children,
}: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-xs text-surface-500 font-medium">{label}</label>
      {children}
      {error && <p className="text-red-500 text-xs">{error}</p>}
    </div>
  )
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full px-3 py-2 rounded-xl border text-sm transition-colors bg-surface-50
        focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400
        ${props.className ?? ''}
        border-surface-200 text-surface-900 placeholder:text-surface-300`}
    />
  )
}

export function InvoiceRequestModal({ orderId, onClose }: Props) {
  const [tab, setTab] = useState<Tab>('individual')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [serverError, setServerError] = useState('')

  const {
    register, handleSubmit, setValue, watch, reset,
    formState: { errors },
  } = useForm<BillingFormData>({
    resolver: zodResolver(billingSchema),
    defaultValues: { customerType: 'individual' },
  })

  // هنگام تغییر تب، فرم را ریست کن
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    reset({ customerType: tab } as any)
  }, [tab, reset])

  const ct = watch('customerType')

  async function onSubmit(data: BillingFormData) {
    setSubmitting(true)
    setServerError('')
    try {
      const res = await requestOfficialInvoice(orderId, data)
      if (res.success) {
        setDone(true)
      } else {
        setServerError(res.error ?? 'خطای ناشناخته')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    /* ─── Overlay ─────────────────────────────────────────────────────────── */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        dir="rtl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-surface-100">
          <div>
            <h2 className="font-black text-surface-900 text-base">درخواست صدور فاکتور رسمی</h2>
            <p className="text-xs text-surface-400 mt-0.5">اطلاعات خود را برای صدور فاکتور مالیاتی وارد کنید</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-surface-100 hover:bg-surface-200 flex items-center justify-center text-surface-400 hover:text-surface-600 transition-colors"
          >
            ✕
          </button>
        </div>

        {done ? (
          /* ─── حالت موفق ─── */
          <div className="px-5 py-12 text-center space-y-3">
            <div className="text-5xl">✅</div>
            <p className="font-bold text-surface-800">درخواست شما ثبت شد</p>
            <p className="text-sm text-surface-500 leading-6">
              درخواست فاکتور رسمی دریافت شد و پس از بررسی توسط تیم مالی فروشگاه،
              فاکتور برای شما صادر خواهد شد.
            </p>
            <button
              onClick={onClose}
              className="mt-4 btn btn-primary text-sm px-8 py-2.5"
            >
              بستن
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">
            {/* ─── تب‌ها ─── */}
            <div className="flex gap-2 p-1 bg-surface-100 rounded-xl">
              {(['individual', 'legal'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTab(t)}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                    tab === t
                      ? 'bg-white shadow text-brand-600'
                      : 'text-surface-500 hover:text-surface-700'
                  }`}
                >
                  {t === 'individual' ? '👤 شخص حقیقی' : '🏢 شخص حقوقی'}
                </button>
              ))}
            </div>

            <input type="hidden" {...register('customerType')} value={tab} />

            {ct === 'individual' && (
              <>
                <Field label="نام و نام خانوادگی *" error={errors.root?.message}>
                  <Input
                    {...register('fullName')}
                    placeholder="مثال: علی محمدی"
                  />
                  {'fullName' in errors && <p className="text-red-500 text-xs">{(errors as { fullName?: { message?: string } }).fullName?.message}</p>}
                </Field>

                <Field label="کد ملی (۱۰ رقم) *" error={undefined}>
                  <Input
                    {...register('nationalId')}
                    placeholder="0012345678"
                    dir="ltr"
                    maxLength={10}
                    inputMode="numeric"
                  />
                  {'nationalId' in errors && <p className="text-red-500 text-xs">{(errors as { nationalId?: { message?: string } }).nationalId?.message}</p>}
                </Field>

                <Field label="کد پستی (۱۰ رقم) *" error={undefined}>
                  <Input
                    {...register('postalCode')}
                    placeholder="1234567890"
                    dir="ltr"
                    maxLength={10}
                    inputMode="numeric"
                  />
                  {'postalCode' in errors && <p className="text-red-500 text-xs">{(errors as { postalCode?: { message?: string } }).postalCode?.message}</p>}
                </Field>

                <Field label="آدرس دقیق *" error={undefined}>
                  <textarea
                    {...register('address')}
                    rows={3}
                    placeholder="استان، شهر، خیابان، پلاک..."
                    className="w-full px-3 py-2 rounded-xl border border-surface-200 text-sm bg-surface-50
                      focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400
                      text-surface-900 placeholder:text-surface-300 resize-none"
                  />
                  {'address' in errors && <p className="text-red-500 text-xs">{(errors as { address?: { message?: string } }).address?.message}</p>}
                </Field>
              </>
            )}

            {ct === 'legal' && (
              <>
                <Field label="نام شرکت / مؤسسه *" error={undefined}>
                  <Input {...register('companyName')} placeholder="مثال: شرکت بازرگانی بیواز" />
                  {'companyName' in errors && <p className="text-red-500 text-xs">{(errors as { companyName?: { message?: string } }).companyName?.message}</p>}
                </Field>

                <div className="grid grid-cols-2 gap-3">
                  <Field label="شناسه ملی (۱۱ رقم) *" error={undefined}>
                    <Input
                      {...register('companyNationalId')}
                      placeholder="12345678901"
                      dir="ltr"
                      maxLength={11}
                      inputMode="numeric"
                    />
                    {'companyNationalId' in errors && <p className="text-red-500 text-xs">{(errors as { companyNationalId?: { message?: string } }).companyNationalId?.message}</p>}
                  </Field>

                  <Field label="کد اقتصادی *" error={undefined}>
                    <Input {...register('economicCode')} placeholder="کد اقتصادی" dir="ltr" />
                    {'economicCode' in errors && <p className="text-red-500 text-xs">{(errors as { economicCode?: { message?: string } }).economicCode?.message}</p>}
                  </Field>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Field label="شماره ثبت *" error={undefined}>
                    <Input {...register('registrationNumber')} placeholder="شماره ثبت" dir="ltr" />
                    {'registrationNumber' in errors && <p className="text-red-500 text-xs">{(errors as { registrationNumber?: { message?: string } }).registrationNumber?.message}</p>}
                  </Field>

                  <Field label="تلفن ثابت شرکت *" error={undefined}>
                    <Input
                      {...register('companyPhone')}
                      placeholder="02112345678"
                      dir="ltr"
                      maxLength={11}
                      inputMode="numeric"
                    />
                    {'companyPhone' in errors && <p className="text-red-500 text-xs">{(errors as { companyPhone?: { message?: string } }).companyPhone?.message}</p>}
                  </Field>
                </div>

                <Field label="کد پستی (۱۰ رقم) *" error={undefined}>
                  <Input
                    {...register('postalCode')}
                    placeholder="1234567890"
                    dir="ltr"
                    maxLength={10}
                    inputMode="numeric"
                  />
                  {'postalCode' in errors && <p className="text-red-500 text-xs">{(errors as { postalCode?: { message?: string } }).postalCode?.message}</p>}
                </Field>

                <Field label="آدرس ثبتی شرکت *" error={undefined}>
                  <textarea
                    {...register('address')}
                    rows={3}
                    placeholder="استان، شهر، خیابان، پلاک..."
                    className="w-full px-3 py-2 rounded-xl border border-surface-200 text-sm bg-surface-50
                      focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400
                      text-surface-900 placeholder:text-surface-300 resize-none"
                  />
                  {'address' in errors && <p className="text-red-500 text-xs">{(errors as { address?: { message?: string } }).address?.message}</p>}
                </Field>
              </>
            )}

            {serverError && (
              <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
                {serverError}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-outline flex-1 text-sm py-2.5"
              >
                انصراف
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary flex-1 text-sm py-2.5 disabled:opacity-60"
              >
                {submitting ? 'در حال ارسال...' : 'ثبت درخواست فاکتور'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
