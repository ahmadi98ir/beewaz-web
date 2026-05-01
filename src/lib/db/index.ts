import { drizzle } from 'drizzle-orm/postgres-js'
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

type AppDb = PostgresJsDatabase<typeof schema>

declare global {
  // eslint-disable-next-line no-var
  var __pgConnection: postgres.Sql | undefined
}

const DATABASE_URL = process.env.DATABASE_URL

// اگر DATABASE_URL وجود نداشت، یک پروکسی برمی‌گردانیم که در runtime خطا می‌دهد
// این باعث می‌شود build بدون دیتابیس هم کار کند (mock data کافیه)
function createDb(): AppDb {
  if (!DATABASE_URL) {
    return new Proxy({} as AppDb, {
      get() {
        throw new Error('DATABASE_URL تنظیم نشده است. لطفاً متغیر محیطی را در Vercel تنظیم کنید.')
      },
    })
  }

  const connection =
    globalThis.__pgConnection ??
    postgres(DATABASE_URL, {
      max: 10,
      idle_timeout: 30,
      connect_timeout: 10,
      prepare: false,
    })

  if (process.env.NODE_ENV !== 'production') {
    globalThis.__pgConnection = connection
  }

  return drizzle(connection, {
    schema,
    logger: process.env.NODE_ENV === 'development',
  })
}

export const db = createDb()

export type Database = AppDb
