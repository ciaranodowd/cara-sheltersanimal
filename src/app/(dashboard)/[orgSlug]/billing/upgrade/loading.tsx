export default function UpgradeLoading() {
  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-6">
      <div className="h-8 w-28 bg-slate-200 rounded animate-pulse" />
      <div className="bg-white rounded-xl border p-8 space-y-6">
        <div className="text-center space-y-3">
          <div className="h-8 w-48 bg-slate-200 rounded animate-pulse mx-auto" />
          <div className="h-4 w-64 bg-slate-200 rounded animate-pulse mx-auto" />
        </div>
        <div className="h-16 w-full bg-slate-200 rounded-xl animate-pulse" />
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-5 w-5 bg-slate-200 rounded-full animate-pulse shrink-0" />
              <div className="h-4 w-48 bg-slate-200 rounded animate-pulse" />
            </div>
          ))}
        </div>
        <div className="h-10 w-full bg-slate-200 rounded animate-pulse" />
      </div>
    </div>
  )
}
