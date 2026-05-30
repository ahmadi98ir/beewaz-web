-- Permissions: all possible actions in the system
CREATE TABLE IF NOT EXISTS permissions (
  key         varchar(80) PRIMARY KEY,
  label       varchar(120) NOT NULL,
  group_name  varchar(60)  NOT NULL,
  sort_order  integer      NOT NULL DEFAULT 0
);

-- Role-permission assignments (editable at runtime)
CREATE TABLE IF NOT EXISTS role_permissions (
  role        varchar(30) NOT NULL,
  permission  varchar(80) NOT NULL REFERENCES permissions(key) ON DELETE CASCADE,
  PRIMARY KEY (role, permission)
);

-- Seed all permissions
INSERT INTO permissions (key, label, group_name, sort_order) VALUES
  -- Dashboard
  ('dashboard:view',       'مشاهده داشبورد',            'داشبورد', 10),
  ('analytics:view',       'مشاهده آمار و بازدید',       'داشبورد', 20),
  ('reports:view',         'مشاهده گزارش فروش',          'داشبورد', 30),
  -- Orders
  ('orders:read',          'مشاهده سفارشات',             'سفارشات', 10),
  ('orders:write',         'ویرایش و مدیریت سفارشات',    'سفارشات', 20),
  -- Products
  ('products:read',        'مشاهده محصولات',             'محصولات', 10),
  ('products:write',       'افزودن و ویرایش محصولات',    'محصولات', 20),
  ('products:delete',      'حذف محصولات',                'محصولات', 30),
  ('categories:write',     'مدیریت دسته‌بندی‌ها',        'محصولات', 40),
  -- Reviews
  ('reviews:manage',       'مدیریت نظرات',               'محصولات', 50),
  -- CRM
  ('leads:read',           'مشاهده لیدها',               'CRM',     10),
  ('leads:write',          'ویرایش و مدیریت لیدها',      'CRM',     20),
  ('users:read',           'مشاهده مشتریان',             'CRM',     30),
  ('users:write',          'ویرایش مشتریان',             'CRM',     40),
  ('users:role',           'تغییر نقش کاربران',          'CRM',     50),
  -- Content
  ('content:read',         'مشاهده محتوا',               'محتوا',   10),
  ('content:write',        'ویرایش محتوا و بنرها',       'محتوا',   20),
  ('articles:write',       'مدیریت مقالات',              'محتوا',   30),
  ('coupons:read',         'مشاهده کوپن‌ها',             'محتوا',   40),
  ('coupons:write',        'مدیریت کوپن‌ها',             'محتوا',   50),
  -- Settings
  ('settings:read',        'مشاهده تنظیمات',             'سیستم',   10),
  ('settings:write',       'ویرایش تنظیمات سایت',        'سیستم',   20),
  ('roles:manage',         'مدیریت نقش‌ها و دسترسی‌ها',  'سیستم',   30)
ON CONFLICT (key) DO NOTHING;

-- Default: admin has all permissions
INSERT INTO role_permissions (role, permission)
  SELECT 'admin', key FROM permissions
ON CONFLICT DO NOTHING;

-- Default: sales_agent permissions
INSERT INTO role_permissions (role, permission) VALUES
  ('sales_agent', 'dashboard:view'),
  ('sales_agent', 'orders:read'),
  ('sales_agent', 'orders:write'),
  ('sales_agent', 'leads:read'),
  ('sales_agent', 'leads:write'),
  ('sales_agent', 'products:read'),
  ('sales_agent', 'reviews:manage'),
  ('sales_agent', 'users:read')
ON CONFLICT DO NOTHING;
