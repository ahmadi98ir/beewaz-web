import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'
import { requireAdmin } from '@/lib/admin-auth'

// GET — لیست کاربران
export async function GET() {
  const auth = await requireAdmin()
  if (!auth.ok) return NextResponse.json({ error: auth.error ?? 'Unauthorized' }, { status: 401 })

  try {
    const rows = await db.query.users.findMany({
      columns: { id: true, fullName: true, phone: true, email: true, role: true, isVerified: true, createdAt: true },
      orderBy: (users, { desc }) => [desc(users.createdAt)],
    })
    return NextResponse.json({ users: rows })
  } catch (err) {
    console.error('[API /admin/users GET]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST — ایجاد کاربر جدید
export async function POST(req: NextRequest) {
  const a = await requireAdmin()
  if (!a.ok) return NextResponse.json({ error: a.error ?? 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json() as { fullName: string; phone: string; email?: string; role?: string; password?: string }
    const { fullName, phone, email, role = 'customer', password } = body

    if (!phone) return NextResponse.json({ error: 'شماره موبایل الزامی است' }, { status: 400 })

    const existing = await db.query.users.findFirst({ where: eq(users.phone, phone) })
    if (existing) return NextResponse.json({ error: 'این شماره موبایل قبلاً ثبت شده است' }, { status: 409 })

    const passwordHash = password ? await bcrypt.hash(password, 10) : null

    const [user] = await db.insert(users).values({
      fullName: fullName || null,
      phone,
      email: email || null,
      role,
      passwordHash,
      isVerified: true,
    }).returning({ id: users.id, fullName: users.fullName, phone: users.phone, role: users.role })

    return NextResponse.json({ user }, { status: 201 })
  } catch (err) {
    console.error('[API /admin/users POST]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT — ویرایش کاربر
export async function PUT(req: NextRequest) {
  const a = await requireAdmin()
  if (!a.ok) return NextResponse.json({ error: a.error ?? 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json() as { id: string; fullName?: string; phone?: string; email?: string; role?: string; password?: string }
    const { id, fullName, phone, email, role, password } = body

    if (!id) return NextResponse.json({ error: 'id الزامی است' }, { status: 400 })

    const updates: Record<string, unknown> = { updatedAt: new Date() }
    if (fullName !== undefined) updates.fullName = fullName
    if (phone !== undefined) updates.phone = phone
    if (email !== undefined) updates.email = email || null
    if (role !== undefined) updates.role = role
    if (password) updates.passwordHash = await bcrypt.hash(password, 10)

    const [updated] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning({ id: users.id, fullName: users.fullName, phone: users.phone, role: users.role })

    if (!updated) return NextResponse.json({ error: 'کاربر یافت نشد' }, { status: 404 })

    return NextResponse.json({ user: updated })
  } catch (err) {
    console.error('[API /admin/users PUT]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE — حذف کاربر
export async function DELETE(req: NextRequest) {
  const a = await requireAdmin()
  if (!a.ok) return NextResponse.json({ error: a.error ?? 'Unauthorized' }, { status: 401 })

  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id الزامی است' }, { status: 400 })

    await db.delete(users).where(eq(users.id, id))
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[API /admin/users DELETE]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
