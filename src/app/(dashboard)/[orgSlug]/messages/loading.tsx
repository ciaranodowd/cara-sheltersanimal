import { LoadingPaws } from "@/components/ui/loading-paws"
export default function MessagesLoading() {
  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-5">
      <div className="space-y-1">
        <div className="h-8 w-28 bg-slate-200 rounded animate-pulse" />
        <div className="h-4 w-36 bg-slate-200 rounded animate-pulse" />
      </div>

      {[...Array(3)].map((_, group) => (
        <div key={group}>
          <div className="flex items-center gap-2 mb-2 px-1">
            <div className="h-4 w-4 bg-slate-200 rounded animate-pulse" />
            <div className="h-4 w-24 bg-slate-200 rounded animate-pulse" />
          </div>
          <div className="rounded-xl border bg-white overflow-hidden divide-y">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex items-start gap-3 p-4">
                <div className="w-10 h-10 rounded-full bg-slate-200 animate-pulse shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="h-4 w-28 bg-slate-200 rounded animate-pulse" />
                    <div className="h-3 w-16 bg-slate-200 rounded animate-pulse" />
                  </div>
                  <div className="h-3 w-48 bg-slate-200 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
      <LoadingPaws />
    </div>
  )
}
