"use client"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Camera, Send, Loader2, User, Home, X } from "lucide-react"
import { formatDate } from "@/lib/utils"

interface FosterUpdate {
  id: string
  content: string
  photoUrl: string | null
  authorType: string
  createdAt: string
}

interface Props {
  token: string
  initialUpdates: FosterUpdate[]
  fosterName: string
  shelterName: string
}

export function UpdatesPanel({ token, initialUpdates, fosterName, shelterName }: Props) {
  const [updates, setUpdates] = useState<FosterUpdate[]>(initialUpdates)
  const [content, setContent] = useState("")
  const [photo, setPhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const fileRef = useRef<HTMLInputElement>(null)

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setPhoto(file)
    const reader = new FileReader()
    reader.onload = () => setPhotoPreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  function clearPhoto() {
    setPhoto(null)
    setPhotoPreview(null)
    if (fileRef.current) fileRef.current.value = ""
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim()) return
    setSubmitting(true)
    setError("")

    try {
      let res: Response

      if (photo) {
        const fd = new FormData()
        fd.append("content", content.trim())
        fd.append("photo", photo)
        res = await fetch(`/api/foster/${token}/updates`, { method: "POST", body: fd })
      } else {
        res = await fetch(`/api/foster/${token}/updates`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: content.trim() }),
        })
      }

      const data = await res.json()
      if (!res.ok) { setError(data.error ?? "Failed to post update"); return }

      setUpdates(prev => [{ ...data, createdAt: data.createdAt ?? new Date().toISOString() }, ...prev])
      setContent("")
      clearPhoto()
    } catch {
      setError("Network error — please try again")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Post update form */}
      <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-3">
        <form onSubmit={handleSubmit} className="space-y-3">
          <Textarea
            placeholder={`Share an update about how things are going…`}
            value={content}
            onChange={e => setContent(e.target.value)}
            rows={3}
            className="resize-none text-sm"
          />

          {photoPreview && (
            <div className="relative inline-block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photoPreview} alt="Preview" className="max-h-40 rounded-lg object-cover" />
              <button
                type="button"
                onClick={clearPhoto}
                className="absolute -top-2 -right-2 bg-slate-800 text-white rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}

          {error && <p className="text-xs text-destructive">{error}</p>}

          <div className="flex items-center justify-between gap-2">
            <div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhoto}
                id="foster-photo-input"
              />
              <label htmlFor="foster-photo-input">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs gap-1.5 cursor-pointer"
                  onClick={() => fileRef.current?.click()}
                >
                  <Camera className="h-3.5 w-3.5" />
                  Add photo
                </Button>
              </label>
            </div>
            <Button
              type="submit"
              size="sm"
              disabled={submitting || !content.trim()}
              style={{ backgroundColor: "#1a3a2a" }}
              className="text-white h-8 text-xs gap-1.5"
            >
              {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
              Post update
            </Button>
          </div>
        </form>
      </div>

      {/* Update list */}
      {updates.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground text-sm">
          No updates yet — be the first to post one!
        </div>
      ) : (
        <div className="space-y-3">
          {updates.map(u => {
            const isFoster = u.authorType === "FOSTER"
            return (
              <div key={u.id} className="flex gap-3">
                {/* Avatar */}
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white shrink-0 mt-0.5"
                  style={{ backgroundColor: isFoster ? "#1a3a2a" : "#6b7280" }}
                >
                  {isFoster
                    ? <Home className="h-4 w-4" />
                    : <User className="h-4 w-4" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="font-semibold text-sm">
                      {isFoster ? fosterName : shelterName}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(u.createdAt).toLocaleDateString("en-IE", {
                        day: "numeric", month: "short", year: "numeric",
                        hour: "2-digit", minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="text-sm mt-1 leading-relaxed whitespace-pre-wrap">{u.content}</p>
                  {u.photoUrl && (
                    <div className="mt-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={u.photoUrl}
                        alt="Update photo"
                        className="max-h-64 rounded-lg object-cover cursor-pointer"
                        onClick={() => window.open(u.photoUrl!, "_blank")}
                      />
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
