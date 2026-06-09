import type { Metadata } from 'next'
import Link from 'next/link'
import { db } from '@/lib/db'
import { productAttributeTypes, productAttributeValues } from '@/lib/db/schema'
import { asc } from 'drizzle-orm'
import { AttributesClient } from './_components/attributes-client'

export const metadata: Metadata = { title: 'ویژگی‌ها و متغیرها' }

export default async function AttributesPage() {
  // بارگذاری تمام ویژگی‌ها + مقادیر آن‌ها در یک کوئری بهینه
  const [types, values] = await Promise.all([
    db.select().from(productAttributeTypes).orderBy(asc(productAttributeTypes.sortOrder), asc(productAttributeTypes.createdAt)),
    db.select().from(productAttributeValues).orderBy(asc(productAttributeValues.sortOrder), asc(productAttributeValues.createdAt)),
  ])

  // ساخت ساختار nested
  const initial = types.map((t) => ({
    ...t,
    values: values.filter((v) => v.typeId === t.id),
  }))

  return (
    <div className="min-h-full bg-[#070711]">
      {/* ─── Header ──────────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-10 bg-[#070711]/90 backdrop-blur-md border-b border-white/[0.06]">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link
            href="/admin/products"
            className="w-8 h-8 rounded-lg bg-white/[0.06] hover:bg-white/[0.10] flex items-center justify-center text-white/50 hover:text-white transition-all"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
            </svg>
          </Link>
          <div>
            <h1 className="text-white font-bold text-lg">ویژگی‌ها و متغیرها</h1>
            <p className="text-white/30 text-xs">مدیریت رنگ، سایز و سایر ویژگی‌های محصولات</p>
          </div>
        </div>
      </div>

      {/* ─── Content ─────────────────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-6 py-6 space-y-5">
        {/* راهنما */}
        <div className="flex items-start gap-3 px-4 py-3.5 rounded-xl bg-indigo-500/[0.07] border border-indigo-500/20">
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
          </svg>
          <p className="text-indigo-200/70 text-xs leading-5">
            ابتدا ویژگی‌ها را تعریف کنید (مثلاً «رنگ» و «سایز»)، سپس روی هر ویژگی کلیک کنید تا مقادیر آن را اضافه کنید.
            این ویژگی‌ها در فرم افزودن محصول برای ساخت Variant استفاده می‌شوند.
          </p>
        </div>

        <AttributesClient initial={initial} />
      </div>
    </div>
  )
}
