import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { supabaseAdmin, ANIMAL_PHOTOS_BUCKET } from "@/lib/supabase"

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"]
const MAX_BYTES = 10 * 1024 * 1024 // 10 MB (client compresses first; keep generous server limit)

export async function POST(
  req: NextRequest,
  { params }: { params: { animalId: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const animal = await prisma.animal.findUnique({ where: { id: params.animalId } })
  if (!animal) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const membership = await prisma.userOrganization.findUnique({
    where: {
      userId_organizationId: {
        userId: session.user.id,
        organizationId: animal.organizationId,
      },
    },
  })
  if (!membership) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 })
  }

  const file = formData.get("file") as File | null
  if (!file || file.size === 0) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 })
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "Only JPEG, PNG, and WebP images are accepted" },
      { status: 400 }
    )
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Image must be under 10 MB" }, { status: 400 })
  }

  // Build unique storage path: {animalId}/{timestamp}-{random}.{ext}
  const ext = file.type === "image/jpeg" ? "jpg" : file.type === "image/png" ? "png" : "webp"
  const storagePath = `${params.animalId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`

  const bytes = await file.arrayBuffer()

  const { error: uploadError } = await supabaseAdmin.storage
    .from(ANIMAL_PHOTOS_BUCKET)
    .upload(storagePath, Buffer.from(bytes), {
      contentType: file.type,
      upsert: false,
    })

  if (uploadError) {
    console.error("[photo upload] Supabase Storage error:", uploadError)
    return NextResponse.json(
      { error: uploadError.message || "Storage upload failed" },
      { status: 500 }
    )
  }

  // Build the public URL
  const { data: { publicUrl } } = supabaseAdmin.storage
    .from(ANIMAL_PHOTOS_BUCKET)
    .getPublicUrl(storagePath)

  // First photo becomes the primary automatically
  const count = await prisma.animalPhoto.count({ where: { animalId: params.animalId } })
  const isPrimary = count === 0

  const photo = await prisma.animalPhoto.create({
    data: {
      animalId: params.animalId,
      url: publicUrl,
      key: storagePath,
      isPrimary,
      position: count,
    },
  })

  return NextResponse.json(photo, { status: 201 })
}
