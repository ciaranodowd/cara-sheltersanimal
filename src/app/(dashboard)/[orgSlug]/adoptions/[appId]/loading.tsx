export default function ApplicationLoading() {
  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6">
      <div className="h-8 w-28 bg-slate-200 rounded animate-pulse" />
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="h-5 w-32 bg-slate-200 rounded-full animate-pulse" />
          <div className="h-8 w-48 bg-slate-200 rounded animate-pulse" />
          <div className="h-4 w-36 bg-slate-200 rounded animate-pulse" />
        </div>
        <div className="h-7 w-24 bg-slate-200 rounded animate-pulse" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border p-6 space-y-3">
          <div className="h-5 w-32 bg-slate-200 rounded animate-pulse mb-4" />
          <div className="grid grid-cols-2 gap-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="space-y-1">
                <div className="h-3 w-20 bg-slate-200 rounded animate-pulse" />
                <div className="h-4 w-28 bg-slate-200 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border p-4 space-y-3">
              <div className="h-5 w-28 bg-slate-200 rounded animate-pulse" />
              <div className="h-9 w-full bg-slate-200 rounded animate-pulse" />
              <div className="h-20 w-full bg-slate-200 rounded animate-pulse" />
              <div className="h-9 w-full bg-slate-200 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
