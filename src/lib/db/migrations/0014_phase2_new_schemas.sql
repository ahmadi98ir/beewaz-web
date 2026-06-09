-- Migration: Phase 2 — Attributes, Inventory, Locations, SMS Logs, Analytics
-- تاریخ: ۱۴۰۳-۱۰
-- توضیح: اسکیماهای جدید برای سیستم variant پیشرفته، انبارداری،
--         مکان‌یابی ایران، لاگ پیامک، و زیرساخت Analytics

-- ─── 1. Enums جدید ────────────────────────────────────────────────────────────

CREATE TYPE IF NOT EXISTS "inventory_tx_type" AS ENUM (
  'sale', 'return', 'adjustment', 'restock', 'damage', 'initial'
);

CREATE TYPE IF NOT EXISTS "sms_status" AS ENUM (
  'queued', 'sent', 'delivered', 'failed'
);

CREATE TYPE IF NOT EXISTS "sms_trigger" AS ENUM (
  'order_status_change', 'otp', 'payment_success',
  'shipment_tracking', 'low_stock_alert', 'manual'
);

-- ─── 2. Attribute Types (رنگ، سایز، متریال) ──────────────────────────────────

CREATE TABLE IF NOT EXISTS "product_attribute_types" (
  "id"          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name_fa"     VARCHAR(60) NOT NULL,
  "slug"        VARCHAR(40) NOT NULL UNIQUE,
  "input_type"  VARCHAR(20) NOT NULL DEFAULT 'select',
  "sort_order"  INTEGER NOT NULL DEFAULT 0,
  "created_at"  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── 3. Attribute Values (قرمز، آبی، L، XL) ─────────────────────────────────

CREATE TABLE IF NOT EXISTS "product_attribute_values" (
  "id"          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "type_id"     UUID NOT NULL REFERENCES "product_attribute_types"("id") ON DELETE CASCADE,
  "value_fa"    VARCHAR(80) NOT NULL,
  "value_en"    VARCHAR(80),
  "color_hex"   VARCHAR(7),
  "sort_order"  INTEGER NOT NULL DEFAULT 0,
  "created_at"  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "attr_value_type_idx" ON "product_attribute_values"("type_id");

-- ─── 4. Variant ↔ Attribute Value junction ───────────────────────────────────

CREATE TABLE IF NOT EXISTS "product_variant_options" (
  "variant_id"          UUID NOT NULL REFERENCES "product_variants"("id") ON DELETE CASCADE,
  "attribute_value_id"  UUID NOT NULL REFERENCES "product_attribute_values"("id") ON DELETE CASCADE,
  PRIMARY KEY ("variant_id", "attribute_value_id")
);

CREATE INDEX IF NOT EXISTS "variant_options_variant_idx"   ON "product_variant_options"("variant_id");
CREATE INDEX IF NOT EXISTS "variant_options_attr_val_idx"  ON "product_variant_options"("attribute_value_id");

-- ─── 5. Product ↔ Attribute Type assignments ─────────────────────────────────

CREATE TABLE IF NOT EXISTS "product_attribute_type_assignments" (
  "product_id"       UUID NOT NULL REFERENCES "products"("id") ON DELETE CASCADE,
  "attribute_type_id" UUID NOT NULL REFERENCES "product_attribute_types"("id") ON DELETE CASCADE,
  PRIMARY KEY ("product_id", "attribute_type_id")
);

-- ─── 6. Inventory Transactions ───────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "inventory_transactions" (
  "id"              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "product_id"      UUID NOT NULL REFERENCES "products"("id") ON DELETE CASCADE,
  "variant_id"      UUID REFERENCES "product_variants"("id") ON DELETE SET NULL,
  "type"            "inventory_tx_type" NOT NULL,
  "quantity_change" INTEGER NOT NULL,
  "stock_after"     INTEGER NOT NULL,
  "reference_id"    UUID,
  "reference_type"  VARCHAR(30),
  "note"            TEXT,
  "created_by"      UUID REFERENCES "users"("id") ON DELETE SET NULL,
  "created_at"      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "inv_tx_product_idx"   ON "inventory_transactions"("product_id");
CREATE INDEX IF NOT EXISTS "inv_tx_variant_idx"   ON "inventory_transactions"("variant_id");
CREATE INDEX IF NOT EXISTS "inv_tx_type_idx"      ON "inventory_transactions"("type");
CREATE INDEX IF NOT EXISTS "inv_tx_created_at_idx" ON "inventory_transactions"("created_at");
CREATE INDEX IF NOT EXISTS "inv_tx_reference_idx" ON "inventory_transactions"("reference_type", "reference_id");

-- ─── 7. Low Stock Alerts ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "low_stock_alerts" (
  "id"              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "product_id"      UUID NOT NULL UNIQUE REFERENCES "products"("id") ON DELETE CASCADE,
  "threshold"       INTEGER NOT NULL DEFAULT 5,
  "last_alerted_at" TIMESTAMPTZ,
  "silence_until"   TIMESTAMPTZ,
  "created_at"      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "low_stock_product_idx" ON "low_stock_alerts"("product_id");

-- ─── 8. Provinces (استان‌ها) ─────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "provinces" (
  "id"         SERIAL PRIMARY KEY,
  "name_fa"    VARCHAR(60) NOT NULL UNIQUE,
  "code"       VARCHAR(4) NOT NULL UNIQUE,
  "sort_order" INTEGER NOT NULL DEFAULT 0
);

-- ─── 9. Cities (شهرها) ──────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "cities" (
  "id"          SERIAL PRIMARY KEY,
  "province_id" INTEGER NOT NULL REFERENCES "provinces"("id") ON DELETE CASCADE,
  "name_fa"     VARCHAR(80) NOT NULL,
  "is_active"   BOOLEAN NOT NULL DEFAULT true,
  "sort_order"  INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS "city_province_idx" ON "cities"("province_id");

-- ─── 10. SMS Logs ─────────────────────────────────────────────────────────────

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

-- ─── 11. Product Views ────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "product_views" (
  "id"         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "product_id" UUID NOT NULL REFERENCES "products"("id") ON DELETE CASCADE,
  "user_id"    UUID REFERENCES "users"("id") ON DELETE SET NULL,
  "session_id" VARCHAR(64),
  "source"     VARCHAR(40),
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "pv_product_idx"    ON "product_views"("product_id");
CREATE INDEX IF NOT EXISTS "pv_created_at_idx" ON "product_views"("created_at");
CREATE INDEX IF NOT EXISTS "pv_session_idx"    ON "product_views"("session_id");

-- ─── 12. Cart Abandonment Sessions ───────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "cart_abandonment_sessions" (
  "id"                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id"             UUID REFERENCES "users"("id") ON DELETE SET NULL,
  "session_id"          VARCHAR(64),
  "cart_snapshot"       JSONB NOT NULL,
  "total_amount_rial"   BIGINT NOT NULL,
  "item_count"          INTEGER NOT NULL,
  "recovered"           BOOLEAN NOT NULL DEFAULT false,
  "recovered_order_id"  UUID,
  "last_seen_at"        TIMESTAMPTZ NOT NULL,
  "recovered_at"        TIMESTAMPTZ,
  "created_at"          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "cart_ab_user_idx"      ON "cart_abandonment_sessions"("user_id");
CREATE INDEX IF NOT EXISTS "cart_ab_recovered_idx" ON "cart_abandonment_sessions"("recovered");
CREATE INDEX IF NOT EXISTS "cart_ab_last_seen_idx" ON "cart_abandonment_sessions"("last_seen_at");

-- ─── 13. Analytics Daily Snapshots ───────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "analytics_daily_snapshots" (
  "date"                  DATE PRIMARY KEY,
  "total_orders"          INTEGER NOT NULL DEFAULT 0,
  "paid_orders"           INTEGER NOT NULL DEFAULT 0,
  "cancelled_orders"      INTEGER NOT NULL DEFAULT 0,
  "revenue_rial"          BIGINT NOT NULL DEFAULT 0,
  "revenue_toman"         BIGINT NOT NULL DEFAULT 0,
  "aov_toman"             BIGINT NOT NULL DEFAULT 0,
  "new_users"             INTEGER NOT NULL DEFAULT 0,
  "active_users"          INTEGER NOT NULL DEFAULT 0,
  "product_views_count"   INTEGER NOT NULL DEFAULT 0,
  "abandoned_carts"       INTEGER NOT NULL DEFAULT 0,
  "recovered_carts"       INTEGER NOT NULL DEFAULT 0,
  "abandoned_value_toman" BIGINT NOT NULL DEFAULT 0,
  "conversion_rate_bps"   INTEGER NOT NULL DEFAULT 0,
  "computed_at"           TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "snapshot_date_idx" ON "analytics_daily_snapshots"("date");
