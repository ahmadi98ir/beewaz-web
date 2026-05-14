import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { products, productImages } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const sku = searchParams.get('sku') ?? 'BH10'

  const [product] = await db
    .select({ id: products.id, sku: products.sku, slug: products.slug })
    .from(products)
    .where(eq(products.sku, sku))
    .limit(1)

  if (!product) return NextResponse.json({ error: 'product not found', sku })

  const imgs = await db
    .select()
    .from(productImages)
    .where(eq(productImages.productId, product.id))

  return NextResponse.json({ product, images: imgs })
}