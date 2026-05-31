import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id || session.user.id === 'admin-env') {
    return NextResponse.json({ address: null })
  }

  try {
    const user = await db
      .select({ lastShippingAddress: users.lastShippingAddress })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1)
      .then((r) => r[0] ?? null)

    return NextResponse.json({ address: user?.lastShippingAddress ?? null })
  } catch {
    return NextResponse.json({ address: null })
  }
}
