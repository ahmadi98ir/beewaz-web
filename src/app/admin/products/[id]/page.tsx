'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { ProductForm } from '../product-form'
import type { ProductFormData } from '../product-form'

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [initial, setInitial] = useState<Partial<ProductFormData> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/admin/products/${id}`)
      .then(async (res) => {
        if (!res.ok) { setError('خطا در بارگذاری محصول'); return }
        const j = await res.json() as {
          product: {
            id: string; nameFa: string; slug: string; sku: string | null
            descriptionFa: string | null; price: number | null
            comparePrice: number | null; stock: number; status: string
            isFeatured: boolean; categoryId: string | null
            metaTitle: string | null; metaDesc: string | null
          }
        }
        const p = j.product
        setInitial({
          id:            p.id,
          nameFa:        p.nameFa,
          slug:          p.slug,
          sku:           p.sku ?? '',
          descriptionFa: p.descriptionFa ?? '',
          price:         Number(p.price ?? 0),
          comparePrice:  p.comparePrice ? Number(p.comparePrice) : null,
          stock:         p.stock ?? 0,
          status:        (p.status as ProductFormData['status']) ?? 'draft',
          isFeatured:    p.isFeatured ?? false,
          categoryId:    p.categoryId ?? null,
          metaTitle:     p.metaTitle ?? '',
          metaDesc:      p.metaDesc ?? '',
        })
      })
      .catch(() => setError('خطا در ارتباط با سرور'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div className="flex-1 flex items-center justify-center text-surface-400">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-500 rounded-full animate-spin mx-auto mb-3" />
        <p>بارگذاری محصول...</p>
      </div>
    </div>
  )

  if (error || !initial) return (
    <div className="flex-1 flex items-center justify-center text-red-500">
      <p>{error ?? 'محصول یافت نشد'}</p>
    </div>
  )

  return <ProductForm mode="edit" initial={initial} />
}
