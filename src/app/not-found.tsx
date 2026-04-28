import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 text-center">
      <div className="text-6xl mb-2">🐾</div>
      <h2 className="text-2xl font-bold">Page not found</h2>
      <p className="text-sm text-muted-foreground max-w-sm">
        This page doesn&apos;t exist or has been moved.
      </p>
      <Link href="/" className="text-sm text-primary underline underline-offset-2">
        Go home
      </Link>
    </div>
  )
}
