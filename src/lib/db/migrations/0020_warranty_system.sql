-- ─── warranty_system ─────────────────────────────────────────────────────────
-- Add warranty_days to products, create product_serials and warranties tables

-- 1. warrantyDays column on products
ALTER TABLE products ADD COLUMN IF NOT EXISTS warranty_days integer NOT NULL DEFAULT 0;

-- 2. Enums
DO $$ BEGIN
  CREATE TYPE serial_status AS ENUM ('unregistered', 'active', 'expired');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE warranty_status AS ENUM ('active', 'claimed', 'expired');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 3. product_serials
CREATE TABLE IF NOT EXISTS product_serials (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id   uuid REFERENCES products(id) ON DELETE SET NULL,
  serial_number varchar(100) NOT NULL UNIQUE,
  status        serial_status NOT NULL DEFAULT 'unregistered',
  generated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ps_product_id_idx    ON product_serials(product_id);
CREATE INDEX IF NOT EXISTS ps_serial_number_idx ON product_serials(serial_number);
CREATE INDEX IF NOT EXISTS ps_status_idx        ON product_serials(status);

-- 4. warranties
CREATE TABLE IF NOT EXISTS warranties (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid REFERENCES users(id) ON DELETE SET NULL,
  serial_number_id uuid NOT NULL REFERENCES product_serials(id) ON DELETE CASCADE,
  activated_at     timestamptz NOT NULL DEFAULT now(),
  expires_at       timestamptz NOT NULL,
  status           warranty_status NOT NULL DEFAULT 'active',
  invoice_file     text,
  created_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS w_user_id_idx   ON warranties(user_id);
CREATE INDEX IF NOT EXISTS w_serial_id_idx ON warranties(serial_number_id);
CREATE INDEX IF NOT EXISTS w_status_idx    ON warranties(status);
