export default function DonationsLoading() {
  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="h-8 w-28 bg-slate-200 rounded animate-pulse" />
        <div className="flex gap-2">
          <div className="h-9 w-28 bg-slate-200 rounded animate-pulse" />
          <div className="h-9 w-36 bg-slate-200 rounded animate-pulse" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl border p-4 space-y-2">
            <div className="h-4 w-24 bg-slate-200 rounded animate-pulse" />
            <div className="h-8 w-28 bg-slate-200 rounded animate-pulse" />
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border">
        <div className="p-4 border-b">
          <div className="h-5 w-32 bg-slate-200 rounded animate-pulse" />
        </div>
        <div className="divide-y">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex items-center justify-between p-4">
              <div className="space-y-1.5">
                <div className="h-4 w-32 bg-slate-200 rounded animate-pulse" />
                <div className="h-3 w-40 bg-slate-200 rounded animate-pulse" />
              </div>
              <div className="text-right space-y-1.5">
                <div className="h-5 w-20 bg-slate-200 rounded animate-pulse" />
                <div className="h-4 w-16 bg-slate-200 rounded-full animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
