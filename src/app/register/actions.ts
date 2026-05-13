'use server'

import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { hashSync } from 'bcryptjs'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'

const schema = z.object({
  fullName: z.string().trim().min(2, 'نام باید حداقل ۲ کاراکتر باشد').max(100),
  phone: z.string().regex(/^09\d{9}$/, 'شماره موبایل معتبر نیست (مثال: 09123456789)'),
  password: z.string().min(6, 'رمز عبور باید حداقل ۶ کاراکتر باشد').max(72),
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
    return { error: parsed.error.errors[0]?.message ?? 'اطلاعات وارد شده معتبر نیست' }
  }

  try {
    const existing = await db.query.users.findFirst({
      where: eq(users.phone, parsed.data.phone),
      columns: { id: true },
    })
    if (existing) {
      return { error: 'این شماره موبایل قبلاً ثبت شده است' }
    }

    await db.insert(users).values({
      fullName: parsed.data.fullName,
      phone: parsed.data.phone,
      passwordHash: hashSync(parsed.data.password, 10),
      role: 'customer',
    })

    return { success: true }
  } catch (err) {
    console.error('[register] failed:', err)
    return { error: 'خطایی رخ داد. لطفاً دوباره تلاش کنید.' }
  }
}
