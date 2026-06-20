import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { db } from '@/lib/db'
import { pages } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { BlockRenderer } from '@/components/blocks/block-renderer'

export const dynamic = 'force-dynamic'

async function getPage(slug: string) {
  const [page] = await db
    .select()
    .from(pages)
    .where(eq(pages.slug, slug))
    .limit(1)
  if (!page || page.status !== 'published') return null
  return page
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const page = await getPage(slug)
  if (!page) return {}
  return {
    title: page.metaTitle ?? page.titleFa,
    description: page.metaDesc ?? undefined,
    openGraph: page.ogImage ? { images: [page.ogImage] } : undefined,
  }
}

export default async function CmsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const page = await getPage(slug)
  if (!page) notFound()

  return (
    <main>
      <BlockRenderer blocks={page.blocks} />
    </main>
  )
}
