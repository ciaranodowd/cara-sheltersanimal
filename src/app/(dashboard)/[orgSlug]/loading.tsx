export default function DashboardLoading() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      <div className="h-8 w-48 bg-slate-200 rounded-lg animate-pulse" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl p-5 border border-slate-100 space-y-4">
            <div className="flex items-start justify-between">
              <div className="h-4 w-24 bg-slate-200 rounded animate-pulse" />
              <div className="h-8 w-8 bg-slate-200 rounded-lg animate-pulse" />
            </div>
            <div className="h-9 w-16 bg-slate-200 rounded animate-pulse" />
            <div className="h-3 w-20 bg-slate-200 rounded animate-pulse" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-100">
            <div className="px-6 py-4 border-b border-slate-100">
              <div className="h-5 w-32 bg-slate-200 rounded animate-pulse" />
            </div>
            <div className="divide-y divide-slate-50">
              {[...Array(4)].map((_, j) => (
                <div key={j} className="px-6 py-3.5 flex items-center justify-between">
                  <div className="space-y-1.5">
                    <div className="h-4 w-28 bg-slate-200 rounded animate-pulse" />
                    <div className="h-3 w-20 bg-slate-200 rounded animate-pulse" />
                  </div>
                  <div className="h-6 w-16 bg-slate-200 rounded-full animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <div className="h-5 w-28 bg-slate-200 rounded animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-100 p-5 flex items-center gap-4">
              <div className="h-10 w-10 bg-slate-200 rounded-lg animate-pulse shrink-0" />
              <div className="space-y-1.5">
                <div className="h-4 w-20 bg-slate-200 rounded animate-pulse" />
                <div className="h-3 w-16 bg-slate-200 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
