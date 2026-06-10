import { NextResponse } from 'next/server'
import { requireAdmin }  from '@/lib/admin-auth'
import { db }            from '@/lib/db'
import { sql }           from 'drizzle-orm'

export async function GET() {
  const guard = await requireAdmin()
  if (!guard.ok) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const results: string[] = []

  try {
    // ── return_reason enum ───────────────────────────────────────────────
    await db.execute(sql`
      DO $$ BEGIN
        CREATE TYPE "return_reason" AS ENUM (
          'defective', 'wrong_item', 'not_as_described', 'changed_mind', 'other'
        );
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `)
    results.push('return_reason enum: ok')

    // ── return_status enum ───────────────────────────────────────────────
    await db.execute(sql`
      DO $$ BEGIN
        CREATE TYPE "return_status" AS ENUM (
          'pending', 'approved', 'rejected', 'refunded'
        );
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `)
    results.push('return_status enum: ok')

    // ── return_requests table ────────────────────────────────────────────
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "return_requests" (
        "id"            uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "order_id"      uuid NOT NULL REFERENCES "orders"("id") ON DELETE CASCADE,
        "user_id"       uuid REFERENCES "users"("id") ON DELETE SET NULL,
        "order_item_id" uuid REFERENCES "order_items"("id") ON DELETE SET NULL,
        "reason"        "return_reason" NOT NULL,
        "reason_text"   text,
        "status"        "return_status" NOT NULL DEFAULT 'pending',
        "admin_notes"   text,
        "requested_at"  timestamp with time zone DEFAULT now() NOT NULL,
        "resolved_at"   timestamp with time zone,
        "created_at"    timestamp with time zone DEFAULT now() NOT NULL,
        "updated_at"    timestamp with time zone DEFAULT now() NOT NULL
      )
    `)
    results.push('return_requests table: ok')

    await db.execute(sql`CREATE INDEX IF NOT EXISTS "rr_order_id_idx"     ON "return_requests"("order_id")`)
    await db.execute(sql`CREATE INDEX IF NOT EXISTS "rr_user_id_idx"      ON "return_requests"("user_id")`)
    await db.execute(sql`CREATE INDEX IF NOT EXISTS "rr_status_idx"       ON "return_requests"("status")`)
    await db.execute(sql`CREATE INDEX IF NOT EXISTS "rr_requested_at_idx" ON "return_requests"("requested_at")`)
    results.push('return_requests indexes: ok')

    // ── categories table ─────────────────────────────────────────────────
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "categories" (
        "id"         uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "name_fa"    varchar(100) NOT NULL,
        "slug"       varchar(120) NOT NULL,
        "parent_id"  uuid REFERENCES "categories"("id") ON DELETE SET NULL,
        "icon"       varchar(10),
        "sort_order" integer NOT NULL DEFAULT 0,
        "created_at" timestamp with time zone DEFAULT now() NOT NULL,
        "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
        CONSTRAINT "categories_slug_unique" UNIQUE("slug")
      )
    `)
    results.push('categories table: ok')

    await db.execute(sql`CREATE INDEX IF NOT EXISTS "cat_parent_id_idx" ON "categories"("parent_id")`)
    await db.execute(sql`CREATE INDEX IF NOT EXISTS "cat_slug_idx"      ON "categories"("slug")`)
    results.push('categories indexes: ok')

    return NextResponse.json({ success: true, steps: results })

  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ success: false, error: msg, steps: results }, { status: 500 })
  }
}
