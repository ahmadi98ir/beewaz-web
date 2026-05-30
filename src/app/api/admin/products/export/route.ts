import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { products, categories } from '@/lib/db/schema'
import { requireAdmin } from '@/lib/admin-auth'
import { eq, isNull } from 'drizzle-orm'

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req)
  if (!auth.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const rows = await db
    .select({
      id: products.id,
      sku: products.sku,
      nameFa: products.nameFa,
      slug: products.slug,
      price: products.price,
      comparePrice: products.comparePrice,
      salePrice: products.salePrice,
      stock: products.stock,
      status: products.status,
      isFeatured: products.isFeatured,
      categoryName: categories.nameFa,
      createdAt: products.createdAt,
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(isNull(products.deletedAt))
    .orderBy(products.createdAt)

  const header = ['ID', 'SKU', 'نام', 'اسلاگ', 'قیمت (ریال)', 'قیمت مقایسه', 'قیمت حراج', 'موجودی', 'وضعیت', 'ویژه', 'دسته‌بندی', 'تاریخ ایجاد']
  const csvRows = rows.map((r) => [
    r.id,
    r.sku ?? '',
    `"${(r.nameFa ?? '').replace(/"/g, '""')}"`,
    r.slug ?? '',
    r.price ?? 0,
    r.comparePrice ?? '',
    r.salePrice ?? '',
    r.stock ?? 0,
    r.status ?? '',
    r.isFeatured ? 'بله' : 'خیر',
    `"${(r.categoryName ?? '').replace(/"/g, '""')}"`,
    r.createdAt ? new Date(r.createdAt).toISOString().split('T')[0] : '',
  ].join(','))

  const csv = [header.join(','), ...csvRows].join('\n')
  const bom = '﻿'

  return new NextResponse(bom + csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="products-${new Date().toISOString().split('T')[0]}.csv"`,
    },
  })
}
