# فاز ۱ — طراحی نقش‌های Data-Driven (راه B)

## مشکل فعلی (چرا راه B لازم است)

سیستم نقش‌ها الان **پراکنده و متناقض** است:

1. **دو تعریف enum متفاوت:**
   - `enums.ts`: `[customer, admin, support, sales, editor, dealer]`
   - `users.ts`: `[customer, admin, sales_agent]` ← این یکی واقعاً استفاده می‌شود
2. **کل کد از `sales_agent` استفاده می‌کند** ولی enum دیتابیس production احتمالاً `sales` دارد
3. **نقش‌ها در ۵+ جای کد hardcode شده‌اند**
4. enum پستگرس برای داده‌ای که مدام تغییر می‌کند ضدالگو است

## راه‌حل: ستون varchar + جدول roles

### تغییرات schema

**۱. جدول جدید `roles`:**
```sql
CREATE TABLE roles (
  name        varchar(30) PRIMARY KEY,   -- 'admin', 'warehouse', ...
  label_fa    varchar(60) NOT NULL,      -- 'مدیر کل', 'انباردار'
  color       varchar(40),               -- کلاس Tailwind برای نمایش
  is_system   boolean NOT NULL DEFAULT false, -- admin قابل حذف نیست
  sort_order  integer NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now()
);
```

**۲. تبدیل `users.role` از enum به varchar:**
```sql
ALTER TABLE users ALTER COLUMN role TYPE varchar(30) USING role::text;
ALTER TABLE users ALTER COLUMN role SET DEFAULT 'customer';
-- enum قدیمی user_role بعداً (بعد از اطمینان) DROP می‌شود
```

**۳. seed نقش‌های پایه + دو نقش جدید:**
```sql
INSERT INTO roles (name, label_fa, color, is_system, sort_order) VALUES
  ('customer',    'مشتری',        'bg-surface-100 text-surface-700', true,  0),
  ('admin',       'مدیر کل',      'bg-red-100 text-red-700',        true,  10),
  ('sales_agent', 'کارشناس فروش', 'bg-blue-100 text-blue-700',      false, 20),
  ('warehouse',   'انباردار',     'bg-amber-100 text-amber-700',    false, 30),
  ('installer',   'نصاب',         'bg-green-100 text-green-700',    false, 40)
ON CONFLICT (name) DO NOTHING;
```

**۴. permission keys جدید برای نصب:**
```sql
INSERT INTO permissions (key, label, group_name, sort_order) VALUES
  ('inventory:manage',   'مدیریت موجودی انبار', 'انبار', 10),
  ('installation:read',  'مشاهده سفارش‌های نصب', 'نصب',  10),
  ('installation:write', 'ثبت گزارش نصب',        'نصب',  20)
ON CONFLICT (key) DO NOTHING;
```

**۵. مجوزهای پیش‌فرض نقش‌های جدید:**
```sql
-- انباردار
INSERT INTO role_permissions (role, permission) VALUES
  ('warehouse', 'dashboard:view'),
  ('warehouse', 'orders:read'),
  ('warehouse', 'orders:write'),
  ('warehouse', 'products:read'),
  ('warehouse', 'inventory:manage')
ON CONFLICT DO NOTHING;
-- نصاب
INSERT INTO role_permissions (role, permission) VALUES
  ('installer', 'dashboard:view'),
  ('installer', 'orders:read'),
  ('installer', 'installation:read'),
  ('installer', 'installation:write')
ON CONFLICT DO NOTHING;
```

### تغییرات کد

- `src/lib/db/schema/rbac.ts` — افزودن جدول `roles`
- `src/lib/db/schema/users.ts` — `role` از `userRoleEnum` به `varchar`
- `src/lib/db/schema/enums.ts` — حذف `userRoleEnum` متناقض
- `src/instrumentation.ts` — افزودن safety-net برای جدول roles و نقش‌های جدید
- `src/app/admin/roles/page.tsx` — خواندن لیست نقش‌ها از API (نه hardcode)
- `src/app/admin/users/page.tsx` — کشوی نقش از API
- `src/app/api/admin/roles/*` — endpoint برای CRUD نقش‌ها
- `src/app/api/admin/role-permissions/route.ts` — حذف whitelist hardcode
- `src/app/api/admin/my-permissions/route.ts` — حذف whitelist hardcode
- `src/proxy.ts` — به‌جای چک `=== 'admin' || 'sales_agent'`، چک «نقش غیر customer»

### ایمنی migration (مهم برای production)
- تبدیل enum→varchar **غیرتخریبی** است (داده‌ها حفظ می‌شوند)
- همه با `IF NOT EXISTS` / `ON CONFLICT` → idempotent
- safety-net در `instrumentation.ts` تضمین می‌کند حتی اگر migration tracker خطا کند، جداول ساخته شوند
- اتصال DB داخلی است (`@db:5432`) → بدون وابستگی به اینترنت ایران
