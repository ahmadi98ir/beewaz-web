CREATE TABLE IF NOT EXISTS "menu_items" (
  "id"          uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "location"    varchar(32) NOT NULL,
  "parent_id"   uuid,
  "label"       varchar(200) NOT NULL,
  "href"        varchar(300) NOT NULL,
  "description" text,
  "sort_order"  integer DEFAULT 0 NOT NULL,
  "active"      boolean DEFAULT true NOT NULL,
  "created_at"  timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at"  timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "menu_items_location_idx" ON "menu_items"("location");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "menu_items_parent_id_idx" ON "menu_items"("parent_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "menu_items_sort_order_idx" ON "menu_items"("sort_order");
--> statement-breakpoint
DO $$
DECLARE
  shop_id uuid;
  kb_id uuid;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM "menu_items" WHERE "location" = 'header') THEN
    INSERT INTO "menu_items" ("location", "parent_id", "label", "href", "description", "sort_order")
      VALUES ('header', NULL, 'فروشگاه', '/shop', NULL, 0)
      RETURNING "id" INTO shop_id;

    INSERT INTO "menu_items" ("location", "parent_id", "label", "href", "description", "sort_order")
      VALUES ('header', NULL, 'پایگاه دانش', '/knowledge-base', NULL, 1)
      RETURNING "id" INTO kb_id;

    INSERT INTO "menu_items" ("location", "parent_id", "label", "href", "description", "sort_order") VALUES
      ('header', NULL, 'درباره ما', '/about', NULL, 2),
      ('header', NULL, 'تماس با ما', '/contact', NULL, 3),
      ('header', shop_id, 'حسگرها', '/shop/sensors', 'حسگر حرکتی، مغناطیسی، شکست شیشه', 0),
      ('header', shop_id, 'دزدگیر مرکزی', '/shop/central-alarm', 'پنل‌های اصلی و دستگاه‌های مرکزی', 1),
      ('header', shop_id, 'سیرن و آژیر', '/shop/sirens', 'سیرن داخلی، خارجی و پیزو', 2),
      ('header', shop_id, 'تجهیزات کنترل', '/shop/control', 'ریموت، کی‌پد و برد رله', 3),
      ('header', shop_id, 'تقویت‌کننده', '/shop/boosters', 'آنتن و تقویت‌کننده سیگنال', 4),
      ('header', shop_id, 'لوازم جانبی', '/shop/accessories', 'کابل، منبع تغذیه و باتری', 5),
      ('header', kb_id, 'راهنمای نصب', '/knowledge-base/installation', 'آموزش گام‌به‌گام نصب و راه‌اندازی', 0),
      ('header', kb_id, 'انتخاب محصول', '/knowledge-base/selection', 'کدام دزدگیر برای شما مناسب است؟', 1),
      ('header', kb_id, 'عیب‌یابی', '/knowledge-base/troubleshooting', 'رفع مشکلات رایج دستگاه‌ها', 2);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM "menu_items" WHERE "location" = 'footer_shop') THEN
    INSERT INTO "menu_items" ("location", "parent_id", "label", "href", "sort_order") VALUES
      ('footer_shop', NULL, 'همه محصولات', '/shop', 0),
      ('footer_shop', NULL, 'دزدگیر مرکزی', '/shop/central-alarm', 1),
      ('footer_shop', NULL, 'حسگرها', '/shop/sensors', 2),
      ('footer_shop', NULL, 'سیرن و آژیر', '/shop/sirens', 3),
      ('footer_shop', NULL, 'تجهیزات کنترل', '/shop/control', 4);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM "menu_items" WHERE "location" = 'footer_knowledge') THEN
    INSERT INTO "menu_items" ("location", "parent_id", "label", "href", "sort_order") VALUES
      ('footer_knowledge', NULL, 'پایگاه دانش', '/knowledge-base', 0),
      ('footer_knowledge', NULL, 'راهنمای نصب', '/knowledge-base/installation', 1),
      ('footer_knowledge', NULL, 'انتخاب محصول', '/knowledge-base/selection', 2),
      ('footer_knowledge', NULL, 'عیب‌یابی', '/knowledge-base/troubleshooting', 3),
      ('footer_knowledge', NULL, 'بلاگ', '/blog', 4);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM "menu_items" WHERE "location" = 'footer_company') THEN
    INSERT INTO "menu_items" ("location", "parent_id", "label", "href", "sort_order") VALUES
      ('footer_company', NULL, 'درباره بیواز', '/about', 0),
      ('footer_company', NULL, 'تماس با ما', '/contact', 1),
      ('footer_company', NULL, 'نمایندگی‌ها', '/dealers', 2),
      ('footer_company', NULL, 'گارانتی', '/warranty', 3),
      ('footer_company', NULL, 'حریم خصوصی', '/privacy', 4);
  END IF;
END $$;
