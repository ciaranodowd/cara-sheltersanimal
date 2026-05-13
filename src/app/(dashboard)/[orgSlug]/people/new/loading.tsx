import { LoadingPaws } from "@/components/ui/loading-paws"
export default function NewPersonLoading() {
  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-6">
      <div className="h-8 w-32 bg-slate-200 rounded animate-pulse" />
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="space-y-1.5">
              <div className="h-4 w-24 bg-slate-200 rounded animate-pulse" />
              <div className="h-9 w-full bg-slate-200 rounded animate-pulse" />
            </div>
          ))}
        </div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="space-y-1.5">
            <div className="h-4 w-24 bg-slate-200 rounded animate-pulse" />
            <div className="h-9 w-full bg-slate-200 rounded animate-pulse" />
          </div>
        ))}
        <div className="h-9 w-32 bg-slate-200 rounded animate-pulse mt-4" />
      </div>
      <LoadingPaws />
    </div>
  )
}
