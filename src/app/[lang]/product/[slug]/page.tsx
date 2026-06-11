import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { eq, and, isNull } from 'drizzle-orm'
import { db } from '@/lib/db'
import {
  products,
  productImages,
  productSpecs,
  productVariants,
} from '@/lib/db/schema/products'
import { categories } from '@/lib/db/schema/categories'
import { isValidLocale, getDictionary } from '@/lib/i18n'
import type { Locale } from '@/lib/i18n'
import { ProductClient } from './product-client'
import type { ProductData } from './product-client'

// ─── Static Params ────────────────────────────────────────────────────────────

export async function generateStaticParams() {
  return []
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>
}): Promise<Metadata> {
  const { lang, slug } = await params
  if (!isValidLocale(lang)) return {}

  const row = await db
    .select({ nameFa: products.nameFa, metaTitle: products.metaTitle, metaDesc: products.metaDesc })
    .from(products)
    .where(and(eq(products.slug, slug), eq(products.status, 'active'), isNull(products.deletedAt)))
    .limit(1)
    .then((r) => r[0] ?? null)

  if (!row) return {}

  const title = row.metaTitle ?? row.nameFa
  const description = row.metaDesc ?? undefined

  return {
    title,
    description,
    openGraph: { title, description, locale: lang },
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ProductPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>
}) {
  const { lang, slug } = await params
  if (!isValidLocale(lang)) notFound()

  const dict = await getDictionary(lang as Locale)

  // ── DB query ──────────────────────────────────────────────────────────────
  const productRow = await db
    .select({
      id:            products.id,
      slug:          products.slug,
      sku:           products.sku,
      nameFa:        products.nameFa,
      descriptionFa: products.descriptionFa,
      price:         products.price,
      comparePrice:  products.comparePrice,
      stock:         products.stock,
      categoryId:    products.categoryId,
      categoryName:  categories.nameFa,
      categorySlug:  categories.slug,
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(and(eq(products.slug, slug), eq(products.status, 'active'), isNull(products.deletedAt)))
    .limit(1)
    .then((r) => r[0] ?? null)

  if (!productRow) notFound()

  const [images, specs, variants] = await Promise.all([
    db
      .select({ url: productImages.url, alt: productImages.alt, isPrimary: productImages.isPrimary })
      .from(productImages)
      .where(eq(productImages.productId, productRow.id))
      .orderBy(productImages.sortOrder),

    db
      .select({ keyFa: productSpecs.keyFa, valueFa: productSpecs.valueFa })
      .from(productSpecs)
      .where(eq(productSpecs.productId, productRow.id))
      .orderBy(productSpecs.sortOrder),

    db
      .select({
        id:    productVariants.id,
        name:  productVariants.name,
        price: productVariants.price,
        stock: productVariants.stock,
      })
      .from(productVariants)
      .where(eq(productVariants.productId, productRow.id)),
  ])

  const product: ProductData = {
    id:            productRow.id,
    slug:          productRow.slug,
    sku:           productRow.sku,
    nameFa:        productRow.nameFa,
    descriptionFa: productRow.descriptionFa,
    price:         productRow.price,
    comparePrice:  productRow.comparePrice,
    stock:         productRow.stock,
    categoryName:  productRow.categoryName ?? null,
    categorySlug:  productRow.categorySlug ?? null,
    images,
    specs,
    variants: variants.map((v) => ({
      ...v,
      price: v.price !== null ? Number(v.price) : null,
    })),
  }

  return <ProductClient product={product} dict={dict} />
}
