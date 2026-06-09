'use client'

import { useEffect, useState } from 'react'
import { useForm, FormProvider, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { productFormSchema, type ProductFormValues } from './schema'
import { FormCard, Field, inputCls, errorInputCls } from './form-card'
import { VariantBuilder } from './variant-builder'

// ─── Icons ────────────────────────────────────────────────────────────────────

const IconInfo = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
  </svg>
)
const IconVariant = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" />
  </svg>
)
const IconPrice = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
    <path d="M10.75 10.818v2.614A3.13 3.13 0 0011.888 13c.482-.315.612-.648.612-.875 0-.227-.13-.56-.612-.875a3.13 3.13 0 00-1.138-.432zM8.33 8.62c.053.055.115.11.184.164.208.16.46.284.736.363V6.603a2.45 2.45 0 00-.35.13c-.14.065-.27.143-.386.233-.377.292-.514.627-.514.909 0 .184.058.39.33.576zm9.09-8.618a.75.75 0 01.75.75v4.638c0 .196-.08.385-.22.524l-9.108 9.098a3.5 3.5 0 01-4.949-4.950l9.108-9.098a.75.75 0 01.524-.22l4.638-.013h.057zm-3.32 2.03a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" />
  </svg>
)
const IconSeo = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
    <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
  </svg>
)

// ─── Status options ───────────────────────────────────────────────────────────

const STATUS_OPTIONS = [
  { value: 'draft',        label: 'پیش‌نویس',  color: 'text-white/50' },
  { value: 'active',       label: 'فعال',       color: 'text-emerald-400' },
  { value: 'archived',     label: 'آرشیو',      color: 'text-white/30' },
  { value: 'out_of_stock', label: 'ناموجود',    color: 'text-red-400' },
] as const

// ─── Slug generator ───────────────────────────────────────────────────────────

function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[؀-ۿ\s]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

// ─── Category selector ────────────────────────────────────────────────────────

interface Category { id: string; nameFa: string }

// ─── Main Form ────────────────────────────────────────────────────────────────

