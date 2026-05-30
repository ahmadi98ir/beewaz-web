-- Sale price fields on products
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS sale_price bigint,
  ADD COLUMN IF NOT EXISTS sale_price_from timestamptz,
  ADD COLUMN IF NOT EXISTS sale_price_to timestamptz,
  ADD COLUMN IF NOT EXISTS related_product_ids jsonb DEFAULT '[]'::jsonb;

-- Order note type enum
DO $$ BEGIN
  CREATE TYPE order_note_type AS ENUM ('internal', 'refund', 'customer');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Order notes table
CREATE TABLE IF NOT EXISTS order_notes (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  note        text NOT NULL,
  type        order_note_type NOT NULL DEFAULT 'internal',
  created_by  varchar(100),
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS order_notes_order_id_idx ON order_notes(order_id);
