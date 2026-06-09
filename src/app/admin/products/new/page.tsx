import Link from 'next/link'
import { ProductFormV2 } from '../_components/product-form-v2'

export const metadata = { title: 'محصول جدید' }

export default function NewProductPage() {
  return (
    <div className="min-h-full bg-[#070711]">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-[#070711]/80 backdrop-blur-xl border-b border-white/[0.06] px-6 py-4 flex items-center gap-4">
        <Link
          href="/admin/products"
          className="w-8 h-8 rounded-lg bg-white/[0.06] hover:bg-white/[0.10] flex items-center justify-center text-white/60 hover:text-white transition-all"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
          </svg>
        </Link>
        <div>
          <h1 className="text-white font-bold text-base">محصول جدید</h1>
          <p className="text-white/40 text-xs">افزودن محصول به فروشگاه</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">
        <ProductFormV2 />
      </div>
    </div>
  )
}
