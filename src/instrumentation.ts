/**
 * Next.js Instrumentation Hook
 * یک‌بار در server startup اجرا می‌شود — مناسب برای DB migration
 * مستندات: https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

export async function register() {
  // فقط در Node.js runtime (نه edge) اجرا شود
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { migrate } = await import('drizzle-orm/postgres-js/migrator')
    const { drizzle } = await import('drizzle-orm/postgres-js')
    const postgres = (await import('postgres')).default
    const path = await import('path')

    const DATABASE_URL = process.env.DATABASE_URL
    if (!DATABASE_URL) {
      console.warn('[migration] DATABASE_URL not set — skipping migrations')
      return
    }

    try {
      const sql = postgres(DATABASE_URL, { max: 1 })
      const db = drizzle(sql)
      await migrate(db, {
        migrationsFolder: path.join(process.cwd(), 'src/lib/db/migrations'),
      })
      console.log('[migration] ✅ DB migrations applied successfully')
      await sql.end()
    } catch (err) {
      // migration خطا داد — سایت باید همچنان بالا بیاید
      console.error('[migration] ❌ Migration failed:', err)
    }
  }
}
