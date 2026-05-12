export default function NewMedicalRecordLoading() {
  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-6">
      <div className="h-8 w-48 bg-slate-200 rounded animate-pulse" />
      <div className="space-y-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="space-y-1.5">
            <div className="h-4 w-28 bg-slate-200 rounded animate-pulse" />
            <div className="h-9 w-full bg-slate-200 rounded animate-pulse" />
          </div>
        ))}
        <div className="h-9 w-32 bg-slate-200 rounded animate-pulse mt-4" />
      </div>
    </div>
  )
}
