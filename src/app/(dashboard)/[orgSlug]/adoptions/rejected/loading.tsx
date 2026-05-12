export default function RejectedAdoptionsLoading() {
  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-5">
      <div className="h-4 w-28 bg-slate-200 rounded animate-pulse" />
      <div className="h-8 w-40 bg-slate-200 rounded animate-pulse" />
      <div className="rounded-xl border bg-white">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-4 border-b last:border-0">
            <div className="h-9 w-9 rounded-full bg-slate-200 animate-pulse shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-4 w-32 bg-slate-200 rounded animate-pulse" />
              <div className="h-3 w-24 bg-slate-200 rounded animate-pulse" />
            </div>
            <div className="h-6 w-20 bg-slate-200 rounded-full animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  )
}
