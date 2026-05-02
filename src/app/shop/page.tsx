import type { Metadata } from 'next'
import { ShopClient } from './shop-client'

export const metadata: Metadata = {
  title: 'فروشگاه',
  description: 'خرید آنلاین سیستم دزدگیر، حسگر، سیرن و تجهیزات امنیتی. بیش از ۸۰ محصول اصل با گارانتی رسمی.',
}

type Props = {
  searchParams: Promise<{ q?: string; category?: string }>
}

export default async function ShopPage({ searchParams }: Props) {
  const { q, category } = await searchParams
  return <ShopClient initialQuery={q} initialCategory={category} />
}
