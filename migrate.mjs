import { drizzle } from 'drizzle-orm/postgres-js'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import postgres from 'postgres'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { existsSync, readdirSync } from 'fs'

const DATABASE_URL = process.env.DATABASE_URL

if (!DATABASE_URL) {
  console.warn('[migrate] ⚠️  DATABASE_URL not set — skipping migrations')
  process.exit(0)
}

const __dirname = dirname(fileURLToPath(import.meta.url))
const migrationsFolder = join(__dirname, 'migrations')

// Verify migrations folder exists and has content
if (!existsSync(migrationsFolder)) {
  console.error(`[migrate] ❌ Migrations folder not found: ${migrationsFolder}`)
  console.error('[migrate] ❌ Check Dockerfile COPY for migrations directory')
  process.exit(1)
}

const sqlFiles = readdirSync(migrationsFolder).filter(f => f.endsWith('.sql'))
console.log(`[migrate] Found ${sqlFiles.length} migration files in ${migrationsFolder}`)
if (sqlFiles.length === 0) {
  console.warn('[migrate] ⚠️  No .sql files found — nothing to migrate')
  process.exit(0)
}

console.log('[migrate] Connecting to database...')
const sql = postgres(DATABASE_URL, { max: 1, idle_timeout: 20, connect_timeout: 30 })
const db  = drizzle(sql)

try {
  console.log('[migrate] Running migrations...')
  await migrate(db, { migrationsFolder })
  console.log('[migrate] ✅ All migrations applied successfully')
} catch (err) {
  console.error('[migrate] ❌ Migration FAILED:', err.message)
  if (err.cause) console.error('[migrate]    Cause:', err.cause)
  // Exit non-zero so entrypoint logs the warning, but app can still start
  // if tables already exist from a previous deploy
  process.exitCode = 1
} finally {
  await sql.end()
}
