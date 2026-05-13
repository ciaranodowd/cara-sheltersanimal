import { LoadingPaws } from "@/components/ui/loading-paws"
export default function VolunteerDetailLoading() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-6">
        <div className="space-y-4">
          <div className="h-4 w-28 bg-slate-200 rounded animate-pulse" />
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-slate-200 animate-pulse shrink-0" />
            <div className="space-y-2">
              <div className="h-7 w-40 bg-slate-200 rounded animate-pulse" />
              <div className="h-4 w-32 bg-slate-200 rounded animate-pulse" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-100 p-6 space-y-3">
          <div className="h-4 w-28 bg-slate-200 rounded animate-pulse mb-4" />
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-4 w-4 bg-slate-200 rounded animate-pulse" />
              <div className="h-4 w-48 bg-slate-200 rounded animate-pulse" />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-100 p-5 space-y-2">
              <div className="h-3 w-20 bg-slate-200 rounded animate-pulse" />
              <div className="h-8 w-16 bg-slate-200 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
      <LoadingPaws />
    </div>
  )
}
