import type { Metadata, Viewport } from 'next'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { ChatWidget } from '@/components/chat/chat-widget'
import { ToastContainer } from '@/components/ui/toast'
import { PageTransition } from '@/components/ui/page-transition'
import { QuickViewModal } from '@/components/shop/quick-view-modal'
import './globals.css'

export const metadata: Metadata = {
  title: {
    template: '%s | بیواز',
    default: 'بیواز — سیستم دزدگیر اماکن و منزل',
  },
  description:
    'خرید آنلاین سیستم دزدگیر، حسگر، سیرن و تجهیزات امنیتی اماکن تجاری و مسکونی. ارسال سریع، گارانتی اصل و پشتیبانی ۲۴ ساعته.',
  keywords: ['دزدگیر', 'سیستم امنیتی', 'حسگر حرکتی', 'سیرن', 'دوربین مداربسته'],
  authors: [{ name: 'بیواز' }],
  creator: 'بیواز',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'fa_IR',
    siteName: 'بیواز',
  },
  twitter: { card: 'summary_large_image' },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
}

export const viewport: Viewport = {
  themeColor: '#e61010',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fa" dir="rtl">
      <body className="min-h-screen flex flex-col bg-surface-50 antialiased">
        <Header />
        <main className="flex-1" id="main-content">
          <PageTransition>{children}</PageTransition>
        </main>
        <Footer />
        <ChatWidget />
        <QuickViewModal />
        <ToastContainer />
      </body>
    </html>
  )
}
