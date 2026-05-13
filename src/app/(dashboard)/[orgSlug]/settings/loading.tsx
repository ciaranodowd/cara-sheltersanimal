import { LoadingPaws } from "@/components/ui/loading-paws"
export default function SettingsLoading() {
  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-6">
      <div className="space-y-1">
        <div className="h-8 w-24 bg-slate-200 rounded animate-pulse" />
        <div className="h-4 w-40 bg-slate-200 rounded animate-pulse" />
      </div>

      <div className="flex gap-2 flex-wrap">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-9 w-24 bg-slate-200 rounded animate-pulse" />
        ))}
      </div>

      <div className="bg-white rounded-xl border p-6 space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="space-y-1.5">
            <div className="h-4 w-28 bg-slate-200 rounded animate-pulse" />
            <div className="h-9 w-full bg-slate-200 rounded animate-pulse" />
          </div>
        ))}
        <div className="h-9 w-28 bg-slate-200 rounded animate-pulse mt-2" />
      </div>
      <LoadingPaws />
    </div>
  )
}
