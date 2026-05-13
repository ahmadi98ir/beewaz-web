'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { ProductForm, type ProductFormData } from '../product-form'

export default function EditProductPage() {
  const params = useParams<{ id: string }>()
  const [product, setProduct] = useState<ProductFormData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!params.id) return
    fetch(`/api/admin/products/${params.id}`)
      .then(async (r) => {
        const data = await r.json()
        if (!r.ok) {
          setError(data.error || 'خطا در بارگیری')
          return
        }
        setProduct(data.product)
      })
      .catch(() => setError('خطای شبکه'))
  }, [params.id])

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <p className="text-red-600 text-sm">{error}</p>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <p className="text-surface-400 text-sm">در حال بارگیری...</p>
      </div>
    )
  }

  return <ProductForm mode="edit" initial={product} />
}
