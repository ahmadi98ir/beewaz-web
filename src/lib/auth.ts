import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { eq } from 'drizzle-orm'
import { compareSync } from 'bcryptjs'
import { z } from 'zod'
import { db } from './db'
import { users } from './db/schema'
import { authConfig } from './auth.config'

const loginSchema = z.object({
  phone: z.string().regex(/^09\d{9}$/, 'شماره موبایل معتبر نیست'),
  password: z.string().min(6, 'رمز عبور حداقل ۶ کاراکتر باشد'),
})

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        phone: { label: 'موبایل', type: 'tel' },
        password: { label: 'رمز عبور', type: 'password' },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials)
        if (!parsed.success) return null

        // ادمین موقت از env — بدون نیاز به دیتابیس
        const adminPhone = process.env.ADMIN_PHONE
        const adminPass = process.env.ADMIN_PASSWORD
        if (
          adminPhone &&
          adminPass &&
          parsed.data.phone === adminPhone &&
          parsed.data.password === adminPass
        ) {
          return {
            id: 'admin-env',
            name: process.env.ADMIN_NAME ?? 'ادمین',
            email: null,
            phone: adminPhone,
            role: 'admin',
          }
        }

        // لاگین معمولی از دیتابیس
        try {
          const user = await db.query.users.findFirst({
            where: eq(users.phone, parsed.data.phone),
          })
          if (!user?.passwordHash) return null
          if (!compareSync(parsed.data.password, user.passwordHash)) return null
          return {
            id: user.id,
            name: user.fullName,
            email: user.email,
            phone: user.phone,
            role: user.role,
          }
        } catch (err) {
          console.error('[auth] DB lookup failed:', err)
          return null
        }
      },
    }),
  ],
})
