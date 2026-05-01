import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { mockProducts, mockCategories } from '@/lib/mock-data'
import { ProductDetailClient } from './product-detail-client'

type Props = {
  params: Promise<{ category: string; slug: string }>
}

// تولید متادیتا پویا
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const product = mockProducts.find((p) => p.slug === slug)
  if (!product) return { title: 'محصول یافت نشد' }

  return {
    title: product.nameFa,
    description: product.descriptionFa,
  }
}

// ISR: صفحات محصول را در build time تولید کن
export function generateStaticParams() {
  return mockProducts.map((p) => ({
    category: p.categorySlug,
    slug: p.slug,
  }))
}

export default async function ProductPage({ params }: Props) {
  const { slug, category } = await params
  const product = mockProducts.find((p) => p.slug === slug && p.categorySlug === category)

  if (!product) notFound()

  const related = mockProducts
    .filter((p) => p.categorySlug === product.categorySlug && p.id !== product.id)
    .slice(0, 4)

  const categoryInfo = mockCategories.find((c) => c.slug === product.categorySlug)

  return <ProductDetailClient product={product} related={related} categoryInfo={categoryInfo} />
}
