-- Make snapshot nullable and give it a default (existing rows won't break)
ALTER TABLE "order_items" ALTER COLUMN "snapshot" SET DEFAULT '{}'::jsonb;
ALTER TABLE "order_items" ALTER COLUMN "snapshot" DROP NOT NULL;

-- Make unit_price accept numeric string (was bigint, code sends string)
-- Already compatible since bigint accepts numeric strings in postgres

-- Make product_id nullable (order_items inserted without FK sometimes)
ALTER TABLE "order_items" DROP CONSTRAINT IF EXISTS "order_items_product_id_products_id_fk";
ALTER TABLE "order_items" ALTER COLUMN "product_id" DROP NOT NULL;
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_id_products_id_fk"
  FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE SET NULL;
