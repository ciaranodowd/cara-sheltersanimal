import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function AnimalNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4 text-center">
      <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-2xl">🐾</div>
      <h2 className="text-xl font-bold">Animal not found</h2>
      <p className="text-sm text-muted-foreground max-w-sm">
        This animal doesn&apos;t exist or you don&apos;t have access to it.
      </p>
      <Button asChild variant="outline">
        <Link href="..">Back to animals</Link>
      </Button>
    </div>
  )
}
