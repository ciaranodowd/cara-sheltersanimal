export default function AnimalDetailLoading() {
  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="h-8 w-24 bg-slate-200 rounded animate-pulse" />
        <div className="h-8 w-36 bg-slate-200 rounded animate-pulse" />
      </div>

      <div className="flex flex-col sm:flex-row gap-6">
        <div className="w-full sm:w-48 shrink-0">
          <div className="aspect-square rounded-xl bg-slate-200 animate-pulse" />
        </div>
        <div className="flex-1 space-y-3">
          <div className="h-8 w-40 bg-slate-200 rounded animate-pulse" />
          <div className="h-4 w-32 bg-slate-200 rounded animate-pulse" />
          <div className="h-6 w-24 bg-slate-200 rounded-full animate-pulse" />
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-4">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="space-y-0.5">
                <div className="h-3 w-16 bg-slate-200 rounded animate-pulse" />
                <div className="h-4 w-20 bg-slate-200 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-2 border-b border-slate-200 pb-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-8 w-24 bg-slate-200 rounded animate-pulse" />
        ))}
      </div>

      <div className="bg-white rounded-xl border p-6 space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-4 bg-slate-200 rounded animate-pulse" />
        ))}
      </div>
    </div>
  )
}
