'use client'

import { useEffect, useState, useTransition } from 'react'
import { useForm, FormProvider, Controller, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter }   from 'next/navigation'
import Link            from 'next/link'
import { productFormSchema, type ProductFormValues } from './schema'
import { FormCard, Field, inputCls, errorInputCls }  from './form-card'
import { VariantBuilder }     from './variant-builder'
import { MainImageUploader }  from './main-image-uploader'
import { GalleryUploader }    from './gallery-uploader'
import { saveProduct }        from '../actions/product'

// ─── Icons ────────────────────────────────────────────────────────────────────

const IconInfo    = () => <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" /></svg>
const IconVariant = () => <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" /></svg>
const IconPrice   = () => <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M10.75 10.818v2.614A3.13 3.13 0 0011.888 13c.482-.315.612-.648.612-.875 0-.227-.13-.56-.612-.875a3.13 3.13 0 00-1.138-.432zM8.33 8.62c.053.055.115.11.184.164.208.16.46.284.736.363V6.603a2.45 2.45 0 00-.35.13c-.14.065-.27.143-.386.233-.377.292-.514.627-.514.909 0 .184.058.39.33.576zm9.09-8.618a.75.75 0 01.75.75v4.638c0 .196-.08.385-.22.524l-9.108 9.098a3.5 3.5 0 01-4.949-4.950l9.108-9.098a.75.75 0 01.524-.22l4.638-.013h.057zm-3.32 2.03a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" /></svg>
const IconImage   = () => <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M1 5.25A2.25 2.25 0 013.25 3h13.5A2.25 2.25 0 0119 5.25v9.5A2.25 2.25 0 0116.75 17H3.25A2.25 2.25 0 011 14.75v-9.5zm1.5 5.81v3.69c0 .414.336.75.75.75h13.5a.75.75 0 00.75-.75v-2.69l-2.22-2.219a.75.75 0 00-1.06 0l-1.91 1.909.47.47a.75.75 0 11-1.06 1.06L6.53 8.091a.75.75 0 00-1.06 0l-2.97 2.97zM12 7a1 1 0 11-2 0 1 1 0 012 0z" clipRule="evenodd" /></svg>
const IconSeo     = () => <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" /></svg>
const IconSpecs   = () => <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M5 4a1 1 0 00-1 1v1a1 1 0 002 0V5a1 1 0 00-1-1zM5 10a1 1 0 00-1 1v1a1 1 0 102 0v-1a1 1 0 00-1-1zM5 16a1 1 0 00-1 1v1a1 1 0 102 0v-1a1 1 0 00-1-1zM9 4a1 1 0 000 2h6a1 1 0 100-2H9zM9 10a1 1 0 000 2h6a1 1 0 100-2H9zM9 16a1 1 0 000 2h6a1 1 0 100-2H9z" clipRule="evenodd" /></svg>

// ─── Status options ───────────────────────────────────────────────────────────

const STATUS_OPTIONS = [
  { value: 'draft',        label: 'پیش‌نویس',  color: 'text-white/50' },
  { value: 'active',       label: 'فعال',       color: 'text-emerald-400' },
  { value: 'archived',     label: 'آرشیو',      color: 'text-white/30' },
  { value: 'out_of_stock', label: 'ناموجود',    color: 'text-red-400' },
] as const

// ─── Slug generator ───────────────────────────────────────────────────────────
// اگر نام کاملاً فارسی بود، از timestamp برای اسلاگ منحصربه‌فرد استفاده می‌کند

