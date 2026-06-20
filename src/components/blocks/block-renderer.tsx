import Link from 'next/link'
import Image from 'next/image'
import type { Block } from '@/lib/db/schema'

function HeroBlock({ props }: { props: Record<string, unknown> }) {
  const p = props as { title?: string; subtitle?: string; ctaText?: string; ctaUrl?: string }
  return (
    <section className="bg-gradient-to-b from-brand-50 to-white py-16 px-6 text-center">
      {p.title && <h1 className="text-3xl sm:text-4xl font-black text-surface-900 mb-3">{p.title}</h1>}
      {p.subtitle && <p className="text-surface-600 max-w-xl mx-auto mb-6">{p.subtitle}</p>}
      {p.ctaText && p.ctaUrl && (
        <Link href={p.ctaUrl} className="btn btn-accent inline-flex">{p.ctaText}</Link>
      )}
    </section>
  )
}

function TextBlock({ props }: { props: Record<string, unknown> }) {
  const p = props as { content?: string }
  if (!p.content) return null
  return (
    <section className="py-8 px-6 max-w-3xl mx-auto">
      <div className="prose prose-surface max-w-none" dangerouslySetInnerHTML={{ __html: p.content }} />
    </section>
  )
}

function ImageBlock({ props }: { props: Record<string, unknown> }) {
  const p = props as { src?: string; alt?: string; caption?: string }
  if (!p.src) return null
  return (
    <figure className="py-8 px-6 max-w-3xl mx-auto">
      <Image src={p.src} alt={p.alt ?? ''} width={1200} height={675} className="w-full rounded-2xl object-cover" />
      {p.caption && <figcaption className="text-sm text-surface-400 text-center mt-2">{p.caption}</figcaption>}
    </figure>
  )
}

function GalleryBlock({ props }: { props: Record<string, unknown> }) {
  const p = props as { images?: { src: string; alt?: string }[] }
  const images = p.images ?? []
  if (images.length === 0) return null
  return (
    <section className="py-8 px-6 max-w-5xl mx-auto">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {images.map((img, i) => (
          <Image key={i} src={img.src} alt={img.alt ?? ''} width={400} height={400} className="w-full aspect-square rounded-xl object-cover" />
        ))}
      </div>
    </section>
  )
}

function CtaBlock({ props }: { props: Record<string, unknown> }) {
  const p = props as { title?: string; subtitle?: string; btnText?: string; btnUrl?: string }
  return (
    <section className="py-12 px-6 bg-brand-600 text-white text-center">
      {p.title && <h2 className="text-2xl font-black mb-2">{p.title}</h2>}
      {p.subtitle && <p className="text-brand-50 mb-5">{p.subtitle}</p>}
      {p.btnText && p.btnUrl && (
        <Link href={p.btnUrl} className="btn bg-white text-brand-700 inline-flex hover:bg-brand-50">{p.btnText}</Link>
      )}
    </section>
  )
}

function FaqBlock({ props }: { props: Record<string, unknown> }) {
  const p = props as { title?: string; items?: { q: string; a: string }[] }
  const items = p.items ?? []
  if (items.length === 0) return null
  return (
    <section className="py-10 px-6 max-w-3xl mx-auto">
      {p.title && <h2 className="text-xl font-black text-surface-900 mb-5">{p.title}</h2>}
      <div className="space-y-3">
        {items.map((item, i) => (
          <details key={i} className="bg-surface-50 rounded-xl p-4 group">
            <summary className="font-semibold text-surface-800 cursor-pointer">{item.q}</summary>
            <p className="text-surface-600 text-sm mt-2 leading-relaxed">{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  )
}

function FeaturesBlock({ props }: { props: Record<string, unknown> }) {
  const p = props as { title?: string; items?: { icon?: string; title: string; desc?: string }[] }
  const items = p.items ?? []
  if (items.length === 0) return null
  return (
    <section className="py-10 px-6 max-w-5xl mx-auto">
      {p.title && <h2 className="text-xl font-black text-surface-900 mb-6 text-center">{p.title}</h2>}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {items.map((item, i) => (
          <div key={i} className="bg-white border border-surface-200 rounded-2xl p-5 text-center">
            {item.icon && <div className="text-3xl mb-2">{item.icon}</div>}
            <h3 className="font-bold text-surface-800 mb-1">{item.title}</h3>
            {item.desc && <p className="text-sm text-surface-500">{item.desc}</p>}
          </div>
        ))}
      </div>
    </section>
  )
}

function DividerBlock() {
  return <hr className="border-surface-200 my-2" />
}

export function BlockRenderer({ blocks }: { blocks: Block[] }) {
  return (
    <>
      {blocks.map((block) => {
        switch (block.type) {
          case 'hero':     return <HeroBlock     key={block.id} props={block.props} />
          case 'text':     return <TextBlock     key={block.id} props={block.props} />
          case 'image':    return <ImageBlock    key={block.id} props={block.props} />
          case 'gallery':  return <GalleryBlock  key={block.id} props={block.props} />
          case 'cta':      return <CtaBlock      key={block.id} props={block.props} />
          case 'faq':      return <FaqBlock      key={block.id} props={block.props} />
          case 'features': return <FeaturesBlock key={block.id} props={block.props} />
          case 'divider':  return <DividerBlock  key={block.id} />
          default:         return null
        }
      })}
    </>
  )
}
