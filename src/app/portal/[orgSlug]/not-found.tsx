import Link from "next/link"

export default function PortalNotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 text-center">
      <div className="text-5xl mb-2">🐾</div>
      <h2 className="text-xl font-bold">Not found</h2>
      <p className="text-sm text-gray-500 max-w-sm">
        This page doesn&apos;t exist or the shelter may have moved.
      </p>
      <Link href="/" className="text-sm underline" style={{ color: "#1a3a2a" }}>
        Go home
      </Link>
    </div>
  )
}
