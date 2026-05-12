export default function DonorDetailLoading() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-6">
        <div className="space-y-4">
          <div className="h-4 w-28 bg-slate-200 rounded animate-pulse" />
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-slate-200 animate-pulse shrink-0" />
            <div className="space-y-2">
              <div className="h-7 w-40 bg-slate-200 rounded animate-pulse" />
              <div className="h-4 w-32 bg-slate-200 rounded animate-pulse" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-100 p-6 space-y-3">
          <div className="h-4 w-28 bg-slate-200 rounded animate-pulse mb-4" />
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-4 w-4 bg-slate-200 rounded animate-pulse" />
              <div className="h-4 w-48 bg-slate-200 rounded animate-pulse" />
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-slate-100">
          <div className="px-6 py-4 border-b border-slate-50">
            <div className="h-5 w-28 bg-slate-200 rounded animate-pulse" />
          </div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="px-6 py-4 flex items-center justify-between border-b last:border-0">
              <div className="space-y-1.5">
                <div className="h-4 w-24 bg-slate-200 rounded animate-pulse" />
                <div className="h-3 w-16 bg-slate-200 rounded animate-pulse" />
              </div>
              <div className="h-5 w-16 bg-slate-200 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
