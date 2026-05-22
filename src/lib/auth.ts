import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { and, eq, gte, isNull } from 'drizzle-orm'
import { z } from 'zod'
import { db } from './db'
import { users, phoneOtps } from './db/schema'
import { authConfig } from './auth.config'

const loginSchema = z.object({
  phone: z.string().regex(/^09\d{9}$/, 'شماره موبایل معتبر نیست'),
  otp: z.string().length(6, 'کد باید ۶ رقم باشد'),
})

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        phone: { label: 'موبایل', type: 'tel' },
        otp: { label: 'کد تأیید', type: 'text' },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials)
        if (!parsed.success) return null

        const { phone, otp } = parsed.data

        try {
          // تأیید OTP از دیتابیس
          const now = new Date()
          const record = await db.query.phoneOtps.findFirst({
            where: and(
              eq(phoneOtps.phone, phone),
              eq(phoneOtps.code, otp),
              gte(phoneOtps.expiresAt, now),
              isNull(phoneOtps.usedAt),
            ),
            orderBy: (t, { desc }) => [desc(t.createdAt)],
          })
          if (!record) return null

          // کد را مصرف‌شده علامت بزن
          await db
            .update(phoneOtps)
            .set({ usedAt: now })
            .where(eq(phoneOtps.id, record.id))

          // ادمین از env
          const adminPhone = process.env.ADMIN_PHONE
          if (adminPhone && phone === adminPhone) {
            return {
              id: 'admin-env',
              name: process.env.ADMIN_NAME ?? 'ادمین',
              email: null,
              phone,
              role: 'admin',
            }
          }

          // کاربر معمولی — اگر نبود auto-register
          let user = await db.query.users.findFirst({
            where: eq(users.phone, phone),
          })
          if (!user) {
            const [created] = await db
              .insert(users)
              .values({ phone, isVerified: true })
              .returning()
            if (!created) return null
            user = created
          } else if (!user.isVerified) {
            await db
              .update(users)
              .set({ isVerified: true })
              .where(eq(users.id, user.id))
          }

          return {
            id: user.id,
            name: user.fullName ?? null,
            email: user.email ?? null,
            phone: user.phone,
            role: user.role,
          }
        } catch (err) {
          console.error('[auth] OTP verify failed:', err)
          return null
        }
      },
    }),
  ],
})
