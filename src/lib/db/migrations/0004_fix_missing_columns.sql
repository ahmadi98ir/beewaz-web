-- ── 0004: افزودن ستون‌های گمشده به جداول products، orders، order_items ──────────

-- ── products: soft-delete + رتبه‌بندی ──────────────────────────────────────────
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "rating_avg" numeric(3,2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "rating_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint

-- ── product_images: پرچم تصویر اصلی ──────────────────────────────────────────
ALTER TABLE "product_images" ADD COLUMN IF NOT EXISTS "is_primary" boolean DEFAULT false NOT NULL;--> statement-breakpoint

-- ── product_status enum: اضافه کردن ناموجود ─────────────────────────────────
ALTER TYPE "public"."product_status" ADD VALUE IF NOT EXISTS 'out_of_stock';--> statement-breakpoint

-- ── orders: ستون‌های جدید ────────────────────────────────────────────────────
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "shipping_amount" numeric(14,0) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "discount_amount" numeric(14,0) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "transaction_id" varchar(100);--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "tracking_code" varchar(100);--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "customer_note" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "admin_note" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "shipped_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "delivered_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "user_id" DROP NOT NULL;--> statement-breakpoint

-- ── payment_method enum: روش‌های پرداخت جدید ─────────────────────────────────
ALTER TYPE "public"."payment_method" ADD VALUE IF NOT EXISTS 'online';--> statement-breakpoint
ALTER TYPE "public"."payment_method" ADD VALUE IF NOT EXISTS 'card_to_card';--> statement-breakpoint
ALTER TYPE "public"."payment_method" ADD VALUE IF NOT EXISTS 'cash_on_delivery';--> statement-breakpoint
ALTER TYPE "public"."payment_method" ADD VALUE IF NOT EXISTS 'installment';--> statement-breakpoint

-- ── order_items: ستون‌های جدید ───────────────────────────────────────────────
ALTER TABLE "order_items" ADD COLUMN IF NOT EXISTS "variant_id" uuid;--> statement-breakpoint
ALTER TABLE "order_items" ADD COLUMN IF NOT EXISTS "product_name" varchar(200) DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "order_items" ADD COLUMN IF NOT EXISTS "variant_name" varchar(128);--> statement-breakpoint
ALTER TABLE "order_items" ADD COLUMN IF NOT EXISTS "sku" varchar(64);--> statement-breakpoint
ALTER TABLE "order_items" ADD COLUMN IF NOT EXISTS "total_price" numeric(14,0);--> statement-breakpoint
ALTER TABLE "order_items" ADD COLUMN IF NOT EXISTS "meta" jsonb DEFAULT '{}'::jsonb;--> statement-breakpoint
ALTER TABLE "order_items" ADD COLUMN IF NOT EXISTS "created_at" timestamp with time zone DEFAULT now() NOT NULL;
