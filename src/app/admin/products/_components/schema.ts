import { z } from 'zod'

export const variantRowSchema = z.object({
  key:               z.string(),
  label:             z.string(),
  attributeValueIds: z.array(z.string()),
  sku:               z.string().max(60).optional().or(z.literal('')),
  price:             z.coerce.number().int().min(0, 'قیمت نمی‌تواند منفی باشد'),
  comparePrice:      z.coerce.number().int().min(0).optional().or(z.literal('')),
  stock:             z.coerce.number().int().min(0, 'موجودی نمی‌تواند منفی باشد'),
  isActive:          z.boolean().default(true),
})

export type VariantRow = z.infer<typeof variantRowSchema>

export const specRowSchema = z.object({
  keyFa:   z.string().min(1, 'نام ویژگی الزامی است').max(100),
  valueFa: z.string().min(1, 'مقدار ویژگی الزامی است').max(255),
})
export type SpecRow = z.infer<typeof specRowSchema>

export const productFormSchema = z.object({
  // ─── اطلاعات پایه ──────────────────────────────────────────────────────────
  nameFa:        z.string().min(2, 'نام محصول الزامی است (حداقل ۲ کاراکتر)').max(200),
  slug:          z.string()
    .min(2, 'اسلاگ الزامی است')
    .max(160)
    .regex(/^[a-z0-9-]+$/, 'اسلاگ فقط می‌تواند شامل حروف انگلیسی کوچک، اعداد و خط‌تیره باشد'),
  sku:           z.string().min(1, 'کد محصول (SKU) الزامی است').max(50),
  categoryId:    z.string().uuid().nullable().optional(),
  descriptionFa: z.string().max(5000).optional().or(z.literal('')),
  weight:        z.coerce.number().int().min(0).optional(),
  status:        z.enum(['draft', 'active', 'archived', 'out_of_stock']).default('draft'),
  isFeatured:    z.boolean().default(false),

  // ─── قیمت و موجودی ─────────────────────────────────────────────────────────
  price:         z.coerce.number().int().min(1, 'قیمت محصول الزامی است'),
  comparePrice:  z.coerce.number().int().min(0).optional(),
  stock:         z.coerce.number().int().min(0).default(0),

  // ─── Variants ──────────────────────────────────────────────────────────────
  hasVariants:   z.boolean().default(false),
  variants:      z.array(variantRowSchema).optional(),

  // ─── تصاویر ────────────────────────────────────────────────────────────────
  mainImage:     z.string().min(1).optional().or(z.literal('')),
  gallery:       z.array(z.string().min(1)).default([]),

  // ─── مشخصات فنی ────────────────────────────────────────────────────────────
  specs:         z.array(specRowSchema).default([]),

  // ─── گارانتی ───────────────────────────────────────────────────────────────
  warrantyDays:  z.coerce.number().int().min(0).default(0),

  // ─── SEO ───────────────────────────────────────────────────────────────────
  metaTitle:     z.string().max(70).optional().or(z.literal('')),
  metaDesc:      z.string().max(160).optional().or(z.literal('')),
}).refine(
  (d) => !d.hasVariants || (d.variants && d.variants.length > 0),
  { message: 'حداقل یک variant تعریف کنید', path: ['variants'] }
)

export type ProductFormValues = z.infer<typeof productFormSchema>
