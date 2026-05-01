'use server'

import { z } from 'zod'

const schema = z.object({
  fullName: z.string().min(2, 'نام باید حداقل ۲ کاراکتر باشد'),
  phone: z.string().regex(/^09\d{9}$/, 'شماره موبایل معتبر نیست (مثال: 09123456789)'),
  password: z.string().min(6, 'رمز عبور باید حداقل ۶ کاراکتر باشد'),
})

export type RegisterState = { error?: string; success?: boolean }

export async function registerAction(
  _prev: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  const parsed = schema.safeParse({
    fullName: formData.get('fullName'),
    phone: formData.get('phone'),
    password: formData.get('password'),
  })

  if (!parsed.success) {
    return { error: parsed.error.errors[0].message }
  }

  try {
    // اتصال به دیتابیس — فعال‌سازی بعد از راه‌اندازی PostgreSQL
    // const { db } = await import('@/lib/db')
    // const { users } = await import('@/lib/db/schema')
    // const { eq } = await import('drizzle-orm')
    // const { hashSync } = await import('bcryptjs')
    //
    // const existing = await db.query.users.findFirst({ where: eq(users.phone, parsed.data.phone) })
    // if (existing) return { error: 'این شماره موبایل قبلاً ثبت شده است' }
    //
    // await db.insert(users).values({
    //   fullName: parsed.data.fullName,
    //   phone: parsed.data.phone,
    //   passwordHash: hashSync(parsed.data.password, 10),
    //   role: 'customer',
    // })

    // Mock: تأخیر شبیه‌سازی درخواست واقعی
    await new Promise((r) => setTimeout(r, 800))

    return { success: true }
  } catch {
    return { error: 'خطایی رخ داد. لطفاً دوباره تلاش کنید.' }
  }
}
