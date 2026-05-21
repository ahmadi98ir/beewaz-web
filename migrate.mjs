import { drizzle } from 'drizzle-orm/postgres-js'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import postgres from 'postgres'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const DATABASE_URL = process.env.DATABASE_URL

if (!DATABASE_URL) {
  console.log('[migrate] DATABASE_URL not set — skipping migrations')
  process.exit(0)
}

const __dirname = dirname(fileURLToPath(import.meta.url))
const migrationsFolder = join(__dirname, 'migrations')

console.log('[migrate] Running database migrations...')
const sql = postgres(DATABASE_URL, { max: 1, idle_timeout: 10 })
const db  = drizzle(sql)

try {
  await migrate(db, { migrationsFolder })
  console.log('[migrate] Migrations complete ✓')
} catch (err) {
  console.error('[migrate] Migration error:', err.message)
  // Non-fatal: app may still work if tables already exist
} finally {
  await sql.end()
}
