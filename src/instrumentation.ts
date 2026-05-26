/**
 * Next.js Instrumentation Hook — یک‌بار در server startup اجرا می‌شود
 * در standalone Docker: migrations در /app/migrations
 * در dev: migrations در src/lib/db/migrations
 */

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { migrate } = await import('drizzle-orm/postgres-js/migrator')
    const { drizzle } = await import('drizzle-orm/postgres-js')
    const postgres = (await import('postgres')).default
    const path = await import('path')
    const fs = await import('fs')

    const DATABASE_URL = process.env.DATABASE_URL
    if (!DATABASE_URL) {
      console.warn('[migration] DATABASE_URL not set — skipping')
      return
    }

    // standalone Docker: /app/migrations | dev: src/lib/db/migrations
    const candidates = [
      path.join(process.cwd(), 'migrations'),
      path.join(process.cwd(), 'src/lib/db/migrations'),
    ]
    const migrationsFolder = candidates.find((p) => fs.existsSync(p))
    if (!migrationsFolder) {
      console.warn('[migration] migrations folder not found — skipping')
      return
    }

    try {
      const sql = postgres(DATABASE_URL, { max: 1 })
      const db = drizzle(sql)
      await migrate(db, { migrationsFolder })
      console.log('[migration] ✅ DB migrations applied —', migrationsFolder)

      // safety-net: جداول ضروری را مستقیم می‌سازیم (در صورت خطای migration tracker)
      await sql.unsafe(`
        CREATE TABLE IF NOT EXISTS "phone_otps" (
          "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
          "phone" varchar(15) NOT NULL,
          "code" varchar(6) NOT NULL,
          "expires_at" timestamp with time zone NOT NULL,
          "used_at" timestamp with time zone,
          "created_at" timestamp with time zone DEFAULT now() NOT NULL
        );
        ALTER TYPE "public"."lead_status" ADD VALUE IF NOT EXISTS 'qualified';
        ALTER TYPE "public"."lead_status" ADD VALUE IF NOT EXISTS 'proposal_sent';
        ALTER TYPE "public"."lead_status" ADD VALUE IF NOT EXISTS 'won';
        ALTER TYPE "public"."product_status" ADD VALUE IF NOT EXISTS 'out_of_stock';
        ALTER TYPE "public"."payment_method" ADD VALUE IF NOT EXISTS 'online';
        ALTER TYPE "public"."payment_method" ADD VALUE IF NOT EXISTS 'card_to_card';
        ALTER TYPE "public"."payment_method" ADD VALUE IF NOT EXISTS 'cash_on_delivery';
        ALTER TYPE "public"."payment_method" ADD VALUE IF NOT EXISTS 'installment';
        ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "deleted_at" timestamp with time zone;
        ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "rating_avg" numeric(3,2) DEFAULT '0';
        ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "rating_count" integer DEFAULT 0 NOT NULL;
        ALTER TABLE "product_images" ADD COLUMN IF NOT EXISTS "is_primary" boolean DEFAULT false NOT NULL;
        ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "shipping_amount" numeric(14,0) DEFAULT '0' NOT NULL;
        ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "discount_amount" numeric(14,0) DEFAULT '0' NOT NULL;
        ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "transaction_id" varchar(100);
        ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "tracking_code" varchar(100);
        ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "customer_note" text;
        ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "admin_note" text;
        ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "shipped_at" timestamp with time zone;
        ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "delivered_at" timestamp with time zone;
        ALTER TABLE "orders" ALTER COLUMN "user_id" DROP NOT NULL;
        ALTER TABLE "order_items" ADD COLUMN IF NOT EXISTS "variant_id" uuid;
        ALTER TABLE "order_items" ADD COLUMN IF NOT EXISTS "product_name" varchar(200) DEFAULT '' NOT NULL;
        ALTER TABLE "order_items" ADD COLUMN IF NOT EXISTS "variant_name" varchar(128);
        ALTER TABLE "order_items" ADD COLUMN IF NOT EXISTS "sku" varchar(64);
        ALTER TABLE "order_items" ADD COLUMN IF NOT EXISTS "total_price" numeric(14,0);
        ALTER TABLE "order_items" ADD COLUMN IF NOT EXISTS "meta" jsonb DEFAULT '{}'::jsonb;
        ALTER TABLE "order_items" ADD COLUMN IF NOT EXISTS "created_at" timestamp with time zone DEFAULT now() NOT NULL;
        CREATE TABLE IF NOT EXISTS "lead_notes" (
          "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
          "lead_id" uuid NOT NULL REFERENCES "leads"("id") ON DELETE CASCADE,
          "note" text NOT NULL,
          "created_by" uuid REFERENCES "users"("id") ON DELETE SET NULL,
          "created_at" timestamp with time zone DEFAULT now() NOT NULL
        );
        CREATE TABLE IF NOT EXISTS "lead_activities" (
          "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
          "lead_id" uuid NOT NULL REFERENCES "leads"("id") ON DELETE CASCADE,
          "type" varchar(32) NOT NULL,
          "description" text NOT NULL,
          "metadata" jsonb DEFAULT '{}'::jsonb,
          "created_by" uuid REFERENCES "users"("id") ON DELETE SET NULL,
          "created_at" timestamp with time zone DEFAULT now() NOT NULL
        );
        CREATE TABLE IF NOT EXISTS "follow_ups" (
          "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
          "lead_id" uuid REFERENCES "leads"("id") ON DELETE CASCADE,
          "user_id" uuid REFERENCES "users"("id") ON DELETE CASCADE,
          "scheduled_at" timestamp with time zone NOT NULL,
          "note" text,
          "done_at" timestamp with time zone,
          "created_at" timestamp with time zone DEFAULT now() NOT NULL
        );
        CREATE TABLE IF NOT EXISTS "customer_notes" (
          "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
          "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
          "note" text NOT NULL,
          "created_by" uuid REFERENCES "users"("id") ON DELETE SET NULL,
          "created_at" timestamp with time zone DEFAULT now() NOT NULL
        );
        CREATE TABLE IF NOT EXISTS "pages" (
          "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
          "slug" varchar(200) UNIQUE NOT NULL,
          "title_fa" varchar(300) NOT NULL,
          "status" varchar(16) DEFAULT 'draft' NOT NULL,
          "blocks" jsonb DEFAULT '[]'::jsonb NOT NULL,
          "meta_title" text,
          "meta_desc" text,
          "og_image" text,
          "published_at" timestamp with time zone,
          "created_at" timestamp with time zone DEFAULT now() NOT NULL,
          "updated_at" timestamp with time zone DEFAULT now() NOT NULL
        );
        CREATE TABLE IF NOT EXISTS "product_specs" (
          "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
          "product_id" uuid NOT NULL REFERENCES "products"("id") ON DELETE CASCADE,
          "key_fa" varchar(100) NOT NULL,
          "value_fa" varchar(255) NOT NULL,
          "sort_order" integer DEFAULT 0 NOT NULL
        );
        CREATE TABLE IF NOT EXISTS "banners" (
          "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
          "name" varchar(100) NOT NULL,
          "image" text NOT NULL,
          "link" text,
          "target" varchar(10) DEFAULT '_self' NOT NULL,
          "position" varchar(64) DEFAULT 'home_hero' NOT NULL,
          "order_idx" integer DEFAULT 0 NOT NULL,
          "active" boolean DEFAULT true NOT NULL,
          "created_at" timestamp with time zone DEFAULT now() NOT NULL
        );
        DO $$ BEGIN CREATE TYPE "public"."coupon_type" AS ENUM('percentage', 'fixed');
        EXCEPTION WHEN duplicate_object THEN null; END $$;
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
        CREATE TABLE IF NOT EXISTS "coupon_usages" (
          "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
          "coupon_id" uuid NOT NULL REFERENCES "coupons"("id") ON DELETE CASCADE,
          "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
          "order_id" uuid NOT NULL REFERENCES "orders"("id") ON DELETE CASCADE,
          "discount_amount" numeric(14,0) NOT NULL,
          "created_at" timestamp with time zone DEFAULT now() NOT NULL
        );
        ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "coupon_code" varchar(50);
      `)
      console.log('[migration] ✅ all tables ensured')

      await sql.end()
    } catch (err) {
      console.error('[migration] ❌ Failed:', err)
    }
  }
}
