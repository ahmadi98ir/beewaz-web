/**
 * GET   /api/admin/leads/[id]  — جزئیات کامل لید
 * PATCH /api/admin/leads/[id]  — بروزرسانی وضعیت، مسئول، یا یادداشت
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { leads, chatMessages, chatSessions } from '@/lib/db/schema'
import { requireAdmin } from '@/lib/admin-auth'
import { eq, asc } from 'drizzle-orm'
import type { LeadStatus } from '@/lib/db/schema'

type Params = { params: Promise<{ id: string }> }

// ── GET ───────────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest, { params }: Params) {
  const auth = await requireAdmin(req)
  if (!auth.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  try {
    const [lead] = await db
      .select()
      .from(leads)
      .where(eq(leads.id, id))
      .limit(1)

    if (!lead) {
      return NextResponse.json({ error: 'لید یافت نشد' }, { status: 404 })
    }

    // اگر session داشت، پیام‌های چت را هم بگیر
    let messages: { role: string; content: string; createdAt: Date }[] = []
    if (lead.sessionId) {
      messages = await db
        .select({
          role:      chatMessages.role,
          content:   chatMessages.content,
          createdAt: chatMessages.createdAt,
        })
        .from(chatMessages)
        .where(eq(chatMessages.sessionId, lead.sessionId))
        .orderBy(asc(chatMessages.createdAt))
        .limit(100)
    }

    return NextResponse.json({ lead, messages })
  } catch (err) {
    console.error('[lead GET]', err)
    return NextResponse.json({ error: 'خطا در دریافت لید' }, { status: 500 })
  }
}

// ── PATCH ─────────────────────────────────────────────────────────────────────

export async function PATCH(req: NextRequest, { params }: Params) {
  const auth = await requireAdmin(req)
  if (!auth.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  try {
    const body = await req.json() as {
      status?: LeadStatus
      assignedTo?: string | null
      contactedAt?: string | null
      fullName?: string
      city?: string
      inquiryType?: string
      aiSummary?: string
    }

    const validStatuses: LeadStatus[] = ['new', 'contacted', 'converted', 'lost']

    // ── تغییر وضعیت ──────────────────────────────────────────────
    if (body.status && !validStatuses.includes(body.status)) {
      return NextResponse.json({ error: 'وضعیت نامعتبر' }, { status: 400 })
    }

    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    }

    if (body.status !== undefined) {
      updateData.status = body.status
      // وقتی به "contacted" تبدیل می‌شود، زمان تماس ثبت شود
      if (body.status === 'contacted' && !body.contactedAt) {
        updateData.contactedAt = new Date()
      }
    }

    if (body.assignedTo !== undefined)  updateData.assignedTo  = body.assignedTo
    if (body.contactedAt !== undefined) updateData.contactedAt = body.contactedAt ? new Date(body.contactedAt) : null
    if (body.fullName !== undefined)    updateData.fullName    = body.fullName.trim() || null
    if (body.city !== undefined)        updateData.city        = body.city.trim() || null
    if (body.inquiryType !== undefined) updateData.inquiryType = body.inquiryType.trim() || null
    if (body.aiSummary !== undefined)   updateData.aiSummary   = body.aiSummary.trim() || null

    const [updated] = await db
      .update(leads)
      // biome-ignore lint/suspicious/noExplicitAny: dynamic update fields
      .set(updateData as any)
      .where(eq(leads.id, id))
      .returning()

    if (!updated) {
      return NextResponse.json({ error: 'لید یافت نشد' }, { status: 404 })
    }

    return NextResponse.json({ lead: updated })
  } catch (err) {
    console.error('[lead PATCH]', err)
    return NextResponse.json({ error: 'خطا در بروزرسانی لید' }, { status: 500 })
  }
}
