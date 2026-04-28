import Link from "next/link"

export default function DashboardNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4 text-center">
      <div className="text-5xl mb-2">🐾</div>
      <h2 className="text-xl font-bold">Not found</h2>
      <p className="text-sm text-muted-foreground">
        This page or record doesn&apos;t exist.
      </p>
      <Link href="/" className="text-sm text-primary underline underline-offset-2">
        Back to dashboard
      </Link>
    </div>
  )
}
