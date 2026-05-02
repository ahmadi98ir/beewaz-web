export function ProductCardSkeleton({ view = 'grid' }: { view?: 'grid' | 'list' }) {
  if (view === 'list') {
    return (
      <div className="card flex flex-col sm:flex-row overflow-hidden animate-pulse">
        <div className="flex-shrink-0 sm:w-52 aspect-square sm:aspect-auto bg-surface-100" />
        <div className="flex flex-col flex-1 p-5 gap-3">
          <div className="h-3 bg-surface-100 rounded-full w-1/4" />
          <div className="h-5 bg-surface-100 rounded-full w-3/4" />
          <div className="h-3 bg-surface-100 rounded-full w-full" />
          <div className="h-3 bg-surface-100 rounded-full w-2/3" />
          <div className="flex justify-between items-center mt-auto pt-3 border-t border-surface-100">
            <div className="h-7 bg-surface-100 rounded-full w-1/3" />
            <div className="h-10 bg-surface-100 rounded-xl w-32" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="card animate-pulse">
      <div className="aspect-square bg-surface-100" />
      <div className="p-4 flex flex-col gap-3">
        <div className="h-3 bg-surface-100 rounded-full w-1/4" />
        <div className="h-4 bg-surface-100 rounded-full w-3/4" />
        <div className="flex gap-1 items-center">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="w-3 h-3 bg-surface-100 rounded-sm" />
          ))}
        </div>
        <div className="pt-2 border-t border-surface-50 mt-1">
          <div className="h-5 bg-surface-100 rounded-full w-1/3" />
        </div>
      </div>
    </div>
  )
}

export function ProductGridSkeleton({ count = 8, view = 'grid' }: { count?: number; view?: 'grid' | 'list' }) {
  return (
    <div
      className={
        view === 'grid'
          ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4'
          : 'flex flex-col gap-4'
      }
    >
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} view={view} />
      ))}
    </div>
  )
}
