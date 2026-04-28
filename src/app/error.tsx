"use client"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center text-3xl mb-2">⚠️</div>
      <h2 className="text-xl font-bold">Something went wrong</h2>
      <p className="text-sm text-muted-foreground max-w-sm">
        An unexpected error occurred. Please try again, or contact support if the problem persists.
      </p>
      {error.digest && (
        <p className="text-xs text-muted-foreground font-mono">Error ID: {error.digest}</p>
      )}
      <Button onClick={reset}>Try again</Button>
    </div>
  )
}
