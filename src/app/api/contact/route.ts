/**
 * POST /api/contact
 * دریافت پیام از فرم تماس و ذخیره به‌عنوان Lead در CRM
 */

import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { leads } from '@/lib/db/schema'

interface ContactBody {
  fullName: string
  phone: string
  subject?: string
  message?: string
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as ContactBody

    if (!body.fullName?.trim() || !body.phone?.trim()) {
      return NextResponse.json({ error: 'نام و شماره موبایل الزامی است' }, { status: 400 })
    }

    // اعتبارسنجی شماره تلفن ایرانی
    const cleanPhone = body.phone.replace(/\D/g, '')
    if (!/^(0?9\d{9}|989\d{9})$/.test(cleanPhone)) {
      return NextResponse.json({ error: 'شماره موبایل معتبر نیست' }, { status: 400 })
    }

    // ذخیره به‌عنوان Lead
    await db.insert(leads).values({
      fullName:    body.fullName.trim(),
      phone:       cleanPhone.startsWith('0') ? cleanPhone : `0${cleanPhone}`,
      inquiryType: body.subject ?? 'consultation',
      notes:       body.message?.trim() ?? '',
      source:      'contact_form',
      status:      'new',
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[contact POST]', err)
    return NextResponse.json({ error: 'خطا در ارسال پیام. لطفاً مجدداً تلاش کنید.' }, { status: 500 })
  }
}
