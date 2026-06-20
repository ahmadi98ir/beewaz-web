import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { pages } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { requireAdmin } from '@/lib/admin-auth'
import { BlockRenderer } from '@/components/blocks/block-renderer'

export const dynamic = 'force-dynamic'

export default async function PagePreview({ params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin()
  if (!auth.ok) notFound()

  const { id } = await params
  const [page] = await db.select().from(pages).where(eq(pages.id, id)).limit(1)
  if (!page) notFound()

  return (
    <div>
      <div className="bg-amber-50 border-b border-amber-200 text-amber-800 text-sm text-center py-2 sticky top-0 z-50">
        پیش‌نمایش — وضعیت: {page.status === 'published' ? 'منتشرشده' : 'پیش‌نویس'} (این نوار در نسخه عمومی نمایش داده نمی‌شود)
      </div>
      <main>
        <BlockRenderer blocks={page.blocks} />
      </main>
    </div>
  )
}
