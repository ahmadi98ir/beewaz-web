import type { MetadataRoute } from 'next'

// PWA manifest — امکان «افزودن به صفحهٔ اصلی» و نصب اپ روی موبایل
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'بیواز — سیستم دزدگیر اماکن و منزل',
    short_name: 'بیواز',
    description:
      'خرید آنلاین سیستم دزدگیر، حسگر، سیرن و تجهیزات امنیتی اماکن تجاری و مسکونی. ارسال سریع و گارانتی اصل.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#1B3A8A',
    dir: 'rtl',
    lang: 'fa-IR',
    orientation: 'portrait',
    categories: ['shopping', 'business'],
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}
