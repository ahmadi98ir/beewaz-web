/**
 * اجرای migration هنگام startup
 * با: npx tsx src/lib/db/migrate.ts
 */
import { drizzle } from 'drizzle-orm/postgres-js'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import postgres from 'postgres'
import path from 'path'

const DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL) {
  console.error('❌  DATABASE_URL is not set')
  process.exit(1)
}

const sql = postgres(DATABASE_URL, { max: 1 })
const db = drizzle(sql)

console.log('🔄  Running DB migrations...')
await migrate(db, { migrationsFolder: path.join(process.cwd(), 'src/lib/db/migrations') })
console.log('✅  Migrations complete')

await sql.end()
