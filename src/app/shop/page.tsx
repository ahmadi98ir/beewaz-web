import type { Metadata } from 'next'
import { ShopClient } from './shop-client'

export const metadata: Metadata = {
  title: 'فروشگاه',
  description: 'خرید آنلاین سیستم دزدگیر، حسگر، سیرن و تجهیزات امنیتی. بیش از ۸۰ محصول اصل با گارانتی رسمی.',
}

export default function ShopPage() {
  return <ShopClient />
}
