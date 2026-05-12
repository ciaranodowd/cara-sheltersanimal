"use client"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"

export default function PeopleError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => { console.error(error) }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4 text-center">
      <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center text-2xl">⚠️</div>
      <h2 className="text-xl font-bold">Failed to load people</h2>
      <p className="text-sm text-muted-foreground max-w-sm">
        Something went wrong fetching contacts. Try refreshing, or contact support if it keeps happening.
      </p>
      {error.digest && (
        <p className="text-xs text-muted-foreground font-mono">ID: {error.digest}</p>
      )}
      <Button onClick={reset} variant="outline">Try again</Button>
    </div>
  )
}
