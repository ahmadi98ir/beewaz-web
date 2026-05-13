import { NextResponse } from 'next/server'
import { hashSync } from 'bcryptjs'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'

const schema = z.object({
  phone: z.string().regex(/^09\d{9}$/, 'شماره موبایل معتبر نیست'),
  password: z.string().min(6, 'رمز عبور حداقل ۶ کاراکتر باشد'),
  fullName: z.string().min(2, 'نام حداقل ۲ کاراکتر باشد').max(100),
})

export async function POST(req: Request) {
  try {
    const body = await req.json() as unknown
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? 'اطلاعات نامعتبر' },
        { status: 400 },
      )
    }

    const { phone, password, fullName } = parsed.data

    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.phone, phone))
      .limit(1)

    if (existing.length > 0) {
      return NextResponse.json({ error: 'این شماره موبایل قبلاً ثبت شده است' }, { status: 409 })
    }

    const passwordHash = hashSync(password, 10)
    await db.insert(users).values({
      phone,
      fullName,
      passwordHash,
      isVerified: true,
      role: 'customer',
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[register]', err)
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 })
  }
}
