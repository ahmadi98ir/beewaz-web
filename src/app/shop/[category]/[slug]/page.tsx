import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { db } from '@/lib/db'
import { products, categories, productSpecs, productImages } from '@/lib/db/schema'
import { eq, and, ne } from 'drizzle-orm'
import { dbProductToShop } from '@/lib/shop-product'
import { ProductDetailClient } from './product-detail-client'

export const dynamic = 'force-dynamic'

type Props = {
  params: Promise<{ category: string; slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  try {
    const [product] = await db
      .select({ nameFa: products.nameFa, descriptionFa: products.descriptionFa })
      .from(products)
      .where(and(eq(products.slug, slug), eq(products.status, 'active')))
      .limit(1)

    if (!product) return { title: 'محصول یافت نشد' }
    return { title: product.nameFa, description: product.descriptionFa ?? undefined }
  } catch {
    return { title: 'بیواز' }
  }
}

export default async function ProductPage({ params }: Props) {
  const { slug, category: categorySlug } = await params

  try {
    // محصول اصلی
    const [productRow] = await db
      .select({
        id: products.id,
        slug: products.slug,
        sku: products.sku,
        nameFa: products.nameFa,
        descriptionFa: products.descriptionFa,
        price: products.price,
        comparePrice: products.comparePrice,
        stock: products.stock,
        isFeatured: products.isFeatured,
        createdAt: products.createdAt,
        categoryId: products.categoryId,
        categorySlug: categories.slug,
        categoryName: categories.nameFa,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(and(eq(products.slug, slug), eq(products.status, 'active')))
      .limit(1)

    if (!productRow) notFound()

    // مشخصات فنی و تصاویر
    const [specs, imgs] = await Promise.all([
      db
        .select({ keyFa: productSpecs.keyFa, valueFa: productSpecs.valueFa })
        .from(productSpecs)
        .where(eq(productSpecs.productId, productRow.id))
        .orderBy(productSpecs.sortOrder),
      db
        .select({ url: productImages.url, alt: productImages.alt })
        .from(productImages)
        .where(eq(productImages.productId, productRow.id))
        .orderBy(productImages.sortOrder),
    ])

    const product = dbProductToShop({
      ...productRow,
      category: productRow.categorySlug
        ? { slug: productRow.categorySlug, nameFa: productRow.categoryName ?? '' }
        : null,
      specs,
      images: imgs,
    })

    // محصولات مشابه از همان دسته
    let related: import('@/lib/shop-product').ShopProduct[] = []
    if (productRow.categoryId) {
      const relatedRows = await db
        .select({
          id: products.id,
          slug: products.slug,
          sku: products.sku,
          nameFa: products.nameFa,
          descriptionFa: products.descriptionFa,
          price: products.price,
          comparePrice: products.comparePrice,
          stock: products.stock,
          isFeatured: products.isFeatured,
          createdAt: products.createdAt,
          categorySlug: categories.slug,
          categoryName: categories.nameFa,
        })
        .from(products)
        .leftJoin(categories, eq(products.categoryId, categories.id))
        .where(
          and(
            eq(products.categoryId, productRow.categoryId),
            eq(products.status, 'active'),
            ne(products.id, productRow.id),
          ),
        )
        .limit(4)

      related = relatedRows.map((r) =>
        dbProductToShop({
          ...r,
          category: r.categorySlug ? { slug: r.categorySlug, nameFa: r.categoryName ?? '' } : null,
        }),
      )
    }

    return <ProductDetailClient product={product} related={related} />
  } catch {
    notFound()
  }
}
