import { LoadingPaws } from "@/components/ui/loading-paws"
export default function BillingLoading() {
  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-6">
      <div className="space-y-1">
        <div className="h-8 w-20 bg-slate-200 rounded animate-pulse" />
        <div className="h-4 w-32 bg-slate-200 rounded animate-pulse" />
      </div>

      <div className="bg-white rounded-xl border p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1.5">
            <div className="h-5 w-24 bg-slate-200 rounded animate-pulse" />
            <div className="h-4 w-32 bg-slate-200 rounded animate-pulse" />
          </div>
          <div className="h-7 w-16 bg-slate-200 rounded-full animate-pulse" />
        </div>
        <div className="h-px bg-slate-200" />
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-4 w-full bg-slate-200 rounded animate-pulse" />
          ))}
        </div>
        <div className="h-9 w-36 bg-slate-200 rounded animate-pulse" />
      </div>
      <LoadingPaws />
    </div>
  )
}
