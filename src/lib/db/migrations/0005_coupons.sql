-- Migration 0005: سیستم کوپن و تخفیف

-- Enum نوع کوپن
DO $$ BEGIN
  CREATE TYPE "public"."coupon_type" AS ENUM('percentage', 'fixed');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- جدول کوپن‌ها
CREATE TABLE IF NOT EXISTS "coupons" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "code" varchar(50) UNIQUE NOT NULL,
  "type" "coupon_type" NOT NULL,
  "value" numeric(10,2) NOT NULL,
  "min_order_amount" numeric(14,0),
  "max_discount_amount" numeric(14,0),
  "usage_limit" integer,
  "usage_count" integer DEFAULT 0 NOT NULL,
  "per_user_limit" integer DEFAULT 1,
  "expires_at" timestamp with time zone,
  "active" boolean DEFAULT true NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- جدول استفاده از کوپن‌ها
CREATE TABLE IF NOT EXISTS "coupon_usages" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "coupon_id" uuid NOT NULL REFERENCES "coupons"("id") ON DELETE CASCADE,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "order_id" uuid NOT NULL REFERENCES "orders"("id") ON DELETE CASCADE,
  "discount_amount" numeric(14,0) NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- اضافه کردن فیلد کوپن به سفارشات
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "coupon_code" varchar(50);
