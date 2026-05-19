// build: cinema-v2
/**
 * صفحه اصلی — Phase 1.2+ Cinematic
 */

import { getCmsContent } from '@/lib/cms'
import { Hero } from '@/components/home/hero'
import { StatsSection } from '@/components/home/stats-section'
import { WhyBeewaz } from '@/components/home/why-beewaz'
import { FeaturedCategories } from '@/components/home/featured-categories'
import { FeaturedProducts } from '@/components/home/featured-products'
import { HowItWorks } from '@/components/home/how-it-works'
import { Testimonials } from '@/components/home/testimonials'
import { CtaSection } from '@/components/home/cta-section'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: '\u0628\u06cc\u0648\u0627\u0632 \u2014 \u0633\u06cc\u0633\u062a\u0645 \u062f\u0632\u062f\u06af\u06cc\u0631 \u0627\u0645\u0627\u06a9\u0646 \u0648 \u0645\u0646\u0632\u0644',
  description: '\u062e\u0631\u06cc\u062f \u0622\u0646\u0644\u0627\u06cc\u0646 \u0633\u06cc\u0633\u062a\u0645 \u062f\u0632\u062f\u06af\u06cc\u0631\u060c \u062d\u0633\u06af\u0631\u060c \u0633\u06cc\u0631\u0646 \u0648 \u062a\u062c\u0647\u06cc\u0632\u0627\u062a \u0627\u0645\u0646\u06cc\u062a\u06cc. \u0646\u0635\u0628 \u0631\u0627\u06cc\u06af\u0627\u0646\u060c \u06af\u0627\u0631\u0627\u0646\u062a\u06cc \u0627\u0635\u0644 \u0648 \u067e\u0634\u062a\u06cc\u0628\u0627\u0646\u06cc \u06f2\u06f4 \u0633\u0627\u0639\u062a\u0647.',
}

export default async function HomePage() {
  const cms = await getCmsContent('home')
  return (
    <>
      <Hero cms={cms} />
      <StatsSection />
      <WhyBeewaz />
      <FeaturedCategories />
      <FeaturedProducts />
      <HowItWorks cms={cms} />
      <Testimonials />
      <CtaSection cms={cms} />
    </>
  )
}