function slugify(str: string): string {
  const cleaned = str
    .toLowerCase()
    .replace(/[؀-ۿ\s]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
  return cleaned.length >= 2 ? cleaned : `product-${Date.now().toString(36)}`
}

// ─── Error Summary ────────────────────────────────────────────────────────────

function ErrorSummary({ errors }: { errors: Record<string, unknown> }) {
  const messages: string[] = []

  function collect(obj: Record<string, unknown>, prefix = '') {
    for (const [k, v] of Object.entries(obj)) {
      if (!v) continue
      if (typeof v === 'object' && 'message' in v && typeof (v as { message: unknown }).message === 'string') {
        messages.push((v as { message: string }).message)
      } else if (typeof v === 'object') {
        collect(v as Record<string, unknown>, prefix ? `${prefix}.${k}` : k)
      }
    }
  }
  collect(errors)

  if (messages.length === 0) return null

  return (
    <div className="rounded-xl bg-red-500/[0.08] border border-red-500/25 p-4 space-y-2">
      <p className="text-red-400 text-xs font-bold flex items-center gap-2">
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 flex-shrink-0">
          <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
        </svg>
        لطفاً موارد زیر را تصحیح کنید:
      </p>
      <ul className="space-y-1 pr-6">
        {messages.slice(0, 6).map((m, i) => (
          <li key={i} className="text-red-300/80 text-xs list-disc">{m}</li>
        ))}
        {messages.length > 6 && (
          <li className="text-red-300/50 text-xs">و {messages.length - 6} مورد دیگر…</li>
        )}
      </ul>
    </div>
  )
}

// ─── Main Form ────────────────────────────────────────────────────────────────

interface Category { id: string; nameFa: string; parentId: string | null }

export function ProductFormV2() {
  const [categories,   setCategories]   = useState<Category[]>([])
  const [serverError,  setServerError]  = useState<string | null>(null)
  const [showErrors,   setShowErrors]   = useState(false)
  const [aiLoading,    setAiLoading]    = useState(false)
  const [isPending,    startTransition] = useTransition()
  const router = useRouter()

  const methods = useForm<ProductFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(productFormSchema) as any,
    defaultValues: {
      nameFa: '', slug: '', sku: '', categoryId: null,
      descriptionFa: '', weight: undefined,
      status: 'draft', isFeatured: false,
      price: 0, comparePrice: undefined, stock: 0,
      hasVariants: false, variants: [],
      mainImage: '', gallery: [],
      specs: [],
      warrantyDays: 0,
      metaTitle: '', metaDesc: '',
    },
  })

  const {
    register, handleSubmit, watch, setValue,
    formState: { errors },
    control,
  } = methods

  // Specs dynamic array
  const { fields: specFields, append: appendSpec, remove: removeSpec } = useFieldArray({
    control,
    name: 'specs',
  })

  const nameFa      = watch('nameFa')
  const hasVariants = watch('hasVariants')
  const descValue   = watch('descriptionFa') ?? ''

  // بارگذاری دسته‌بندی‌ها
  useEffect(() => {
    fetch('/api/admin/categories')
      .then((r) => r.json())
      .then((d: { categories?: Category[] }) => setCategories(d.categories ?? []))
      .catch(() => {})
  }, [])

  // تولید خودکار slug از نام
  useEffect(() => {
    if (nameFa) setValue('slug', slugify(nameFa), { shouldValidate: false })
  }, [nameFa, setValue])

  // ─── Submit ──────────────────────────────────────────────────────────────────

  function onSubmit(data: ProductFormValues) {
    setServerError(null)
    setShowErrors(false)
    startTransition(async () => {
      const result = await saveProduct(data)
      if (result.success) {
        router.push('/admin/products')
      } else {
        setServerError(result.error)
        if (result.field) {
          methods.setError(result.field as keyof ProductFormValues, { message: result.error })
        }
      }
    })
  }

  // وقتی Zod validation شکست خورد
  function onInvalid() {
    setShowErrors(true)
    // Scroll به بالای صفحه
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // ─── AI: تولید محتوای توضیحات ─────────────────────────────────────────────────

  async function handleAiGenerate() {
    if (!nameFa) return
    setAiLoading(true)
    try {
      const specs = methods.getValues('specs')
      const res = await fetch('/api/admin/products/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: nameFa, specs }),
      })
      const data = await res.json() as { descriptionFa?: string; error?: string }
      if (res.ok && data.descriptionFa) {
        setValue('descriptionFa', data.descriptionFa, { shouldValidate: true })
      }
    } finally {
      setAiLoading(false)
    }
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-5">

        {/* ─── Error Summary (نمایش بعد از اولین submit ناموفق) ────────── */}
        {showErrors && <ErrorSummary errors={errors as Record<string, unknown>} />}

        {/* ─── اطلاعات پایه ──────────────────────────────────────────────── */}
        <FormCard title="اطلاعات پایه" subtitle="نام، کد و دسته‌بندی محصول" icon={<IconInfo />}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="نام محصول" required error={errors.nameFa?.message}>
              <input
                {...register('nameFa')}
                placeholder="مثلاً: کاناپه راحتی مدل آریا"
                className={errors.nameFa ? errorInputCls : inputCls}
              />
            </Field>

            <Field label="اسلاگ (URL)" required error={errors.slug?.message} hint="فقط حروف انگلیسی، اعداد و خط‌تیره">
              <input
                {...register('slug')}
                placeholder="kanape-rahat-aria"
                className={errors.slug ? errorInputCls : inputCls}
                dir="ltr"
              />
            </Field>

            <Field label="کد محصول (SKU)" required error={errors.sku?.message}>
              <input
                {...register('sku')}
                placeholder="PROD-001"
                className={errors.sku ? errorInputCls : inputCls}
                dir="ltr"
              />
            </Field>

            {/* دسته‌بندی با لینک ایجاد */}
            <Field label="دسته‌بندی" error={errors.categoryId?.message}>
              <div className="space-y-1.5">
                <Controller
                  control={control}
                  name="categoryId"
                  render={({ field }) => (
                    <select
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(e.target.value || null)}
                      className={errors.categoryId ? errorInputCls : inputCls}
                    >
                      <option value="">بدون دسته‌بندی</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.nameFa}</option>
                      ))}
                    </select>
                  )}
                />
                <a
                  href="/admin/categories"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[10px] text-indigo-400/70 hover:text-indigo-400 transition-colors"
                >
                  <svg viewBox="0 0 12 12" fill="currentColor" className="w-3 h-3">
                    <path fillRule="evenodd" d="M6 1a.75.75 0 01.75.75v3.5h3.5a.75.75 0 010 1.5h-3.5v3.5a.75.75 0 01-1.5 0v-3.5H1.75a.75.75 0 010-1.5h3.5V1.75A.75.75 0 016 1z" clipRule="evenodd" />
                  </svg>
                  مدیریت دسته‌بندی‌ها
                </a>
              </div>
            </Field>

            <Field label="وزن (گرم)" error={errors.weight?.message}>
              <input {...register('weight')} type="number" placeholder="۰" className={errors.weight ? errorInputCls : inputCls} dir="ltr" />
            </Field>

            <Field label="وضعیت">
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <select {...field} className={inputCls}>
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                )}
              />
            </Field>

            {/* توضیحات + AI دستیار */}
            <div className="sm:col-span-2">
              <Field label="توضیحات" error={errors.descriptionFa?.message}>
                <div className="space-y-2">
                  <textarea
                    {...register('descriptionFa')}
                    rows={4}
                    placeholder="توضیحات کامل محصول را وارد کنید..."
                    className={errors.descriptionFa ? errorInputCls : inputCls}
                  />
                  {/* دستیار AI */}
                  <button
                    type="button"
                    onClick={handleAiGenerate}
                    disabled={!nameFa || aiLoading}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold
                      bg-gradient-to-r from-violet-600/20 to-indigo-600/20
                      border border-violet-500/25 hover:border-violet-500/50
                      text-violet-300 hover:text-violet-200
                      disabled:opacity-40 disabled:cursor-not-allowed
                      transition-all duration-200"
                  >
                    {aiLoading ? (
                      <>
                        <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                          <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" strokeLinecap="round" className="opacity-75" />
                        </svg>
                        در حال تولید محتوا...
                      </>
                    ) : (
                      <>
                        <span className="text-sm">✨</span>
                        تولید محتوا با هوش مصنوعی
                      </>
                    )}
                  </button>
                </div>
              </Field>
            </div>

            {/* محصول ویژه */}
            <div className="sm:col-span-2 flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <Controller
                control={control}
                name="isFeatured"
                render={({ field }) => (
                  <button type="button" onClick={() => field.onChange(!field.value)}
                    className={`w-10 h-6 rounded-full transition-colors relative flex-shrink-0 ${field.value ? 'bg-amber-500' : 'bg-white/[0.12]'}`}>
                    <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${field.value ? 'translate-x-1' : 'translate-x-5'}`} />
                  </button>
                )}
              />
              <div>
                <p className="text-white/80 text-sm font-medium">محصول ویژه</p>
                <p className="text-white/30 text-xs">در صفحه اصلی و بنرهای ویژه نمایش داده می‌شود</p>
              </div>
            </div>
          </div>
        </FormCard>

        {/* ─── قیمت و موجودی ─────────────────────────────────────────────── */}
        <FormCard title="قیمت و موجودی" subtitle="اگر Variant دارید این مقادیر به عنوان پیش‌فرض استفاده می‌شوند" icon={<IconPrice />}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="قیمت اصلی (ریال)" required error={errors.price?.message}>
              <input {...register('price')} type="number" placeholder="0" className={errors.price ? errorInputCls : inputCls} dir="ltr" />
            </Field>
            <Field label="قیمت قبل از تخفیف (ریال)" hint="برای نمایش درصد تخفیف" error={errors.comparePrice?.message}>
              <input {...register('comparePrice')} type="number" placeholder="اختیاری" className={errors.comparePrice ? errorInputCls : inputCls} dir="ltr" />
            </Field>
            <Field label="موجودی انبار" error={errors.stock?.message}>
              <input {...register('stock')} type="number" placeholder="0" className={errors.stock ? errorInputCls : inputCls} dir="ltr" />
            </Field>
            <Field label="مدت گارانتی (ماه)" hint="۰ یعنی بدون گارانتی" error={errors.warrantyDays?.message}>
              <Controller
                control={control}
                name="warrantyDays"
                render={({ field }) => (
                  <input
                    type="number"
                    placeholder="0"
                    dir="ltr"
                    className={errors.warrantyDays ? errorInputCls : inputCls}
                    value={field.value ? Math.round(field.value / 30) : 0}
                    onChange={(e) => field.onChange(Number(e.target.value) * 30)}
                  />
                )}
              />
            </Field>
          </div>
        </FormCard>

        {/* ─── مشخصات فنی ───────────────────────────────────────────────── */}
        <FormCard title="مشخصات فنی" subtitle="ویژگی‌های ثابت محصول مثل جنس، ابعاد، ولتاژ" icon={<IconSpecs />}>
          <div className="space-y-2">
            {specFields.length > 0 && (
              <div className="space-y-2 mb-3">
                {/* Header row */}
                <div className="grid grid-cols-[1fr_1fr_2rem] gap-2 px-1">
                  <span className="text-[10px] font-bold text-white/25 uppercase tracking-wider">نام ویژگی</span>
                  <span className="text-[10px] font-bold text-white/25 uppercase tracking-wider">مقدار</span>
                </div>
                {specFields.map((field, idx) => (
                  <div key={field.id} className="grid grid-cols-[1fr_1fr_2rem] gap-2 items-start">
                    <div>
                      <input
                        {...register(`specs.${idx}.keyFa`)}
                        placeholder="مثلاً: جنس بدنه"
                        className={errors.specs?.[idx]?.keyFa ? errorInputCls : inputCls}
                      />
                      {errors.specs?.[idx]?.keyFa && (
                        <p className="text-[10px] text-red-400 mt-1">{errors.specs[idx]?.keyFa?.message}</p>
                      )}
                    </div>
                    <div>
                      <input
                        {...register(`specs.${idx}.valueFa`)}
                        placeholder="مثلاً: فولاد ضد زنگ"
                        className={errors.specs?.[idx]?.valueFa ? errorInputCls : inputCls}
                      />
                      {errors.specs?.[idx]?.valueFa && (
                        <p className="text-[10px] text-red-400 mt-1">{errors.specs[idx]?.valueFa?.message}</p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeSpec(idx)}
                      className="mt-1 w-8 h-8 rounded-lg bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center text-red-400 hover:text-red-300 transition-colors"
                    >
                      <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
                        <path fillRule="evenodd" d="M5 3.25V4H2.75a.75.75 0 000 1.5h.3l.815 8.15A1.5 1.5 0 005.357 15h5.285a1.5 1.5 0 001.493-1.35l.815-8.15h.3a.75.75 0 000-1.5H11v-.75A2.25 2.25 0 008.75 1h-1.5A2.25 2.25 0 005 3.25zm2.25-.75a.75.75 0 00-.75.75V4h3v-.75a.75.75 0 00-.75-.75h-1.5zM6.05 6a.75.75 0 01.787.713l.275 5.5a.75.75 0 01-1.498.075l-.275-5.5A.75.75 0 016.05 6zm3.9 0a.75.75 0 01.712.787l-.275 5.5a.75.75 0 01-1.498-.075l.275-5.5a.75.75 0 01.786-.711z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={() => appendSpec({ keyFa: '', valueFa: '' })}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.07] border border-dashed border-white/[0.10] hover:border-white/[0.20] text-white/50 hover:text-white/70 text-xs font-medium transition-all w-full justify-center"
            >
              <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
                <path d="M8.75 3.75a.75.75 0 00-1.5 0v3.5h-3.5a.75.75 0 000 1.5h3.5v3.5a.75.75 0 001.5 0v-3.5h3.5a.75.75 0 000-1.5h-3.5v-3.5z" />
              </svg>
              افزودن ویژگی
            </button>

            {specFields.length === 0 && (
              <p className="text-center text-white/20 text-xs py-2">هنوز ویژگی فنی اضافه نشده</p>
            )}
          </div>
        </FormCard>

        {/* ─── Variant Builder ───────────────────────────────────────────── */}
        <FormCard title="مدیریت Variant" subtitle="ترکیب رنگ، سایز و سایر ویژگی‌ها" icon={<IconVariant />}>
          <div
            className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all mb-4 ${
              hasVariants ? 'bg-indigo-500/10 border-indigo-500/30' : 'bg-white/[0.03] border-white/[0.06] hover:border-white/[0.12]'
            }`}
            onClick={() => setValue('hasVariants', !hasVariants)}
          >
            <div>
              <p className={`text-sm font-semibold ${hasVariants ? 'text-indigo-300' : 'text-white/70'}`}>این محصول Variant دارد</p>
              <p className="text-xs text-white/30 mt-0.5">مثلاً رنگ‌های مختلف، سایزهای متفاوت</p>
            </div>
            <div className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${hasVariants ? 'bg-indigo-500' : 'bg-white/[0.12]'}`}>
              <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${hasVariants ? 'translate-x-1' : 'translate-x-6'}`} />
            </div>
          </div>
          {errors.variants && (
            <p className="text-xs text-red-400 mb-3 flex items-center gap-1.5">
              <svg viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3 flex-shrink-0">
                <path fillRule="evenodd" d="M6.457 1.047c.659-1.234 2.427-1.234 3.086 0l6.082 11.378A1.75 1.75 0 0114.082 15H1.918a1.75 1.75 0 01-1.543-2.575l6.082-11.378zM9 11a1 1 0 11-2 0 1 1 0 012 0zm-.25-5.25a.75.75 0 00-1.5 0v2.5a.75.75 0 001.5 0v-2.5z" clipRule="evenodd" />
              </svg>
              {errors.variants.message ?? (errors.variants.root?.message)}
            </p>
          )}
          <VariantBuilder />
        </FormCard>

        {/* ─── تصاویر محصول ─────────────────────────────────────────────── */}
        <FormCard title="تصاویر محصول" subtitle="JPG، PNG، WebP — حداکثر ۲ مگابایت هر فایل" icon={<IconImage />}>
          <div className="space-y-6">
            <div>
              <p className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3">تصویر اصلی (ویترین)</p>
              <Controller
                control={control}
                name="mainImage"
                render={({ field }) => (
                  <MainImageUploader value={field.value ?? ''} onChange={field.onChange} />
                )}
              />
              {errors.mainImage && <p className="text-xs text-red-400 mt-1">{errors.mainImage.message}</p>}
            </div>
            <div>
              <p className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3">گالری تصاویر (تا ۷ تصویر)</p>
              <Controller
                control={control}
                name="gallery"
                render={({ field }) => (
                  <GalleryUploader value={field.value ?? []} onChange={field.onChange} />
                )}
              />
            </div>
          </div>
        </FormCard>

        {/* ─── SEO ───────────────────────────────────────────────────────── */}
        <FormCard title="سئو و نتایج جستجو" subtitle="اطلاعات نمایشی در Google و سایر موتورهای جستجو" icon={<IconSeo />}>
          <div className="space-y-4">
            {/* پیش‌نمایش Google */}
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-1">
              <p className="text-[10px] text-white/25 uppercase font-bold mb-2">پیش‌نمایش نتیجه جستجو</p>
              <p className="text-blue-400 text-sm font-medium leading-snug line-clamp-1">
                {watch('metaTitle') || watch('nameFa') || 'عنوان محصول'}
              </p>
              <p className="text-green-600/70 text-[10px]" dir="ltr">
                beewaz.ir/shop/{watch('slug') || 'product-slug'}
              </p>
              <p className="text-white/30 text-xs leading-5 line-clamp-2">
                {watch('metaDesc') || watch('descriptionFa') || 'توضیحات محصول در اینجا نمایش داده می‌شود...'}
              </p>
            </div>

            <Field label="عنوان متا" hint="حداکثر ۷۰ کاراکتر" error={errors.metaTitle?.message}>
              <div className="relative">
                <input {...register('metaTitle')} placeholder="عنوان در نتایج جستجو" className={errors.metaTitle ? errorInputCls : inputCls} />
                <CharCount value={watch('metaTitle') ?? ''} max={70} />
              </div>
            </Field>
            <Field label="توضیح متا" hint="حداکثر ۱۶۰ کاراکتر" error={errors.metaDesc?.message}>
              <div className="relative">
                <textarea {...register('metaDesc')} rows={3} placeholder="توضیح کوتاه در نتایج جستجو" className={errors.metaDesc ? errorInputCls : inputCls} />
                <CharCount value={watch('metaDesc') ?? ''} max={160} />
              </div>
            </Field>
          </div>
        </FormCard>

        {/* ─── Server Error ───────────────────────────────────────────────── */}
        {serverError && (
          <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-300 text-sm">
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 flex-shrink-0">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {serverError}
          </div>
        )}

        {/* ─── Submit buttons ─────────────────────────────────────────────── */}
        <div className="flex items-center gap-3 pb-8">
          <button
            type="submit"
            disabled={isPending}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold transition-all disabled:opacity-60 flex items-center gap-2"
          >
            {isPending && (
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" strokeLinecap="round" className="opacity-75" />
              </svg>
            )}
            {isPending ? 'در حال ذخیره...' : 'ایجاد محصول'}
          </button>

          <button
            type="button"
            onClick={() => { methods.setValue('status', 'draft'); handleSubmit(onSubmit, onInvalid)() }}
            disabled={isPending}
            className="px-6 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.10] text-white/70 text-sm font-semibold border border-white/[0.08] transition-all disabled:opacity-60"
          >
            ذخیره پیش‌نویس
          </button>

          <Link href="/admin/products" className="px-4 py-2.5 text-white/40 text-sm hover:text-white/70 transition-colors">
            انصراف
          </Link>
        </div>

      </form>
    </FormProvider>
  )
}

// ─── Character counter ────────────────────────────────────────────────────────

function CharCount({ value, max }: { value: string; max: number }) {
  const len = value.length
  const pct = len / max
  return (
    <span className={`absolute bottom-2 left-3 text-[10px] font-mono ${
      pct > 0.9 ? 'text-red-400' : pct > 0.7 ? 'text-amber-400' : 'text-white/25'
    }`}>
      {len}/{max}
    </span>
  )
}
