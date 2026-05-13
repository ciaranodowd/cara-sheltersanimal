import { LoadingPaws } from "@/components/ui/loading-paws"
export default function ProfileSettingsLoading() {
  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-6">
      <div className="h-8 w-32 bg-slate-200 rounded animate-pulse" />
      <div className="bg-white rounded-xl border p-6 space-y-4">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-slate-200 animate-pulse shrink-0" />
          <div className="h-9 w-28 bg-slate-200 rounded animate-pulse" />
        </div>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="space-y-1.5">
            <div className="h-4 w-20 bg-slate-200 rounded animate-pulse" />
            <div className="h-9 w-full bg-slate-200 rounded animate-pulse" />
          </div>
        ))}
        <div className="h-9 w-28 bg-slate-200 rounded animate-pulse mt-2" />
      </div>
      <LoadingPaws />
    </div>
  )
}
