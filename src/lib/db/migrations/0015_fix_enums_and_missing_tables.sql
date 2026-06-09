-- Migration: Fix enums + missing tables from 0014
-- جداول inventory_transactions و sms_logs که به خاطر CREATE TYPE IF NOT EXISTS fail شده بودند

-- ─── Enums (با DO block برای ایمنی) ─────────────────────────────────────────

DO $$ BEGIN
  CREATE TYPE "inventory_tx_type" AS ENUM ('sale', 'return', 'adjustment', 'restock', 'damage', 'initial');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "sms_status" AS ENUM ('queued', 'sent', 'delivered', 'failed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "sms_trigger" AS ENUM (
    'order_status_change', 'otp', 'payment_success',
    'shipment_tracking', 'low_stock_alert', 'manual'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─── Inventory Transactions ───────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "inventory_transactions" (
  "id"              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "product_id"      UUID NOT NULL REFERENCES "products"("id") ON DELETE CASCADE,
  "variant_id"      UUID,
  "type"            "inventory_tx_type" NOT NULL,
  "quantity_change" INTEGER NOT NULL,
  "stock_after"     INTEGER NOT NULL,
  "reference_id"    UUID,
  "reference_type"  VARCHAR(30),
  "note"            TEXT,
  "created_by"      UUID REFERENCES "users"("id") ON DELETE SET NULL,
  "created_at"      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "inv_tx_product_idx"    ON "inventory_transactions"("product_id");
CREATE INDEX IF NOT EXISTS "inv_tx_variant_idx"    ON "inventory_transactions"("variant_id");
CREATE INDEX IF NOT EXISTS "inv_tx_type_idx"       ON "inventory_transactions"("type");
CREATE INDEX IF NOT EXISTS "inv_tx_created_at_idx" ON "inventory_transactions"("created_at");
CREATE INDEX IF NOT EXISTS "inv_tx_reference_idx"  ON "inventory_transactions"("reference_type", "reference_id");

-- ─── SMS Logs ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "sms_logs" (
  "id"            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "phone"         VARCHAR(15) NOT NULL,
  "user_id"       UUID REFERENCES "users"("id") ON DELETE SET NULL,
  "message"       TEXT NOT NULL,
  "status"        "sms_status" NOT NULL DEFAULT 'queued',
  "trigger"       "sms_trigger" NOT NULL,
  "related_type"  VARCHAR(30),
  "related_id"    VARCHAR(100),
  "provider_ref"  VARCHAR(100),
  "error_message" TEXT,
  "sent_at"       TIMESTAMPTZ,
  "created_at"    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "sms_log_phone_idx"      ON "sms_logs"("phone");
CREATE INDEX IF NOT EXISTS "sms_log_user_idx"       ON "sms_logs"("user_id");
CREATE INDEX IF NOT EXISTS "sms_log_related_idx"    ON "sms_logs"("related_type", "related_id");
CREATE INDEX IF NOT EXISTS "sms_log_created_at_idx" ON "sms_logs"("created_at");
CREATE INDEX IF NOT EXISTS "sms_log_status_idx"     ON "sms_logs"("status");
