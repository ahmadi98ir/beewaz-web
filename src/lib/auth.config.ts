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
        // @ts-expect-error — custom fields injected در authorize()
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
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl
      if (pathname.startsWith('/admin')) {
        if (!auth) return false
        // @ts-expect-error — custom role
        return auth.user?.role === 'admin'
      }
      if (pathname.startsWith('/profile')) {
        return !!auth
      }
      return true
    },
  },
  providers: [], // providers در auth.ts اضافه می‌شوند (Node-only)
} satisfies NextAuthConfig
