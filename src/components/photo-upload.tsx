"use client"
import { useState, useRef } from "react"
import { Camera, Loader2, X, Star, Crop, ZoomIn, ZoomOut } from "lucide-react"
import { cn } from "@/lib/utils"

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"]
const MAX_BYTES = 10 * 1024 * 1024
const JPEG_QUALITY = 0.85
const FRAME_SIZE = 320

function clamp(v: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, v)) }

interface Photo { id: string; url: string; isPrimary: boolean }
interface PhotoUploadProps { animalId: string; initialPhotos: Photo[] }

function CropModal({ file, onConfirm, onCancel }: {
  file: File
  onConfirm: (f: File) => void
  onCancel: () => void
}) {
  const [src] = useState(() => URL.createObjectURL(file))
  const imgRef = useRef<HTMLImageElement>(null)
  const [naturalW, setNaturalW] = useState(0)
  const [naturalH, setNaturalH] = useState(0)
  const [scale, setScale] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const dragging = useRef(false)
  const lastP = useRef({ x: 0, y: 0 })

  // smallest scale that makes the image cover FRAME_SIZE × FRAME_SIZE
  const baseScale = naturalW && naturalH
    ? Math.max(FRAME_SIZE / naturalW, FRAME_SIZE / naturalH)
    : 1

  const displayW = naturalW * baseScale * scale
  const displayH = naturalH * baseScale * scale
  const maxX = Math.max(0, (displayW - FRAME_SIZE) / 2)
  const maxY = Math.max(0, (displayH - FRAME_SIZE) / 2)
  const ox = clamp(offset.x, -maxX, maxX)
  const oy = clamp(offset.y, -maxY, maxY)

  function onImgLoad() {
    if (!imgRef.current) return
    setNaturalW(imgRef.current.naturalWidth)
    setNaturalH(imgRef.current.naturalHeight)
  }

  function onPointerDown(e: React.PointerEvent) {
    dragging.current = true
    lastP.current = { x: e.clientX, y: e.clientY }
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!dragging.current) return
    const dx = e.clientX - lastP.current.x
    const dy = e.clientY - lastP.current.y
    lastP.current = { x: e.clientX, y: e.clientY }
    setOffset(p => ({
      x: clamp(p.x + dx, -maxX, maxX),
      y: clamp(p.y + dy, -maxY, maxY),
    }))
  }

  function onPointerUp() { dragging.current = false }

  function onScaleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newScale = parseInt(e.target.value) / 100
    const nW = naturalW * baseScale * newScale
    const nH = naturalH * baseScale * newScale
    const nmX = Math.max(0, (nW - FRAME_SIZE) / 2)
    const nmY = Math.max(0, (nH - FRAME_SIZE) / 2)
    setScale(newScale)
    setOffset(p => ({ x: clamp(p.x, -nmX, nmX), y: clamp(p.y, -nmY, nmY) }))
  }

  function confirm() {
    if (!imgRef.current || !naturalW) return
    const totalScale = baseScale * scale
    const cropX = ((displayW - FRAME_SIZE) / 2 - ox) / totalScale
    const cropY = ((displayH - FRAME_SIZE) / 2 - oy) / totalScale
    const cropSz = FRAME_SIZE / totalScale
    const outSz = Math.min(1200, Math.max(600, Math.round(cropSz)))
    const canvas = document.createElement("canvas")
    canvas.width = outSz
    canvas.height = outSz
    const ctx = canvas.getContext("2d")!
    ctx.drawImage(imgRef.current, cropX, cropY, cropSz, cropSz, 0, 0, outSz, outSz)
    canvas.toBlob(blob => {
      if (blob) onConfirm(new File([blob], file.name.replace(/\.[^.]+$/, ".jpg"), { type: "image/jpeg" }))
    }, "image/jpeg", JPEG_QUALITY)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={e => { if (e.target === e.currentTarget) onCancel() }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="px-4 py-3 border-b flex items-center justify-between">
          <span className="font-semibold text-sm flex items-center gap-1.5">
            <Crop className="h-4 w-4 text-primary" />
            Adjust &amp; crop photo
          </span>
          <button onClick={onCancel} className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-4 space-y-3">
          {/* Crop frame */}
          <div
            className="relative mx-auto overflow-hidden rounded-xl bg-slate-100 cursor-grab active:cursor-grabbing select-none ring-1 ring-black/10"
            style={{ width: FRAME_SIZE, height: FRAME_SIZE, touchAction: "none" }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerLeave={onPointerUp}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imgRef}
              src={src}
              alt=""
              onLoad={onImgLoad}
              draggable={false}
              style={{
                position: "absolute",
                width: displayW || "100%",
                height: displayH || "auto",
                left: `${(FRAME_SIZE - displayW) / 2 + ox}px`,
                top: `${(FRAME_SIZE - displayH) / 2 + oy}px`,
                pointerEvents: "none",
              }}
            />
            {/* Rule-of-thirds grid overlay */}
            {naturalW > 0 && (
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: `
                    linear-gradient(rgba(255,255,255,.18) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(255,255,255,.18) 1px, transparent 1px)
                  `,
                  backgroundSize: `${FRAME_SIZE / 3}px ${FRAME_SIZE / 3}px`,
                }}
              />
            )}
          </div>

          {/* Zoom slider */}
          <div className="flex items-center gap-2 px-1">
            <ZoomOut className="h-4 w-4 text-muted-foreground shrink-0" />
            <input
              type="range" min="100" max="300"
              value={Math.round(scale * 100)}
              onChange={onScaleChange}
              className="flex-1 accent-primary h-1.5"
            />
            <ZoomIn className="h-4 w-4 text-muted-foreground shrink-0" />
          </div>
          <p className="text-xs text-center text-muted-foreground">
            Drag to reposition · zoom to fit the animal
          </p>
        </div>

        <div className="px-4 pb-4 flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 py-2 text-sm border rounded-lg hover:bg-slate-50 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={confirm}
            className="flex-1 py-2 text-sm font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Crop &amp; Upload
          </button>
        </div>
      </div>
    </div>
  )
}

