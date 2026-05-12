export default function ReportsLoading() {
  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
      <div className="h-8 w-24 bg-slate-200 rounded animate-pulse" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl border p-4 space-y-4">
            <div className="h-5 w-36 bg-slate-200 rounded animate-pulse" />
            <div className="space-y-2">
              {[...Array(4)].map((_, j) => (
                <div key={j} className="flex items-center justify-between">
                  <div className="h-4 w-20 bg-slate-200 rounded animate-pulse" />
                  <div className="h-5 w-8 bg-slate-200 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="md:col-span-2 bg-white rounded-xl border p-4 space-y-4">
          <div className="h-5 w-48 bg-slate-200 rounded animate-pulse" />
          <div className="flex items-end gap-3 h-40">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="h-3 w-12 bg-slate-200 rounded animate-pulse" />
                <div
                  className="w-full bg-slate-200 rounded-t-sm animate-pulse"
                  style={{ height: `${40 + Math.random() * 60}px` }}
                />
                <div className="h-3 w-8 bg-slate-200 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>

        {[...Array(2)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl border p-4 space-y-4">
            <div className="h-5 w-32 bg-slate-200 rounded animate-pulse" />
            <div className="flex items-end gap-2 h-32">
              {[...Array(6)].map((_, j) => (
                <div key={j} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full bg-slate-200 rounded-t-sm animate-pulse"
                    style={{ height: `${20 + (j * 10)}px` }}
                  />
                  <div className="h-3 w-8 bg-slate-200 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
