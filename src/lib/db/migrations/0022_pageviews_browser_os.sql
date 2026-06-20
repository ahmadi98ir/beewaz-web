-- ─── page_views: افزودن ستون‌های مرورگر و سیستم‌عامل برای آمار حرفه‌ای ──────────

ALTER TABLE "page_views" ADD COLUMN IF NOT EXISTS "browser" VARCHAR(32);
ALTER TABLE "page_views" ADD COLUMN IF NOT EXISTS "os"      VARCHAR(32);

CREATE INDEX IF NOT EXISTS "pv_browser_idx" ON "page_views"("browser");
CREATE INDEX IF NOT EXISTS "pv_os_idx"      ON "page_views"("os");
