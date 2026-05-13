export default function Loading() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
      <div className="relative">
        <div className="w-14 h-14 rounded-full border-4 border-surface-200" />
        <div className="absolute inset-0 w-14 h-14 rounded-full border-4 border-brand-600 border-t-transparent animate-spin" />
      </div>
      <p className="text-sm text-surface-500 animate-pulse">در حال بارگذاری…</p>
    </div>
  )
}
