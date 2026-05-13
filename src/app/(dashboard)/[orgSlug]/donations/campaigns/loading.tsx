import { LoadingPaws } from "@/components/ui/loading-paws"
export default function CampaignsLoading() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-8">
        <div className="space-y-2">
          <div className="h-4 w-28 bg-slate-200 rounded animate-pulse" />
          <div className="h-8 w-32 bg-slate-200 rounded animate-pulse" />
          <div className="h-4 w-36 bg-slate-200 rounded animate-pulse" />
        </div>

        <div className="space-y-4">
          <div className="h-5 w-24 bg-slate-200 rounded animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-100 p-6 space-y-4">
                <div className="space-y-1.5">
                  <div className="h-5 w-32 bg-slate-200 rounded animate-pulse" />
                  <div className="h-3 w-full bg-slate-200 rounded animate-pulse" />
                  <div className="h-3 w-3/4 bg-slate-200 rounded animate-pulse" />
                </div>
                <div className="space-y-1">
                  <div className="h-8 w-24 bg-slate-200 rounded animate-pulse" />
                  <div className="h-3 w-28 bg-slate-200 rounded animate-pulse" />
                </div>
                <div className="h-1.5 w-full bg-slate-200 rounded-full animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
      <LoadingPaws />
    </div>
  )
}
