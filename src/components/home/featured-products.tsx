import Link from 'next/link'
import { AnimateIn } from '@/components/ui/animate-in'
import { ProductCard } from '@/components/shop/product-card'
import { featuredProducts } from '@/lib/mock-data'
import { ArrowLeftIcon } from '@/components/ui/icons'

export function FeaturedProducts() {
  return (
    <section className="py-16 lg:py-24" aria-label="محصولات ویژه">
      <div className="container-main">

        {/* Header */}
        <AnimateIn>
          <div className="flex items-end justify-between mb-10 gap-4 flex-wrap">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-50 border border-brand-100 text-brand-700 text-sm font-semibold mb-3">
                محصولات پرفروش
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-surface-900">
                محصولات ویژه بیواز
              </h2>
            </div>

            <Link
              href="/shop"
              className="inline-flex items-center gap-2 text-sm font-semibold text-brand-600 hover:text-brand-700 transition-colors group"
            >
              مشاهده همه
              <ArrowLeftIcon size={16} className="transition-transform group-hover:-translate-x-1" />
            </Link>
          </div>
        </AnimateIn>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {featuredProducts.map((product, i) => (
            <AnimateIn key={product.id} delay={i * 80}>
              <ProductCard product={product} />
            </AnimateIn>
          ))}
        </div>

      </div>
    </section>
  )
}
