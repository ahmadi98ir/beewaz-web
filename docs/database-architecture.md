# معماری دیتابیس — بیواز

**دیتابیس:** PostgreSQL 18  
**ORM:** Drizzle ORM  
**فایل‌های schema:** `src/lib/db/schema/`  
**Migration ها:** `src/lib/db/migrations/`

---

## نمودار کلی جداول

```
users
 ├── orders ──── order_items
 │         └─── order_notes
 │         └─── coupon_usages ── coupons
 ├── chat_sessions ── chat_messages
 │               └── leads ── lead_notes
 │                        └── lead_activities
 │                        └── follow_ups
 ├── customer_notes
 └── phone_otps

products ── product_images
        ├── product_variants
        ├── product_specs
        └── categories (self-referential)

CMS:
  site_settings
  page_content
  page_views
  pages
  banners
```

---

## جداول

### `users` — کاربران

| ستون | نوع | توضیح |
|------|-----|-------|
| `id` | uuid PK | شناسه |
| `phone` | varchar(15) UNIQUE | شماره موبایل — اصلی‌ترین شناسه |
| `email` | varchar(255) UNIQUE | ایمیل (اختیاری) |
| `full_name` | varchar(100) | نام کامل |
| `role` | enum | `customer` / `admin` / `sales_agent` |
| `password_hash` | text | هش رمز عبور (برای ادمین) |
| `is_verified` | boolean | تأیید OTP |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |

---

### `phone_otps` — کدهای یک‌بار مصرف

| ستون | نوع | توضیح |
|------|-----|-------|
| `id` | uuid PK | |
| `phone` | varchar(15) | شماره موبایل |
| `code` | varchar(6) | کد ۶ رقمی |
| `expires_at` | timestamptz | انقضا (۵ دقیقه) |
| `used_at` | timestamptz | زمان استفاده (null = استفاده نشده) |
| `created_at` | timestamptz | |

**محدودیت‌ها:** حداکثر ۱ OTP هر ۲ دقیقه، حداکثر ۱۰ OTP در ۲۴ ساعت.

---

### `categories` — دسته‌بندی محصولات

| ستون | نوع | توضیح |
|------|-----|-------|
| `id` | uuid PK | |
| `parent_id` | uuid FK→categories | برای ساختار درختی |
| `name_fa` | varchar(100) | نام فارسی |
| `slug` | varchar(120) UNIQUE | شناسه URL |
| `icon` | text | آیکون (class یا SVG) |
| `sort_order` | integer | ترتیب نمایش |
| `created_at` | timestamptz | |

---

### `products` — محصولات

| ستون | نوع | توضیح |
|------|-----|-------|
| `id` | uuid PK | |
| `category_id` | uuid FK→categories | |
| `sku` | varchar(50) UNIQUE | کد محصول |
| `name_fa` | text | نام فارسی |
| `slug` | varchar(160) UNIQUE | شناسه URL |
| `description_fa` | text | توضیحات |
| `price` | bigint | قیمت به **ریال** |
| `compare_price` | bigint | قیمت اصلی (قبل از تخفیف دائم) |
| `sale_price` | bigint | قیمت حراج موقت |
| `sale_price_from` | timestamptz | شروع حراج |
| `sale_price_to` | timestamptz | پایان حراج |
| `stock` | integer | موجودی انبار |
| `status` | enum | `draft` / `active` / `archived` / `out_of_stock` |
| `is_featured` | boolean | نمایش در صفحه اصلی |
| `rating_avg` | numeric(3,2) | میانگین امتیاز |
| `rating_count` | integer | تعداد نظرات |
| `related_product_ids` | jsonb `string[]` | آرایه ID محصولات مرتبط |
| `meta_title` | text | عنوان SEO |
| `meta_desc` | text | توضیحات SEO |
| `deleted_at` | timestamptz | soft delete |
| `created_at` / `updated_at` | timestamptz | |

> **نکته قیمت:** UI قیمت را به **تومان** نمایش می‌دهد اما دیتابیس **ریال** ذخیره می‌کند (×۱۰). هنگام خواندن برای نمایش تقسیم بر ۱۰ کنید.

#### `product_images` — تصاویر محصول

| ستون | نوع | توضیح |
|------|-----|-------|
| `id` | uuid PK | |
| `product_id` | uuid FK→products CASCADE | |
| `url` | text | آدرس تصویر |
| `alt` | text | متن جایگزین |
| `is_primary` | boolean | تصویر اصلی |
| `sort_order` | integer | ترتیب |

#### `product_variants` — واریانت‌ها

