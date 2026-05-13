import type { MetadataRoute } from 'next'
import { db } from '@/lib/db'
import { products, articles } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

const BASE = process.env.NEXTAUTH_URL ?? 'https://beewaz.ir'

export const revalidate = 86400

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE}/shop`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE}/blog`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE}/contact`, changeFrequency: 'monthly', priority: 0.5 },
  ]

  let productUrls: MetadataRoute.Sitemap = []
  let articleUrls: MetadataRoute.Sitemap = []

  try {
    const rows = await db.select({ slug: products.slug }).from(products).where(eq(products.status, 'active'))
    productUrls = rows.map((p) => ({ url: `${BASE}/shop/${p.slug}`, changeFrequency: 'weekly' as const, priority: 0.7 }))
  } catch { /* ignore */ }

  try {
    const rows = await db.select({ slug: articles.slug, publishedAt: articles.publishedAt }).from(articles).where(eq(articles.status, 'published'))
    articleUrls = rows.map((a) => ({ url: `${BASE}/blog/${a.slug}`, changeFrequency: 'monthly' as const, priority: 0.6, lastModified: a.publishedAt ?? undefined }))
  } catch { /* ignore */ }

  return [...staticPages, ...productUrls, ...articleUrls]
}