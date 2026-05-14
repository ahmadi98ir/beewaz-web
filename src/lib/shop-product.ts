// ── Unified product type for the shop frontend ───────────────────────────────
// Works for both DB-sourced and (legacy) mock products

export type ShopProduct = {
  id: string
  slug: string
  sku: string
  nameFa: string
  categorySlug: string
  categoryName: string
  price: number
  comparePrice?: number
  rating: number
  reviewCount: number
  stock: number
  isFeatured: boolean
  isNew: boolean
  descriptionFa: string
  specs: { key: string; value: string }[]
  images: { url: string; alt: string | null }[]
  placeholderFrom: string
  placeholderTo: string
}

export type ShopCategory = {
  slug: string
  nameFa: string
  productCount: number
}

// ── Color palette for gradient placeholders ──────────────────────────────────
const PALETTE: [string, string][] = [
  ['#DBEAFE', '#BFDBFE'],
  ['#D1FAE5', '#A7F3D0'],
  ['#FEF3C7', '#FDE68A'],
  ['#EDE9FE', '#DDD6FE'],
  ['#FCE7F3', '#FBCFE8'],
  ['#FFEDD5', '#FED7AA'],
  ['#ECFDF5', '#BBF7D0'],
]

function colorFromKey(key: string): [string, string] {
  let hash = 0
  for (let i = 0; i < key.length; i++) {
    hash = ((hash << 5) - hash + key.charCodeAt(i)) | 0
  }
  return PALETTE[Math.abs(hash) % PALETTE.length]!
}

// ── DB → ShopProduct mapper ───────────────────────────────────────────────────

type DbProductForShop = {
  id: string
  slug: string
  sku: string
  nameFa: string
  descriptionFa: string | null
  price: number
  comparePrice: number | null
  stock: number
  isFeatured: boolean
  createdAt: Date | string
  category?: { nameFa: string; slug: string } | null
  specs?: { keyFa: string; valueFa: string }[]
  images?: { url: string; alt: string | null }[]
}

const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000

export function dbProductToShop(p: DbProductForShop): ShopProduct {
  const [from, to] = colorFromKey(p.category?.slug ?? p.sku)
  const createdAt = p.createdAt instanceof Date ? p.createdAt : new Date(p.createdAt)
  return {
    id: p.id,
    slug: p.slug,
    sku: p.sku,
    nameFa: p.nameFa,
    categorySlug: p.category?.slug ?? '',
    categoryName: p.category?.nameFa ?? '',
    price: p.price,
    comparePrice: p.comparePrice ?? undefined,
    rating: 0,
    reviewCount: 0,
    stock: p.stock,
    isFeatured: p.isFeatured,
    isNew: Date.now() - createdAt.getTime() < THIRTY_DAYS,
    descriptionFa: p.descriptionFa ?? '',
    specs: p.specs?.map((s) => ({ key: s.keyFa, value: s.valueFa })) ?? [],
    images: p.images ?? [],
    placeholderFrom: from,
    placeholderTo: to,
  }
}
