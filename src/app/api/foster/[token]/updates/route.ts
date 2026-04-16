import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { supabaseAdmin } from "@/lib/supabase"

const FOSTER_PHOTOS_BUCKET = "foster-updates"

export async function POST(req: NextRequest, { params }: { params: { token: string } }) {
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
      try {
        // Ensure bucket exists
        const { data: buckets } = await supabaseAdmin.storage.listBuckets()
        if (!buckets?.find(b => b.name === FOSTER_PHOTOS_BUCKET)) {
          await supabaseAdmin.storage.createBucket(FOSTER_PHOTOS_BUCKET, { public: true })
        }

        const ext = file.name.split(".").pop() ?? "jpg"
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
