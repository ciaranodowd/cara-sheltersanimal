export default function ContractLoading() {
  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6">
      <div className="h-8 w-32 bg-slate-200 rounded animate-pulse" />
      <div className="bg-white rounded-xl border p-6 space-y-4">
        <div className="h-6 w-40 bg-slate-200 rounded animate-pulse" />
        <div className="space-y-2">
          {[...Array(12)].map((_, i) => (
            <div key={i} className={`h-4 bg-slate-200 rounded animate-pulse ${i % 3 === 2 ? "w-3/4" : "w-full"}`} />
          ))}
        </div>
      </div>
      <div className="flex gap-3">
        <div className="h-9 w-32 bg-slate-200 rounded animate-pulse" />
        <div className="h-9 w-28 bg-slate-200 rounded animate-pulse" />
      </div>
    </div>
  )
}
