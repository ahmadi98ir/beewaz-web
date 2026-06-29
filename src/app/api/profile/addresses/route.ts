import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { userAddresses } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { toEnDigits } from '@/lib/utils'

const MAX_ADDRESSES = 15

type AddressInput = {
  title?: string; fullName?: string; province?: string; city?: string
  street?: string; alley?: string; plaque?: string; unit?: string
  postalCode?: string; isDefault?: boolean
}

function clean(body: AddressInput) {
  return {
    title:      body.title?.trim()    || null,
    fullName:   body.fullName?.trim() || null,
    province:   body.province?.trim() || null,
    city:       body.city?.trim()     || null,
    street:     body.street?.trim()   || null,
    alley:      body.alley?.trim()    || null,
    plaque:     body.plaque?.trim()   || null,
    unit:       body.unit?.trim()     || null,
    postalCode: body.postalCode ? toEnDigits(body.postalCode.trim()) : null,
  }
}

// GET — لیست آدرس‌های کاربر
export async function GET() {
  const session = await auth()
  if (!session?.user?.id || session.user.id === 'admin-env') {
    return NextResponse.json({ addresses: [] })
  }

  try {
    const rows = await db
      .select()
      .from(userAddresses)
      .where(eq(userAddresses.userId, session.user.id))
      .orderBy(desc(userAddresses.isDefault), desc(userAddresses.createdAt))
    return NextResponse.json({ addresses: rows })
  } catch (err) {
    console.error('[profile/addresses GET]', err)
    return NextResponse.json({ addresses: [] })
  }
}

// POST — افزودن آدرس جدید
export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id || session.user.id === 'admin-env') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const userId = session.user.id

  try {
    const body = await req.json() as AddressInput
    const fields = clean(body)

    if (!fields.province || !fields.city || !fields.street) {
      return NextResponse.json({ error: 'استان، شهر و خیابان اصلی الزامی است' }, { status: 400 })
    }

    const existing = await db
      .select({ id: userAddresses.id })
      .from(userAddresses)
      .where(eq(userAddresses.userId, userId))
    if (existing.length >= MAX_ADDRESSES) {
      return NextResponse.json({ error: `حداکثر ${MAX_ADDRESSES} آدرس می‌توانید ذخیره کنید` }, { status: 400 })
    }

    // اولین آدرس همیشه پیش‌فرض است؛ در غیر این صورت طبق درخواست
    const makeDefault = body.isDefault === true || existing.length === 0
    if (makeDefault) {
      await db.update(userAddresses)
        .set({ isDefault: false })
        .where(eq(userAddresses.userId, userId))
    }

    const [created] = await db.insert(userAddresses)
      .values({ userId, ...fields, isDefault: makeDefault })
      .returning()

    return NextResponse.json({ address: created })
  } catch (err) {
    console.error('[profile/addresses POST]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
