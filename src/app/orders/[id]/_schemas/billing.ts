import { z } from 'zod'

function toEn(v: string) {
  return v.replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
}

const digits = (len: number, msg: string) =>
  z.string().transform(toEn).pipe(z.string().regex(new RegExp(`^\\d{${len}}$`), msg))

const individualSchema = z.object({
  customerType: z.literal('individual'),
  fullName:     z.string().min(3, 'نام کامل الزامی است'),
  nationalId:   digits(10, 'کد ملی باید دقیقاً ۱۰ رقم باشد'),
  postalCode:   digits(10, 'کد پستی باید دقیقاً ۱۰ رقم باشد'),
  address:      z.string().min(10, 'آدرس باید حداقل ۱۰ کاراکتر باشد'),
})

const legalSchema = z.object({
  customerType:        z.literal('legal'),
  companyName:         z.string().min(3, 'نام شرکت الزامی است'),
  companyNationalId:   digits(11, 'شناسه ملی باید دقیقاً ۱۱ رقم باشد'),
  economicCode:        z.string().min(1, 'کد اقتصادی الزامی است'),
  registrationNumber:  z.string().min(1, 'شماره ثبت الزامی است'),
  companyPhone:        z.string().transform(toEn).pipe(
    z.string().regex(/^0[0-9]{10}$/, 'شماره تلفن ثابت نامعتبر است (۱۱ رقم با پیش‌شماره ۰)')
  ),
  postalCode:   digits(10, 'کد پستی باید دقیقاً ۱۰ رقم باشد'),
  address:      z.string().min(10, 'آدرس باید حداقل ۱۰ کاراکتر باشد'),
})

export const billingSchema = z.discriminatedUnion('customerType', [
  individualSchema,
  legalSchema,
])

export type BillingFormData = z.infer<typeof billingSchema>
export type IndividualData  = z.infer<typeof individualSchema>
export type LegalData       = z.infer<typeof legalSchema>
