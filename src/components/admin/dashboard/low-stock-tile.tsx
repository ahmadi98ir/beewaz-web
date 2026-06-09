import Link from 'next/link'
import { BentoCard } from './bento-card'

interface LowStockTileProps {
  products: { id: string; nameFa: string; stock: number; threshold: number }[]
}

export function LowStockTile({ products }: LowStockTileProps) {
  const critical = products.filter((p) => p.stock === 0)
  const warning  = products.filter((p) => p.stock > 0 && p.stock <= 5)

  return (
    <BentoCard className="p-5 flex flex-col" glowColor="rgba(239,68,68,0.08)">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-red-500/15 flex items-center justify-center">
            <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
            </svg>
          </div>
          <div>
            <p className="text-white text-sm font-bold">هشدار موجودی</p>
            {products.length > 0 && (
              <p className="text-red-400 text-[10px] font-medium">
                {products.length.toLocaleString('fa-IR')} محصول نیاز به بررسی دارد
              </p>
            )}
          </div>
        </div>
        <Link href="/admin/inventory" className="text-[11px] text-white/40 hover:text-white/70 transition-colors">
          مشاهده همه ←
        </Link>
      </div>

      {/* List */}
      <div className="flex-1 space-y-2 overflow-hidden">
        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-500/15 flex items-center justify-center">
              <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-white/30 text-xs">همه محصولات موجود هستند</p>
          </div>
        ) : (
          [...critical, ...warning].slice(0, 5).map((p) => {
            const isCritical = p.stock === 0
            return (
              <Link
                key={p.id}
                href={`/admin/products/${p.id}`}
                className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] transition-colors group"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isCritical ? 'bg-red-400 animate-pulse' : 'bg-amber-400'}`} />
                  <span className="text-white/70 text-xs truncate group-hover:text-white transition-colors">
                    {p.nameFa}
                  </span>
                </div>
                <span
                  className={`text-xs font-bold flex-shrink-0 px-2 py-0.5 rounded-lg border ${
                    isCritical
                      ? 'text-red-400 bg-red-400/10 border-red-400/20'
                      : 'text-amber-400 bg-amber-400/10 border-amber-400/20'
                  }`}
                >
                  {isCritical ? 'ناموجود' : p.stock.toLocaleString('fa-IR')}
                </span>
              </Link>
            )
          })
        )}
      </div>
    </BentoCard>
  )
}
