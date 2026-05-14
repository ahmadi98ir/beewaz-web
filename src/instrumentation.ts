/**
 * Next.js Instrumentation Hook — یک‌بار در server startup اجرا می‌شود
 * در standalone Docker: migrations در /app/migrations
 * در dev: migrations در src/lib/db/migrations
 */

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { migrate } = await import('drizzle-orm/postgres-js/migrator')
    const { drizzle } = await import('drizzle-orm/postgres-js')
    const postgres = (await import('postgres')).default
    const path = await import('path')
    const fs = await import('fs')

    const DATABASE_URL = process.env.DATABASE_URL
    if (!DATABASE_URL) {
      console.warn('[migration] DATABASE_URL not set — skipping')
      return
    }

    // standalone Docker: /app/migrations | dev: src/lib/db/migrations
    const candidates = [
      path.join(process.cwd(), 'migrations'),
      path.join(process.cwd(), 'src/lib/db/migrations'),
    ]
    const migrationsFolder = candidates.find((p) => fs.existsSync(p))
    if (!migrationsFolder) {
      console.warn('[migration] migrations folder not found — skipping')
      return
    }

    try {
      const sql = postgres(DATABASE_URL, { max: 1 })
      const db = drizzle(sql)
      await migrate(db, { migrationsFolder })
      console.log('[migration] ✅ DB migrations applied —', migrationsFolder)
      await sql.end()
    } catch (err) {
      console.error('[migration] ❌ Failed:', err)
    }
  }
}
