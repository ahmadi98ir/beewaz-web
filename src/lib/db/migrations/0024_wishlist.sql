-- Wishlist (علاقه‌مندی‌ها)
CREATE TABLE IF NOT EXISTS "wishlist_items" (
  "id"         uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id"    uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "product_id" uuid NOT NULL REFERENCES "products"("id") ON DELETE CASCADE,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "wishlist_user_product_uq" UNIQUE("user_id","product_id")
);

CREATE INDEX IF NOT EXISTS "wishlist_user_idx" ON "wishlist_items"("user_id");
