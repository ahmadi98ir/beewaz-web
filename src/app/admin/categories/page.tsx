import type { Metadata } from 'next'
import Link              from 'next/link'
import { db }            from '@/lib/db'
import { categories }    from '@/lib/db/schema'
import { asc }           from 'drizzle-orm'
import { CategoriesClient } from './_components/categories-client'
import type { CatRow }   from './_components/categories-client'

export const metadata: Metadata = { title: 'دسته‌بندی‌ها' }

export default async function CategoriesPage() {
  const rows = await db
    .select()
    .from(categories)
    .orderBy(asc(categories.sortOrder), asc(categories.nameFa))

  const data: CatRow[] = rows.map((r) => ({
    id:        r.id,
    nameFa:    r.nameFa,
    slug:      r.slug,
    parentId:  r.parentId ?? null,
    icon:      r.icon ?? null,
    sortOrder: r.sortOrder,
  }))

  return (
    <div className="min-h-full bg-[#070711]">
      {/* ─── Header ──────────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-10 bg-[#070711]/90 backdrop-blur-md border-b border-white/[0.06]">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link
            href="/admin/dashboard"
            className="w-8 h-8 rounded-lg bg-white/[0.06] hover:bg-white/[0.10] flex items-center justify-center text-white/50 hover:text-white transition-all"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
            </svg>
          </Link>
          <div className="flex-1">
            <h1 className="text-white font-bold text-lg">دسته‌بندی‌ها</h1>
            <p className="text-white/30 text-xs">{data.length} دسته‌بندی — ساختار درختی برای محصولات</p>
          </div>
        </div>
      </div>

      {/* ─── Content ─────────────────────────────────────────────────────── */}
      <div className="max-w-3xl mx-auto px-6 py-6">
        <CategoriesClient initialRows={data} />
      </div>
    </div>
  )
}
