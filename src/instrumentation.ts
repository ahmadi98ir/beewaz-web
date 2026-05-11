export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return
  if (!process.env.DATABASE_URL) return

  const { migrate } = await import('drizzle-orm/postgres-js/migrator')
  const postgres = (await import('postgres')).default
  const { drizzle } = await import('drizzle-orm/postgres-js')

  const connection = postgres(process.env.DATABASE_URL, { max: 1 })
  const db = drizzle(connection)

  await migrate(db, { migrationsFolder: './migrations' })
  await connection.end()
}