| ستون | نوع | توضیح |
|------|-----|-------|
| `id` | uuid PK | |
| `product_id` | uuid FK→products CASCADE | |
| `name` | varchar(100) | نام واریانت |
| `sku` | varchar(50) | کد واریانت |
| `price` | numeric | قیمت (ریال) |
| `stock` | integer | موجودی |

#### `product_specs` — مشخصات فنی

| ستون | نوع | توضیح |
|------|-----|-------|
| `id` | uuid PK | |
| `product_id` | uuid FK→products CASCADE | |
| `key_fa` | varchar(100) | نام مشخصه |
| `value_fa` | varchar(255) | مقدار |
| `sort_order` | integer | ترتیب |

---

### `orders` — سفارشات

| ستون | نوع | توضیح |
|------|-----|-------|
| `id` | uuid PK | |
| `user_id` | uuid FK→users | |
| `shipping_address` | jsonb | آدرس کامل (snapshot) |
| `status` | enum | `pending`/`paid`/`processing`/`shipped`/`delivered`/`cancelled`/`refunded` |
| `payment_method` | enum | `online`/`card_to_card`/`cash_on_delivery`/`installment` |
| `total_amount` | numeric | مبلغ کل (ریال) |
| `shipping_amount` | numeric | هزینه ارسال (ریال) |
| `discount_amount` | numeric | مبلغ تخفیف (ریال) |
| `transaction_id` | varchar(100) | authority درگاه |
| `tracking_code` | varchar(100) | کد پیگیری پست |
| `customer_note` | text | یادداشت مشتری |
| `admin_note` | text | یادداشت داخلی ادمین |
| `coupon_code` | varchar(50) | کد کوپن استفاده‌شده |
| `paid_at` | timestamptz | |
| `shipped_at` | timestamptz | |
| `delivered_at` | timestamptz | |
| `created_at` / `updated_at` | timestamptz | |

**هزینه ارسال:** تهران ۱۰۰٬۰۰۰ ریال، شهرستان ۲۰۰٬۰۰۰ ریال، رایگان بالای ۲٬۰۰۰٬۰۰۰ ریال.

#### `order_items` — آیتم‌های سفارش

| ستون | نوع | توضیح |
|------|-----|-------|
| `id` | uuid PK | |
| `order_id` | uuid FK→orders CASCADE | |
| `product_id` | uuid FK→products SET NULL | |
| `variant_id` | uuid FK→product_variants SET NULL | |
| `product_name` | varchar(200) | snapshot نام هنگام خرید |
| `sku` | varchar(64) | snapshot SKU |
| `quantity` | integer | تعداد |
| `unit_price` | numeric | قیمت واحد (ریال) |
| `total_price` | numeric | جمع (ریال) |
| `meta` | jsonb | اطلاعات تکمیلی snapshot |

#### `order_notes` — یادداشت‌های سفارش

| ستون | نوع | توضیح |
|------|-----|-------|
| `id` | uuid PK | |
| `order_id` | uuid FK→orders CASCADE | |
| `note` | text | متن یادداشت |
| `type` | enum | `internal` / `refund` / `customer` |
| `created_by` | varchar(100) | سازنده (معمولاً `admin`) |
| `created_at` | timestamptz | |

---

### `coupons` — کوپن‌های تخفیف

| ستون | نوع | توضیح |
|------|-----|-------|
| `id` | uuid PK | |
| `code` | varchar(50) UNIQUE | کد کوپن (بزرگ) |
| `type` | enum | `percentage` / `fixed` |
| `value` | numeric | مقدار (درصد یا ریال) |
| `min_order_amount` | numeric | حداقل مبلغ سفارش (ریال) |
| `max_discount_amount` | numeric | سقف تخفیف برای نوع درصدی |
| `usage_limit` | integer | حداکثر استفاده کل (null=بی‌نهایت) |
| `usage_count` | integer | تعداد استفاده‌ها |
| `per_user_limit` | integer | حداکثر استفاده هر کاربر |
| `expires_at` | timestamptz | تاریخ انقضا |
| `active` | boolean | فعال/غیرفعال |

#### `coupon_usages` — تاریخچه استفاده کوپن

| ستون | نوع | توضیح |
|------|-----|-------|
| `coupon_id` | uuid FK→coupons CASCADE | |
| `user_id` | uuid FK→users CASCADE | |
| `order_id` | uuid FK→orders CASCADE | |
| `discount_amount` | numeric | مبلغ تخفیف اعمال‌شده (ریال) |

---

### `chat_sessions` — جلسات چت‌بات

| ستون | نوع | توضیح |
|------|-----|-------|
| `id` | uuid PK | |
| `user_id` | uuid FK→users | کاربر لاگین‌کرده (nullable) |
| `visitor_token` | varchar(100) | توکن بازدیدکننده ناشناس |
| `status` | enum | `active`/`lead_captured`/`assigned`/`closed` |
| `assigned_to` | uuid FK→users | عامل فروش |

