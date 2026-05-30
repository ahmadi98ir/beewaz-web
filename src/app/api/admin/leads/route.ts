/**
 * GET  /api/admin/leads   — لیست لیدها با فیلتر، جستجو، و صفحه‌بندی
 * POST /api/admin/leads   — ایجاد لید دستی (تیم فروش)
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { leads, users } from '@/lib/db/schema'
import { requireAdmin } from '@/lib/admin-auth'
import { eq, desc, ilike, or, sql, and, inArray } from 'drizzle-orm'
import type { LeadStatus } from '@/lib/db/schema'

// ── GET ───────────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req)
  if (!auth.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const status  = searchParams.get('status')   // new|contacted|converted|lost|all
  const search  = searchParams.get('q')?.trim()
  const page    = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
  const limit   = Math.min(100, parseInt(searchParams.get('limit') ?? '50', 10))
  const offset  = (page - 1) * limit

  try {
    // ── فیلترها ────────────────────────────────────────────────────
    const validStatuses: LeadStatus[] = ['new', 'contacted', 'converted', 'lost']
    const statusFilter = status && status !== 'all' && validStatuses.includes(status as LeadStatus)
      ? eq(leads.status, status as LeadStatus)
      : undefined

    const searchFilter = search
      ? or(
          ilike(leads.phone, `%${search}%`),
          ilike(leads.fullName, `%${search}%`),
          ilike(leads.city, `%${search}%`),
        )
      : undefined

    const where = statusFilter && searchFilter
      ? and(statusFilter, searchFilter)
      : statusFilter ?? searchFilter

    // ── کوئری اصلی ─────────────────────────────────────────────────
    const [rows, countResult] = await Promise.all([
      db
        .select({
          id:          leads.id,
          fullName:    leads.fullName,
          phone:       leads.phone,
          city:        leads.city,
          inquiryType: leads.inquiryType,
          status:      leads.status,
          aiSummary:   leads.aiSummary,
          assignedTo:  leads.assignedTo,
          contactedAt: leads.contactedAt,
          createdAt:   leads.createdAt,
          updatedAt:   leads.updatedAt,
        })
        .from(leads)
        .where(where)
        .orderBy(desc(leads.createdAt))
        .limit(limit)
        .offset(offset),

      db
        .select({ total: sql<number>`count(*)::int` })
        .from(leads)
        .where(where),
    ])

    // ── آمار وضعیت برای تب‌های UI ───────────────────────────────────
    const statusCounts = await db
      .select({
        status: leads.status,
        count:  sql<number>`count(*)::int`,
      })
      .from(leads)
      .groupBy(leads.status)

    const counts: Record<string, number> = {
      all:           0,
      new:           0,
      contacted:     0,
      qualified:     0,
      proposal_sent: 0,
      won:           0,
      converted:     0,
      lost:          0,
    }
    for (const row of statusCounts) {
      counts[row.status] = row.count
    }
    counts['all'] = statusCounts.reduce((s, r) => s + r.count, 0)

    return NextResponse.json({
      leads: rows,
      total: countResult[0]?.total ?? 0,
      page,
      limit,
      counts,
    })
  } catch (err) {
    console.error('[leads GET]', err)
    return NextResponse.json({ error: 'خطا در دریافت لیدها' }, { status: 500 })
  }
}

// ── POST — ایجاد لید دستی ────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req)
  if (!auth.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json() as {
      fullName?: string
      phone: string
      city?: string
      inquiryType?: string
      aiSummary?: string
    }

    if (!body.phone) {
      return NextResponse.json({ error: 'شماره تلفن الزامی است' }, { status: 400 })
    }

    const [newLead] = await db
      .insert(leads)
      .values({
        phone:       body.phone.trim(),
        fullName:    body.fullName?.trim() || null,
        city:        body.city?.trim() || null,
        inquiryType: body.inquiryType?.trim() || null,
        aiSummary:   body.aiSummary?.trim() || null,
        status:      'new',
      })
      .returning()

    return NextResponse.json({ lead: newLead }, { status: 201 })
  } catch (err) {
    console.error('[leads POST]', err)
    return NextResponse.json({ error: 'خطا در ایجاد لید' }, { status: 500 })
  }
}
