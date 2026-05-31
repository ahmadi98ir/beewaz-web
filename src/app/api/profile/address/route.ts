import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function PATCH(req: Request) {
  const session = await auth()
  if (!session?.user?.id || session.user.id === 'admin-env') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json() as {
      fullName?: string; province?: string; city?: string
      street?: string; alley?: string; plaque?: string; unit?: string; postalCode?: string
    }

    await db.update(users)
      .set({
        lastShippingAddress: {
          fullName:   body.fullName?.trim() || undefined,
          province:   body.province?.trim() || undefined,
          city:       body.city?.trim() || undefined,
          street:     body.street?.trim() || undefined,
          alley:      body.alley?.trim() || undefined,
          plaque:     body.plaque?.trim() || undefined,
          unit:       body.unit?.trim() || undefined,
          postalCode: body.postalCode?.trim() || undefined,
        },
        updatedAt: new Date(),
      })
      .where(eq(users.id, session.user.id))

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[profile/address PATCH]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
