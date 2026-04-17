import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { supabaseAdmin } from "@/lib/supabase"
import { rateLimit } from "@/lib/rate-limit"

const FOSTER_PHOTOS_BUCKET = "foster-updates"
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"]
const MAX_PHOTO_BYTES = 10 * 1024 * 1024 // 10 MB
const MAX_CONTENT_LENGTH = 2000

export async function POST(req: NextRequest, { params }: { params: { token: string } }) {
  // Rate limit per token: 20 updates per hour
  const rl = rateLimit(`foster-update:${params.token}`, { limit: 20, windowMs: 60 * 60 * 1000 })
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } }
    )
  }

  const assignment = await prisma.fosterAssignment.findUnique({
    where: { fosterPortalToken: params.token },
    select: { id: true, status: true, organizationId: true },
  })

  if (!assignment) return NextResponse.json({ error: "Not found" }, { status: 404 })
  if (assignment.status === "ENDED") return NextResponse.json({ error: "Placement ended" }, { status: 410 })

  const contentType = req.headers.get("content-type") ?? ""

  let content = ""
  let photoUrl: string | null = null

  if (contentType.includes("multipart/form-data")) {
    const formData = await req.formData()
    content = (formData.get("content") as string | null) ?? ""
    const file = formData.get("photo") as File | null

    if (file && file.size > 0) {
      // Validate file type using MIME type (not filename extension)
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        return NextResponse.json(
          { error: "Only JPEG, PNG, WebP, and GIF images are accepted" },
          { status: 400 }
        )
      }
      // Validate file size
      if (file.size > MAX_PHOTO_BYTES) {
        return NextResponse.json({ error: "Photo must be under 10 MB" }, { status: 400 })
      }

      try {
        // Ensure bucket exists
        const { data: buckets } = await supabaseAdmin.storage.listBuckets()
        if (!buckets?.find(b => b.name === FOSTER_PHOTOS_BUCKET)) {
          await supabaseAdmin.storage.createBucket(FOSTER_PHOTOS_BUCKET, { public: true })
        }

        // Derive extension from validated MIME type — never trust the filename
        const extMap: Record<string, string> = {
          "image/jpeg": "jpg",
          "image/png": "png",
          "image/webp": "webp",
          "image/gif": "gif",
        }
        const ext = extMap[file.type] ?? "jpg"
        const path = `${assignment.organizationId}/${assignment.id}/${Date.now()}.${ext}`
        const bytes = await file.arrayBuffer()

        const { error } = await supabaseAdmin.storage
          .from(FOSTER_PHOTOS_BUCKET)
          .upload(path, Buffer.from(bytes), { contentType: file.type, upsert: false })

        if (!error) {
          const { data } = supabaseAdmin.storage.from(FOSTER_PHOTOS_BUCKET).getPublicUrl(path)
          photoUrl = data.publicUrl
        }
      } catch (err) {
        console.error("Foster photo upload failed:", err)
      }
    }
  } else {
    const body = await req.json()
    content = body.content ?? ""
  }

  if (!content.trim()) {
    return NextResponse.json({ error: "Content is required" }, { status: 400 })
  }

  // Enforce max content length
  if (content.length > MAX_CONTENT_LENGTH) {
    return NextResponse.json({ error: "Update text must be under 2000 characters" }, { status: 400 })
  }

  const update = await prisma.fosterUpdate.create({
    data: {
      fosterAssignmentId: assignment.id,
      content: content.trim(),
      photoUrl,
      authorType: "FOSTER",
    },
  })

  return NextResponse.json(update, { status: 201 })
}
