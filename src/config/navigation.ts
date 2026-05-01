export type NavChild = {
  label: string
  href: string
  description?: string
}

export type NavItem = {
  label: string
  href: string
  children?: NavChild[]
}

export const navigation: NavItem[] = [
  {
    label: 'فروشگاه',
    href: '/shop',
    children: [
      {
        label: 'حسگرها',
        href: '/shop/sensors',
        description: 'حسگر حرکتی، مغناطیسی، شکست شیشه',
      },
      {
        label: 'دزدگیر مرکزی',
        href: '/shop/central-alarm',
        description: 'پنل‌های اصلی و دستگاه‌های مرکزی',
      },
      {
        label: 'سیرن و آژیر',
        href: '/shop/sirens',
        description: 'سیرن داخلی، خارجی و پیزو',
      },
      {
        label: 'تجهیزات کنترل',
        href: '/shop/control',
        description: 'ریموت، کی‌پد و برد رله',
      },
      {
        label: 'تقویت‌کننده',
        href: '/shop/boosters',
        description: 'آنتن و تقویت‌کننده سیگنال',
      },
      {
        label: 'لوازم جانبی',
        href: '/shop/accessories',
        description: 'کابل، منبع تغذیه و باتری',
      },
    ],
  },
  {
    label: 'پایگاه دانش',
    href: '/knowledge-base',
    children: [
      {
        label: 'راهنمای نصب',
        href: '/knowledge-base/installation',
        description: 'آموزش گام‌به‌گام نصب و راه‌اندازی',
      },
      {
        label: 'انتخاب محصول',
        href: '/knowledge-base/selection',
        description: 'کدام دزدگیر برای شما مناسب است؟',
      },
      {
        label: 'عیب‌یابی',
        href: '/knowledge-base/troubleshooting',
        description: 'رفع مشکلات رایج دستگاه‌ها',
      },
    ],
  },
  { label: 'درباره ما', href: '/about' },
  { label: 'تماس با ما', href: '/contact' },
]

export const footerLinks = {
  shop: [
    { label: 'همه محصولات', href: '/shop' },
    { label: 'دزدگیر مرکزی', href: '/shop/central-alarm' },
    { label: 'حسگرها', href: '/shop/sensors' },
    { label: 'سیرن و آژیر', href: '/shop/sirens' },
    { label: 'تجهیزات کنترل', href: '/shop/control' },
  ],
  knowledge: [
    { label: 'پایگاه دانش', href: '/knowledge-base' },
    { label: 'راهنمای نصب', href: '/knowledge-base/installation' },
    { label: 'انتخاب محصول', href: '/knowledge-base/selection' },
    { label: 'عیب‌یابی', href: '/knowledge-base/troubleshooting' },
    { label: 'بلاگ', href: '/blog' },
  ],
  company: [
    { label: 'درباره بیواز', href: '/about' },
    { label: 'تماس با ما', href: '/contact' },
    { label: 'نمایندگی‌ها', href: '/dealers' },
    { label: 'گارانتی', href: '/warranty' },
    { label: 'حریم خصوصی', href: '/privacy' },
  ],
}
