import { LoadingPaws } from "@/components/ui/loading-paws"
export default function AdoptionsLoading() {
  return (
    <div className="p-4 sm:p-6 max-w-full space-y-5">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="h-8 w-28 bg-slate-200 rounded animate-pulse" />
          <div className="h-4 w-40 bg-slate-200 rounded animate-pulse" />
        </div>
        <div className="h-9 w-24 bg-slate-200 rounded animate-pulse" />
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {[...Array(6)].map((_, col) => (
          <div key={col} className="shrink-0 w-64">
            <div className="rounded-xl border-2 border-slate-200 bg-slate-50 p-3">
              <div className="flex items-center justify-between mb-3">
                <div className="h-4 w-20 bg-slate-200 rounded animate-pulse" />
                <div className="h-5 w-6 bg-slate-200 rounded-full animate-pulse" />
              </div>
              <div className="space-y-2">
                {[...Array(col === 0 ? 3 : col === 1 ? 2 : 1)].map((_, card) => (
                  <div key={card} className="bg-white rounded-lg p-3 border space-y-2">
                    <div className="h-4 w-24 bg-slate-200 rounded animate-pulse" />
                    <div className="h-3 w-16 bg-slate-200 rounded animate-pulse" />
                    <div className="flex items-center justify-between">
                      <div className="h-3 w-16 bg-slate-200 rounded animate-pulse" />
                      <div className="h-4 w-12 bg-slate-200 rounded-full animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
      <LoadingPaws />
    </div>
  )
}