export function ProductFormV2() {
  const [categories, setCategories] = useState<Category[]>([])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const methods = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema) as any,
    defaultValues: {
      nameFa: '', slug: '', sku: '', categoryId: null,
      descriptionFa: '', weight: undefined,
      status: 'draft', isFeatured: false,
      price: 0, comparePrice: undefined, stock: 0,
      hasVariants: false, variants: [],
      metaTitle: '', metaDesc: '',
    },
  })

  const {
    register, handleSubmit, watch, setValue,
    formState: { errors, isSubmitting },
    control,
  } = methods

  const nameFa = watch('nameFa')
  const hasVariants = watch('hasVariants')

  // بارگذاری دسته‌بندی‌ها
  useEffect(() => {
    fetch('/api/admin/categories')
      .then((r) => r.json())
      .then((d: { categories?: Category[] }) => setCategories(d.categories ?? []))
      .catch(() => {})
  }, [])

  // تولید خودکار slug از نام فارسی
  useEffect(() => {
    if (nameFa) setValue('slug', slugify(nameFa), { shouldValidate: false })
  }, [nameFa, setValue])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function onSubmit(data: any) {
    const _d = data as ProductFormValues
    console.log('form data:', _d)
    alert('فرم آماده‌سازی شد — در فاز بعدی ذخیره می‌شود.')
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

        {/* ─── اطلاعات پایه ──────────────────────────────────────────────── */}
        <FormCard
          title="اطلاعات پایه"
          subtitle="نام، کد و دسته‌بندی محصول"
          icon={<IconInfo />}
        >
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

            <Field label="دسته‌بندی" error={errors.categoryId?.message}>
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
            </Field>

            <Field label="وزن (گرم)" error={errors.weight?.message}>
              <input
                {...register('weight')}
                type="number"
                placeholder="۰"
                className={errors.weight ? errorInputCls : inputCls}
                dir="ltr"
              />
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

            <div className="sm:col-span-2">
              <Field label="توضیحات" error={errors.descriptionFa?.message}>
                <textarea
                  {...register('descriptionFa')}
                  rows={4}
                  placeholder="توضیحات کامل محصول را وارد کنید..."
                  className={errors.descriptionFa ? errorInputCls : inputCls}
                />
              </Field>
            </div>

            {/* محصول ویژه */}
            <div className="sm:col-span-2 flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <Controller
                control={control}
                name="isFeatured"
                render={({ field }) => (
                  <button
                    type="button"
                    onClick={() => field.onChange(!field.value)}
                    className={`w-10 h-6 rounded-full transition-colors relative flex-shrink-0 ${field.value ? 'bg-amber-500' : 'bg-white/[0.12]'}`}
                  >
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
        <FormCard
          title="قیمت و موجودی"
          subtitle="اگر Variant دارید این مقادیر به عنوان پیش‌فرض استفاده می‌شوند"
          icon={<IconPrice />}
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="قیمت اصلی (ریال)" required error={errors.price?.message}>
              <input
                {...register('price')}
                type="number"
                placeholder="0"
                className={errors.price ? errorInputCls : inputCls}
                dir="ltr"
              />
            </Field>
            <Field label="قیمت قبل از تخفیف (ریال)" hint="برای نمایش درصد تخفیف" error={errors.comparePrice?.message}>
              <input
                {...register('comparePrice')}
                type="number"
                placeholder="اختیاری"
                className={errors.comparePrice ? errorInputCls : inputCls}
                dir="ltr"
              />
            </Field>
            <Field label="موجودی انبار" error={errors.stock?.message}>
              <input
                {...register('stock')}
                type="number"
                placeholder="0"
                className={errors.stock ? errorInputCls : inputCls}
                dir="ltr"
              />
            </Field>
          </div>
        </FormCard>

        {/* ─── Variant Builder ───────────────────────────────────────────── */}
        <FormCard
          title="مدیریت Variant"
          subtitle="ترکیب رنگ، سایز و سایر ویژگی‌ها"
          icon={<IconVariant />}
        >
          {/* toggle */}
          <div
            className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all mb-4 ${
              hasVariants
                ? 'bg-indigo-500/10 border-indigo-500/30'
                : 'bg-white/[0.03] border-white/[0.06] hover:border-white/[0.12]'
            }`}
            onClick={() => setValue('hasVariants', !hasVariants)}
          >
            <div>
              <p className={`text-sm font-semibold ${hasVariants ? 'text-indigo-300' : 'text-white/70'}`}>
                این محصول Variant دارد
              </p>
              <p className="text-xs text-white/30 mt-0.5">
                مثلاً رنگ‌های مختلف، سایزهای متفاوت
              </p>
            </div>
            <div className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${hasVariants ? 'bg-indigo-500' : 'bg-white/[0.12]'}`}>
              <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${hasVariants ? 'translate-x-1' : 'translate-x-6'}`} />
            </div>
          </div>

          <VariantBuilder />
        </FormCard>

        {/* ─── SEO ───────────────────────────────────────────────────────── */}
        <FormCard title="SEO" subtitle="عنوان و توضیحات برای موتورهای جستجو" icon={<IconSeo />}>
          <div className="space-y-4">
            <Field label="عنوان متا" hint="حداکثر ۷۰ کاراکتر" error={errors.metaTitle?.message}>
              <div className="relative">
                <input
                  {...register('metaTitle')}
                  placeholder="عنوان در نتایج جستجو"
                  className={errors.metaTitle ? errorInputCls : inputCls}
                />
                <CharCount value={watch('metaTitle') ?? ''} max={70} />
              </div>
            </Field>
            <Field label="توضیح متا" hint="حداکثر ۱۶۰ کاراکتر" error={errors.metaDesc?.message}>
              <div className="relative">
                <textarea
                  {...register('metaDesc')}
                  rows={3}
                  placeholder="توضیح کوتاه در نتایج جستجو"
                  className={errors.metaDesc ? errorInputCls : inputCls}
                />
                <CharCount value={watch('metaDesc') ?? ''} max={160} />
              </div>
            </Field>
          </div>
        </FormCard>

        {/* ─── دکمه‌های ارسال ────────────────────────────────────────────── */}
        <div className="flex items-center gap-3 pb-8">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting && (
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" strokeLinecap="round" className="opacity-75" />
              </svg>
            )}
            ایجاد محصول
          </button>

          <button
            type="button"
            onClick={() => {
              methods.setValue('status', 'draft')
              handleSubmit(onSubmit)()
            }}
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.10] text-white/70 text-sm font-semibold border border-white/[0.08] transition-all disabled:opacity-50"
          >
            ذخیره به عنوان پیش‌نویس
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
