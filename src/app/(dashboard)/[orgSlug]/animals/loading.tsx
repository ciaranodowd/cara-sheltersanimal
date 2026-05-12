export default function AnimalsLoading() {
  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="h-8 w-24 bg-slate-200 rounded animate-pulse" />
          <div className="h-4 w-16 bg-slate-200 rounded animate-pulse" />
        </div>
        <div className="h-9 w-28 bg-slate-200 rounded animate-pulse" />
      </div>

      <div className="flex flex-wrap gap-2">
        <div className="h-9 flex-1 min-w-0 bg-slate-200 rounded animate-pulse" />
        <div className="h-9 w-36 bg-slate-200 rounded animate-pulse" />
        <div className="h-9 w-40 bg-slate-200 rounded animate-pulse" />
        <div className="h-9 w-20 bg-slate-200 rounded animate-pulse" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="rounded-2xl border bg-white overflow-hidden">
            <div className="aspect-[4/3] bg-slate-200 animate-pulse" />
            <div className="p-3 space-y-1.5">
              <div className="h-4 w-20 bg-slate-200 rounded animate-pulse" />
              <div className="h-3 w-16 bg-slate-200 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
