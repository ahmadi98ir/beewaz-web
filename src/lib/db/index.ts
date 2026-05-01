import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

if (!process.env.DATABASE_URL) {
  throw new Error('متغیر محیطی DATABASE_URL تنظیم نشده است.')
}

declare global {
  // eslint-disable-next-line no-var
  var __pgConnection: postgres.Sql | undefined
}

// جلوگیری از ساخت connection pool اضافی در hot-reload محیط development
const connection =
  globalThis.__pgConnection ??
  postgres(process.env.DATABASE_URL, {
    max: 10,
    idle_timeout: 30,
    connect_timeout: 10,
    prepare: false, // لازم برای PgBouncer در حالت transaction mode
  })

if (process.env.NODE_ENV !== 'production') {
  globalThis.__pgConnection = connection
}

export const db = drizzle(connection, {
  schema,
  logger: process.env.NODE_ENV === 'development',
})

export type Database = typeof db
