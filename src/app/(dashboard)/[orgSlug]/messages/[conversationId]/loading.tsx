export default function ChatLoading() {
  return (
    <div className="flex flex-col h-screen">
      <div className="flex items-center gap-3 px-4 py-3 border-b bg-white shrink-0">
        <div className="h-4 w-4 bg-slate-200 rounded animate-pulse" />
        <div className="flex-1 space-y-1">
          <div className="h-4 w-32 bg-slate-200 rounded animate-pulse" />
          <div className="h-3 w-24 bg-slate-200 rounded animate-pulse" />
        </div>
      </div>
      <div className="flex-1 bg-slate-50 p-4 space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}>
            <div className={`h-10 bg-slate-200 rounded-2xl animate-pulse ${i % 2 === 0 ? "w-48" : "w-36"}`} />
          </div>
        ))}
      </div>
      <div className="border-t bg-white px-4 py-3 shrink-0">
        <div className="h-10 w-full bg-slate-200 rounded animate-pulse" />
      </div>
    </div>
  )
}
