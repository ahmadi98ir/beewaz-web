type Props = { categorySlug: string; size?: number; className?: string }

const icons: Record<string, (s: number) => React.ReactNode> = {
  sensors: (s) => (
    <svg width={s} height={s} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="20" y="20" width="24" height="24" rx="6" fill="currentColor" fillOpacity=".15" />
      <rect x="26" y="26" width="12" height="12" rx="3" fill="currentColor" fillOpacity=".4" />
      <circle cx="32" cy="32" r="3" fill="currentColor" />
      <path d="M14 32c0-9.94 8.06-18 18-18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity=".3" />
      <path d="M50 32c0 9.94-8.06 18-18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity=".3" />
      <path d="M20 32a12 12 0 0 1 12-12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity=".5" />
      <path d="M44 32a12 12 0 0 1-12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity=".5" />
    </svg>
  ),
  'central-alarm': (s) => (
    <svg width={s} height={s} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="10" y="18" width="44" height="28" rx="4" fill="currentColor" fillOpacity=".1" stroke="currentColor" strokeWidth="2" strokeOpacity=".4" />
      <rect x="16" y="24" width="10" height="6" rx="2" fill="currentColor" fillOpacity=".5" />
      <rect x="30" y="24" width="4" height="4" rx="1" fill="currentColor" fillOpacity=".4" />
      <rect x="36" y="24" width="4" height="4" rx="1" fill="currentColor" fillOpacity=".4" />
      <rect x="42" y="24" width="4" height="4" rx="1" fill="currentColor" fillOpacity=".4" />
      <rect x="16" y="34" width="30" height="3" rx="1.5" fill="currentColor" fillOpacity=".2" />
      <circle cx="44" cy="38" r="3" fill="currentColor" fillOpacity=".6" />
    </svg>
  ),
  sirens: (s) => (
    <svg width={s} height={s} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M32 14 L44 42 H20 Z" fill="currentColor" fillOpacity=".15" />
      <path d="M32 20 L41 42 H23 Z" fill="currentColor" fillOpacity=".3" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <rect x="26" y="42" width="12" height="5" rx="2" fill="currentColor" fillOpacity=".5" />
      <path d="M14 28 C18 20 26 16 32 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity=".4" />
      <path d="M50 28 C46 20 38 16 32 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity=".4" />
    </svg>
  ),
  control: (s) => (
    <svg width={s} height={s} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="18" y="12" width="28" height="40" rx="4" fill="currentColor" fillOpacity=".1" stroke="currentColor" strokeWidth="2" strokeOpacity=".4" />
      <circle cx="32" cy="22" r="5" fill="currentColor" fillOpacity=".4" />
      <rect x="24" y="31" width="5" height="5" rx="1.5" fill="currentColor" fillOpacity=".5" />
      <rect x="31" y="31" width="5" height="5" rx="1.5" fill="currentColor" fillOpacity=".5" />
      <rect x="24" y="38" width="5" height="5" rx="1.5" fill="currentColor" fillOpacity=".5" />
      <rect x="31" y="38" width="5" height="5" rx="1.5" fill="currentColor" fillOpacity=".5" />
      <circle cx="38.5" cy="33.5" r="2.5" fill="currentColor" fillOpacity=".3" />
      <circle cx="38.5" cy="40.5" r="2.5" fill="currentColor" fillOpacity=".3" />
    </svg>
  ),
  boosters: (s) => (
    <svg width={s} height={s} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M32 48 V28" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M32 28 L24 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity=".6" />
      <path d="M32 28 L40 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity=".6" />
      <path d="M22 32 C22 24 26 18 32 16 C38 18 42 24 42 32" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity=".4" />
      <path d="M16 36 C16 22 23 13 32 10 C41 13 48 22 48 36" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity=".25" />
      <rect x="28" y="46" width="8" height="6" rx="2" fill="currentColor" fillOpacity=".4" />
    </svg>
  ),
  accessories: (s) => (
    <svg width={s} height={s} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="14" y="24" width="36" height="20" rx="4" fill="currentColor" fillOpacity=".1" stroke="currentColor" strokeWidth="2" strokeOpacity=".4" />
      <path d="M22 24 V20 H28 V24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity=".5" />
      <path d="M36 24 V20 H42 V24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity=".5" />
      <circle cx="24" cy="34" r="3" fill="currentColor" fillOpacity=".5" />
      <circle cx="32" cy="34" r="3" fill="currentColor" fillOpacity=".3" />
      <circle cx="40" cy="34" r="3" fill="currentColor" fillOpacity=".5" />
    </svg>
  ),
}

const fallback = (s: number) => (
  <svg width={s} height={s} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M32 12 L48 20 V36 C48 44 40 50 32 52 C24 50 16 44 16 36 V20 Z"
      fill="currentColor"
      fillOpacity=".15"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
      strokeOpacity=".4"
    />
    <path d="M32 22 L40 26 V34 C40 38 36 42 32 43 C28 42 24 38 24 34 V26 Z" fill="currentColor" fillOpacity=".3" />
  </svg>
)

export function ProductSvgIcon({ categorySlug, size = 64, className = 'text-surface-500' }: Props) {
  const render = icons[categorySlug] ?? fallback
  return <div className={className}>{render(size)}</div>
}
