import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { eq } from 'drizzle-orm'
import { db } from './db'
import { users } from './db/schema'
import { compareSync } from 'bcryptjs'
import { z } from 'zod'

const loginSchema = z.object({
  phone: z.string().regex(/^09\d{9}$/, 'شماره موبایل معتبر نیست'),
  password: z.string().min(6, 'رمز عبور حداقل ۶ کاراکتر باشد'),
})

export const { handlers, auth, signIn, signOut } = NextAuth({
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
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
        // @ts-expect-error — custom fields
        token.phone = user.phone
        // @ts-expect-error
        token.role = user.role
      }
      return token
    },
    session({ session, token }) {
      session.user.id = token.id as string
      // @ts-expect-error
      session.user.phone = token.phone
      // @ts-expect-error
      session.user.role = token.role
      return session
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: { strategy: 'jwt' },
})