#### `chat_messages` — پیام‌های چت

| ستون | نوع | توضیح |
|------|-----|-------|
| `session_id` | uuid FK→chat_sessions CASCADE | |
| `role` | enum | `user` / `assistant` / `system` |
| `content` | text | متن پیام |
| `metadata` | jsonb | intent، confidence، extractedPhone، ... |

---

### `leads` — سرنخ‌های فروش (CRM)

| ستون | نوع | توضیح |
|------|-----|-------|
| `id` | uuid PK | |
| `session_id` | uuid FK→chat_sessions | |
| `full_name` | varchar(100) | |
| `phone` | varchar(15) | **اصلی‌ترین فیلد** |
| `city` | varchar(100) | |
| `inquiry_type` | varchar(100) | خانگی / تجاری / پارکینگ |
| `ai_summary` | text | خلاصه مکالمه توسط AI |
| `status` | enum | `new`/`contacted`/`qualified`/`proposal_sent`/`won`/`converted`/`lost` |
| `assigned_to` | uuid FK→users | عامل فروش مسئول |
| `contacted_at` | timestamptz | زمان اولین تماس |

#### جداول CRM تکمیلی

- **`lead_notes`** — یادداشت‌های داخلی روی لید
- **`lead_activities`** — تاریخچه فعالیت‌ها (تماس، پیامک، جلسه)
- **`follow_ups`** — یادآورهای پیگیری با تاریخ مشخص
- **`customer_notes`** — یادداشت روی پروفایل مشتری (جدا از لید)

---

### جداول CMS

#### `site_settings` — تنظیمات سایت

جدول key-value برای تنظیمات کلی. کلیدهای مهم:
- `site_name`, `site_description` — اطلاعات پایه
- `admin_order_notify_phone` — شماره پیامک اطلاع‌رسانی سفارش
- `announcement_text`, `announcement_active` — نوار اطلاعیه

#### `page_content` — محتوای قابل‌ویرایش صفحات

هر رکورد یک بلاک محتوایی در یک صفحه است. `page + key` یکتاست.

صفحات: `home`, `shop`, `about`, `contact`, `global`

#### `pages` — صفحات آزاد

صفحات کامل با ساختار بلاک‌بندی JSON (برای landing page و غیره).

#### `banners` — بنرها

| `position` | توضیح |
|-----------|-------|
| `home_hero` | اسلایدر صفحه اصلی |
| `shop_top` | بالای صفحه فروشگاه |
| `sidebar` | کناری |
| `popup` | پاپ‌آپ |

---

## Enum های مهم

| Enum | مقادیر |
|------|--------|
| `user_role` | `customer`, `admin`, `sales_agent` |
| `product_status` | `draft`, `active`, `archived`, `out_of_stock` |
| `order_status` | `pending`, `paid`, `processing`, `shipped`, `delivered`, `cancelled`, `refunded` |
| `payment_method` | `online`, `card_to_card`, `cash_on_delivery`, `installment` |
| `order_note_type` | `internal`, `refund`, `customer` |
| `lead_status` | `new`, `contacted`, `qualified`, `proposal_sent`, `won`, `converted`, `lost` |
| `session_status` | `active`, `lead_captured`, `assigned`, `closed` |
| `coupon_type` | `percentage`, `fixed` |

---

## Migration ها

| فایل | توضیح |
|------|-------|
| `0000_certain_king_cobra.sql` | جداول اولیه |
| `0001_tidy_jack_flag.sql` | |
| `0002_phone_otps.sql` | جدول OTP |
| `0003_crm_cms_expansion.sql` | CRM و CMS |
| `0004_fix_missing_columns.sql` | اصلاح ستون‌های مفقود |
| `0005_coupons.sql` | سیستم کوپن |
| `0006_woocommerce_features.sql` | sale_price، order_notes |

---

## نکات مهم پیاده‌سازی

1. **قیمت‌ها همیشه ریال** در دیتابیس ذخیره می‌شوند — برای نمایش تقسیم بر ۱۰ کنید.
2. **Soft delete محصولات** — حذف واقعی نمی‌شوند، `deleted_at` set می‌شود.
3. **Snapshot سفارش** — نام و قیمت محصول هنگام خرید در `order_items` کپی می‌شود تا تغییرات بعدی محصول سفارش را خراب نکند.
4. **Race condition کوپن** — increment با `WHERE usageCount < usageLimit` اتمیک انجام می‌شود.
5. **احراز هویت** — فقط OTP (بدون رمز عبور برای مشتریان). ادمین با `ADMIN_TOKEN` در env احراز می‌شود.
