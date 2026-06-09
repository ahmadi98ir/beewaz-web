import { z } from 'zod'

export const variantRowSchema = z.object({
  // کلیدی که از ترکیب attribute value idها ساخته می‌شود
  key:          z.string(),
  // نام نمایشی ترکیب، مثل "قرمز / XL"
  label:        z.string(),
  attributeValueIds: z.array(z.string()),
  sku:          z.string().max(60).optional().or(z.literal('')),
  price:        z.coerce.number().int().min(0, 'قیمت نمی‌تواند منفی باشد'),
  comparePrice: z.coerce.number().int().min(0).optional().or(z.literal('')),
  stock:        z.coerce.number().int().min(0, 'موجودی نمی‌تواند منفی باشد'),
  isActive:     z.boolean().default(true),
})

export type VariantRow = z.infer<typeof variantRowSchema>

export const productFormSchema = z.object({
  // ─── اطلاعات پایه ────────────────────────────────────────────────────────
  nameFa:      z.string().min(2, 'نام حداقل ۲ کاراکتر باشد').max(200),
  slug:        z.string()
    .min(2, 'اسلاگ الزامی است')
    .max(160)
    .regex(/^[a-z0-9-]+$/, 'اسلاگ فقط می‌تواند شامل حروف انگلیسی کوچک، اعداد و خط‌تیره باشد'),
  sku:         z.string().min(1, 'کد محصول الزامی است').max(50),
  categoryId:  z.string().uuid('دسته‌بندی را انتخاب کنید').nullable(),
  descriptionFa: z.string().max(5000).optional().or(z.literal('')),
  weight:      z.coerce.number().int().min(0).optional(),
  status:      z.enum(['draft', 'active', 'archived', 'out_of_stock']).default('draft' as const),
  isFeatured:  z.boolean().default(false),

  // ─── قیمت پایه (بدون variant) ────────────────────────────────────────────
  price:        z.coerce.number().int().min(0, 'قیمت الزامی است'),
  comparePrice: z.coerce.number().int().min(0).optional(),
  stock:        z.coerce.number().int().min(0).default(0),

  // ─── Variants ────────────────────────────────────────────────────────────
  hasVariants: z.boolean().default(false),
  variants:    z.array(variantRowSchema).optional(),

  // ─── تصاویر ──────────────────────────────────────────────────────────────
  images: z.array(z.object({
    url:       z.string().url(),
    isPrimary: z.boolean(),
  })).default([]),

  // ─── SEO ─────────────────────────────────────────────────────────────────
  metaTitle: z.string().max(70).optional().or(z.literal('')),
  metaDesc:  z.string().max(160).optional().or(z.literal('')),
}).refine(
  (d) => !d.hasVariants || (d.variants && d.variants.length > 0),
  { message: 'حداقل یک variant تعریف کنید', path: ['variants'] }
)

export type ProductFormValues = z.infer<typeof productFormSchema>
