import { NextResponse, type NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { userAddresses } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { toEnDigits } from '@/lib/utils'

type Params = { params: Promise<{ id: string }> }

type AddressInput = {
  title?: string; fullName?: string; province?: string; city?: string
  street?: string; alley?: string; plaque?: string; unit?: string
  postalCode?: string; isDefault?: boolean
}

// PATCH — ویرایش آدرس یا تنظیم به‌عنوان پیش‌فرض
export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session?.user?.id || session.user.id === 'admin-env') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const userId = session.user.id
  const { id } = await params

  try {
    const body = await req.json() as AddressInput

    // مالکیت آدرس را بررسی کن
    const [owned] = await db
      .select({ id: userAddresses.id })
      .from(userAddresses)
      .where(and(eq(userAddresses.id, id), eq(userAddresses.userId, userId)))
      .limit(1)
    if (!owned) return NextResponse.json({ error: 'یافت نشد' }, { status: 404 })

    if (body.isDefault === true) {
      await db.update(userAddresses)
        .set({ isDefault: false })
        .where(eq(userAddresses.userId, userId))
    }

    const set: Record<string, unknown> = { updatedAt: new Date() }
    if (body.title !== undefined)      set.title      = body.title?.trim() || null
    if (body.fullName !== undefined)   set.fullName   = body.fullName?.trim() || null
    if (body.province !== undefined)   set.province   = body.province?.trim() || null
    if (body.city !== undefined)       set.city       = body.city?.trim() || null
    if (body.street !== undefined)     set.street     = body.street?.trim() || null
    if (body.alley !== undefined)      set.alley      = body.alley?.trim() || null
    if (body.plaque !== undefined)     set.plaque     = body.plaque?.trim() || null
    if (body.unit !== undefined)       set.unit       = body.unit?.trim() || null
    if (body.postalCode !== undefined) set.postalCode = body.postalCode ? toEnDigits(body.postalCode.trim()) : null
    if (body.isDefault !== undefined)  set.isDefault  = body.isDefault === true

    const [updated] = await db.update(userAddresses)
      .set(set)
      .where(and(eq(userAddresses.id, id), eq(userAddresses.userId, userId)))
      .returning()

    return NextResponse.json({ address: updated })
  } catch (err) {
    console.error('[profile/addresses PATCH]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// DELETE — حذف آدرس
export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session?.user?.id || session.user.id === 'admin-env') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const userId = session.user.id
  const { id } = await params

  try {
    const [deleted] = await db.delete(userAddresses)
      .where(and(eq(userAddresses.id, id), eq(userAddresses.userId, userId)))
      .returning({ id: userAddresses.id, wasDefault: userAddresses.isDefault })

    if (!deleted) return NextResponse.json({ error: 'یافت نشد' }, { status: 404 })

    // اگر آدرس پیش‌فرض حذف شد، جدیدترین آدرس باقی‌مانده را پیش‌فرض کن
    if (deleted.wasDefault) {
      const [next] = await db
        .select({ id: userAddresses.id })
        .from(userAddresses)
        .where(eq(userAddresses.userId, userId))
        .orderBy(userAddresses.createdAt)
        .limit(1)
      if (next) {
        await db.update(userAddresses)
          .set({ isDefault: true })
          .where(eq(userAddresses.id, next.id))
      }
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[profile/addresses DELETE]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
