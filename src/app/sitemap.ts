import { MetadataRoute } from 'next'
import { db } from '@/lib/db'
import { products, articles, categories } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? 'https://bz360.ir'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE,               lastModified: new Date(), changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${BASE}/shop`,     lastModified: new Date(), changeFrequency: 'daily',   priority: 0.9 },
    { url: `${BASE}/about`,    lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/contact`,  lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/blog`,     lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.8 },
  ]

  // محصولات فعال با slug دسته‌بندی
  let productPages: MetadataRoute.Sitemap = []
  try {
    const rows = await db
      .select({
        slug: products.slug,
        updatedAt: products.updatedAt,
        categorySlug: categories.slug,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(eq(products.status, 'active'))

    productPages = rows.map((p) => ({
      url: p.categorySlug
        ? `${BASE}/shop/${p.categorySlug}/${p.slug}`
        : `${BASE}/shop/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.85,
    }))
  } catch { /* DB آماده نیست */ }

  // مقالات منتشرشده
  let articlePages: MetadataRoute.Sitemap = []
  try {
    const published = await db
      .select({ slug: articles.slug, updatedAt: articles.updatedAt })
      .from(articles)
      .where(eq(articles.status, 'published'))

    articlePages = published.map((a) => ({
      url: `${BASE}/blog/${a.slug}`,
      lastModified: a.updatedAt,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }))
  } catch { /* DB آماده نیست */ }

  return [...staticPages, ...productPages, ...articlePages]
}
