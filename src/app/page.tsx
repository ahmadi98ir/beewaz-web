/**
 * صفحه اصلی — Phase 1.2+
 */

import { getCmsContent } from '@/lib/cms'
import { Hero } from '@/components/home/hero'
import { StatsSection } from '@/components/home/stats-section'
import { FeaturedCategories } from '@/components/home/featured-categories'
import { FeaturedProducts } from '@/components/home/featured-products'
import { HowItWorks } from '@/components/home/how-it-works'
import { CtaSection } from '@/components/home/cta-section'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'بیواز — سیستم دزدگیر اماکن و منزل',
  description: 'خرید آنلاین سیستم دزدگیر، حسگر، سیرن و تجهیزات امنیتی. ارسال سریع، گارانتی اصل و پشتیبانی ۲۴ ساعته.',
}

export default async function HomePage() {
  const cms = await getCmsContent('home')
  return (
    <>
      <Hero cms={cms} />
      <StatsSection />
      <FeaturedCategories />
      <FeaturedProducts />
      <HowItWorks cms={cms} />
      <CtaSection cms={cms} />
    </>
  )
}
