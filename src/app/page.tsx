import { Hero } from '@/components/home/hero'
import { FeaturedCategories } from '@/components/home/featured-categories'
import { FeaturedProducts } from '@/components/home/featured-products'
import { HowItWorks } from '@/components/home/how-it-works'
import { CtaSection } from '@/components/home/cta-section'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'بیواز — سیستم دزدگیر اماکن و منزل',
  description:
    'خرید آنلاین سیستم دزدگیر حرفه‌ای برای خانه و کسب‌وکار. مشاوره رایگان، نصب تخصصی و گارانتی ۱۸ ماهه.',
}

export default function HomePage() {
  return (
    <>
      <Hero />
      <FeaturedCategories />
      <FeaturedProducts />
      <HowItWorks />
      <CtaSection />
    </>
  )
}
