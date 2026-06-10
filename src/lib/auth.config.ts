import type { NextAuthConfig } from 'next-auth'

// Edge-safe config — این فایل توسط proxy (middleware) لود می‌شود
// نباید هیچ ایمپورت Node-only (postgres, bcryptjs, drizzle) داشته باشد.
export const authConfig = {
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: { strategy: 'jwt' },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id as string
        token.phone = user.phone
        token.role = user.role
      }
      return token
    },
    session({ session, token }) {
      session.user.id = token.id as string
      session.user.phone = token.phone as string | undefined
      session.user.role = token.role as string | undefined
      return session
    },
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl
      if (pathname.startsWith('/admin')) {
        if (!auth) return false
        const role = auth.user?.role as string | undefined
        return !!role && role !== 'customer'
      }
      if (pathname.startsWith('/profile')) {
        return !!auth
      }
      return true
    },
  },
  providers: [], // providers در auth.ts اضافه می‌شوند (Node-only)
} satisfies NextAuthConfig
