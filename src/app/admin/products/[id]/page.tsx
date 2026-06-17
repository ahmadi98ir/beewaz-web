import { notFound } from 'next/navigation'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { products } from '@/lib/db/schema/products'
import { ProductForm } from '../product-form'

export const metadata = { title: 'ویرایش محصول' }

export default async function ProductEditPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [product] = await db
    .select({
      id:           products.id,
      categoryId:   products.categoryId,
      sku:          products.sku,
      nameFa:       products.nameFa,
      slug:         products.slug,
      descriptionFa: products.descriptionFa,
      price:        products.price,
      comparePrice: products.comparePrice,
      salePrice:    products.salePrice,
      salePriceFrom: products.salePriceFrom,
      salePriceTo:  products.salePriceTo,
      stock:        products.stock,
      warrantyDays: products.warrantyDays,
      status:       products.status,
      isFeatured:   products.isFeatured,
      metaTitle:    products.metaTitle,
      metaDesc:     products.metaDesc,
      relatedProductIds: products.relatedProductIds,
    })
    .from(products)
    .where(eq(products.id, id))
    .limit(1)

  if (!product) notFound()

  const initial = {
    id:           product.id,
    categoryId:   product.categoryId ?? null,
    sku:          product.sku,
    nameFa:       product.nameFa,
    slug:         product.slug,
    descriptionFa: product.descriptionFa ?? '',
    // DB stores Rial; form works in Toman → divide by 10
    price:        Math.floor(product.price / 10),
    comparePrice: product.comparePrice ? Math.floor(product.comparePrice / 10) : null,
    salePrice:    product.salePrice ? Math.floor(product.salePrice / 10) : null,
    salePriceFrom: product.salePriceFrom ? new Date(product.salePriceFrom).toISOString() : null,
    salePriceTo:  product.salePriceTo ? new Date(product.salePriceTo).toISOString() : null,
    stock:        product.stock,
    warrantyDays: product.warrantyDays,
    status:       product.status as 'draft' | 'active' | 'archived' | 'out_of_stock',
    isFeatured:   product.isFeatured,
    metaTitle:    product.metaTitle ?? '',
    metaDesc:     product.metaDesc ?? '',
    relatedProductIds: (product.relatedProductIds as string[]) ?? [],
  }

  return <ProductForm mode="edit" initial={initial} />
}