export function PhotoUpload({ animalId, initialPhotos }: PhotoUploadProps) {
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos)
  const [cropFile, setCropFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [removing, setRemoving] = useState<string | null>(null)
  const [error, setError] = useState("")

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return
    if (!ACCEPTED_TYPES.includes(file.type)) { setError("Only JPEG, PNG, and WebP images are supported"); return }
    if (file.size > MAX_BYTES) { setError("Image must be under 10 MB"); return }
    setError("")
    setCropFile(file)
  }

  async function handleCropConfirm(croppedFile: File) {
    setCropFile(null)
    setUploading(true)
    setError("")
    try {
      const body = new FormData()
      body.append("file", croppedFile)
      const r = await fetch(`/api/animals/${animalId}/photos`, { method: "POST", body })
      const data = await r.json()
      if (!r.ok) { setError(data.error || "Upload failed — please try again"); return }
      setPhotos(prev => [...prev, data as Photo])
    } catch {
      setError("Upload failed — please check your connection")
    } finally {
      setUploading(false)
    }
  }

  async function removePhoto(photoId: string) {
    setRemoving(photoId)
    setError("")
    try {
      const r = await fetch(`/api/animals/${animalId}/photos/${photoId}`, { method: "DELETE" })
      if (r.ok) {
        setPhotos(prev => {
          const removed = prev.find(p => p.id === photoId)
          const updated = prev.filter(p => p.id !== photoId)
          if (removed?.isPrimary && updated.length > 0) updated[0] = { ...updated[0], isPrimary: true }
          return updated
        })
      } else {
        const data = await r.json().catch(() => ({})) as { error?: string }
        setError(data.error || "Failed to remove photo")
      }
    } catch {
      setError("Failed to remove photo")
    } finally {
      setRemoving(null)
    }
  }

  async function setAsPrimary(photoId: string) {
    setError("")
    try {
      const r = await fetch(`/api/animals/${animalId}/photos/${photoId}`, { method: "PATCH" })
      if (r.ok) setPhotos(prev => prev.map(p => ({ ...p, isPrimary: p.id === photoId })))
      else {
        const data = await r.json().catch(() => ({})) as { error?: string }
        setError(data.error || "Failed to update photo")
      }
    } catch {
      setError("Failed to update photo")
    }
  }

  return (
    <>
      {cropFile && (
        <CropModal
          file={cropFile}
          onConfirm={handleCropConfirm}
          onCancel={() => setCropFile(null)}
        />
      )}

      <div className="space-y-3">
        {error && (
          <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">{error}</p>
        )}

        <div className="flex flex-wrap gap-3">
          {photos.map(photo => (
            <div key={photo.id} className="relative group w-24 h-24">
              <div className="w-24 h-24 rounded-lg overflow-hidden border-2 border-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo.url} alt="" className="w-full h-full object-cover" />
              </div>
              {photo.isPrimary && (
                <div className="absolute bottom-0 left-0 right-0 bg-primary text-white text-[10px] text-center py-0.5 rounded-b-lg font-medium">
                  Main
                </div>
              )}
              <div className="absolute inset-0 rounded-lg bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                {!photo.isPrimary && (
                  <button
                    type="button"
                    onClick={() => setAsPrimary(photo.id)}
                    title="Set as main photo"
                    className="w-7 h-7 bg-white rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
                  >
                    <Star className="h-3.5 w-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => removePhoto(photo.id)}
                  disabled={removing === photo.id}
                  title="Remove photo"
                  className="w-7 h-7 bg-white rounded-full flex items-center justify-center hover:bg-destructive hover:text-white transition-colors disabled:opacity-50"
                >
                  {removing === photo.id
                    ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    : <X className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>
          ))}

          {/* Upload button */}
          <label className={cn(
            "w-24 h-24 rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-1.5 transition-colors",
            uploading
              ? "opacity-60 cursor-not-allowed border-muted"
              : "cursor-pointer hover:border-primary hover:bg-primary/5 border-border"
          )}>
            {uploading ? (
              <>
                <Loader2 className="h-5 w-5 text-primary animate-spin" />
                <span className="text-[10px] text-muted-foreground">Uploading…</span>
              </>
            ) : (
              <>
                <Camera className="h-5 w-5 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground text-center leading-tight">Add photo</span>
              </>
            )}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              disabled={uploading}
              onChange={handleFileChange}
            />
          </label>
        </div>

        <p className="text-xs text-muted-foreground">
          JPEG, PNG or WebP · max 10 MB · crop &amp; adjust before upload · hover to set main or remove
        </p>
      </div>
    </>
  )
}
