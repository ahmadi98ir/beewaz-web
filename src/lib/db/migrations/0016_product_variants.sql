-- Migration: Product Variants + Variant-Attribute junction
-- این migration جدول product_variants را از صفر می‌سازد و
-- product_variant_options را که در 0014 fail شده بود نیز اضافه می‌کند.

-- ─── 1. product_variants ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "product_variants" (
  "id"            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "product_id"    UUID NOT NULL REFERENCES "products"("id") ON DELETE CASCADE,
  "name_fa"       VARCHAR(120) NOT NULL,
  "sku"           VARCHAR(60) UNIQUE,
  "price"         BIGINT,
  "compare_price" BIGINT,
  "stock"         INTEGER NOT NULL DEFAULT 0,
  "weight"        INTEGER,
  "is_active"     BOOLEAN NOT NULL DEFAULT true,
  "image_url"     TEXT,
  "sort_order"    INTEGER NOT NULL DEFAULT 0,
  "created_at"    TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at"    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "pv_product_id_idx"  ON "product_variants"("product_id");
CREATE INDEX IF NOT EXISTS "pv_is_active_idx"   ON "product_variants"("is_active");
CREATE INDEX IF NOT EXISTS "pv_sku_idx"         ON "product_variants"("sku") WHERE "sku" IS NOT NULL;

-- ─── 2. product_variant_options (جدول junction variant ↔ attribute_value) ──

CREATE TABLE IF NOT EXISTS "product_variant_options" (
  "variant_id"          UUID NOT NULL REFERENCES "product_variants"("id") ON DELETE CASCADE,
  "attribute_value_id"  UUID NOT NULL REFERENCES "product_attribute_values"("id") ON DELETE CASCADE,
  PRIMARY KEY ("variant_id", "attribute_value_id")
);

CREATE INDEX IF NOT EXISTS "variant_options_variant_idx"  ON "product_variant_options"("variant_id");
CREATE INDEX IF NOT EXISTS "variant_options_attr_val_idx" ON "product_variant_options"("attribute_value_id");

-- ─── 3. variant_id FK روی inventory_transactions (اگر variant_id بدون FK بود) ─

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu USING (constraint_name)
    WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_name = 'inventory_transactions'
      AND kcu.column_name = 'variant_id'
  ) THEN
    ALTER TABLE "inventory_transactions"
      ADD CONSTRAINT "inv_tx_variant_id_fk"
        FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE SET NULL;
  END IF;
END $$;
