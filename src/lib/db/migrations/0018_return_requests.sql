-- ─── Enums ──────────────────────────────────────────────────────────────────
CREATE TYPE "return_reason" AS ENUM (
  'defective',
  'wrong_item',
  'not_as_described',
  'changed_mind',
  'other'
);

CREATE TYPE "return_status" AS ENUM (
  'pending',
  'approved',
  'rejected',
  'refunded'
);

-- ─── Table ───────────────────────────────────────────────────────────────────
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
);

CREATE INDEX IF NOT EXISTS "rr_order_id_idx"      ON "return_requests"("order_id");
CREATE INDEX IF NOT EXISTS "rr_user_id_idx"        ON "return_requests"("user_id");
CREATE INDEX IF NOT EXISTS "rr_status_idx"         ON "return_requests"("status");
CREATE INDEX IF NOT EXISTS "rr_requested_at_idx"   ON "return_requests"("requested_at");
