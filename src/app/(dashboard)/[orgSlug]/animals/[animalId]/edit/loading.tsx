export default function EditAnimalLoading() {
  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-6">
      <div className="h-8 w-40 bg-slate-200 rounded animate-pulse" />
      <div className="space-y-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="space-y-1.5">
            <div className="h-4 w-24 bg-slate-200 rounded animate-pulse" />
            <div className="h-9 w-full bg-slate-200 rounded animate-pulse" />
          </div>
        ))}
        <div className="flex gap-3 mt-4">
          <div className="h-9 w-24 bg-slate-200 rounded animate-pulse" />
          <div className="h-9 w-20 bg-slate-200 rounded animate-pulse" />
        </div>
      </div>
    </div>
  )
}
