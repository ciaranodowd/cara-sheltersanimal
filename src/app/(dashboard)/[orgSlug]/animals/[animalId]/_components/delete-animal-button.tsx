"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Trash2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Props {
  animalId: string
  animalName: string
  orgSlug: string
}

export function DeleteAnimalButton({ animalId, animalName, orgSlug }: Props) {
  const router = useRouter()
  const [showConfirm, setShowConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState("")

  async function handleDelete() {
    setDeleting(true)
    setError("")
    try {
      const res = await fetch(`/api/animals/${animalId}`, { method: "DELETE" })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? "Failed to remove animal")
        setDeleting(false)
        return
      }
      router.push(`/${orgSlug}/animals`)
      router.refresh()
    } catch {
      setError("Network error — please try again")
      setDeleting(false)
    }
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-1.5"
        onClick={() => setShowConfirm(true)}
      >
        <Trash2 className="h-4 w-4" /> Remove
      </Button>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full space-y-4">
            <div className="space-y-1">
              <h3 className="font-semibold text-slate-900">Remove {animalName}?</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                This will permanently remove <strong>{animalName}</strong> from the system, including all photos and medical records. This cannot be undone.
              </p>
            </div>
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => { setShowConfirm(false); setError("") }}
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={deleting}
                className="gap-1.5"
              >
                {deleting ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Removing…</> : "Remove animal"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
