"use client"
import { useEffect } from "react"

export default function PortalError({
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
      <div className="text-5xl mb-2">🐾</div>
      <h2 className="text-xl font-bold">Something went wrong</h2>
      <p className="text-sm text-gray-500 max-w-sm">
        We ran into a problem loading this page. Please try again.
      </p>
      <button
        onClick={reset}
        className="px-4 py-2 rounded-lg text-sm font-medium text-white"
        style={{ backgroundColor: "#1a3a2a" }}
      >
        Try again
      </button>
    </div>
  )
}
