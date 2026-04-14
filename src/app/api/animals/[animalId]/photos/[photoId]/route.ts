import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { supabaseAdmin, ANIMAL_PHOTOS_BUCKET } from "@/lib/supabase"

export async function DELETE(
  req: NextRequest,
  { params }: { params: { animalId: string; photoId: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const photo = await prisma.animalPhoto.findUnique({
    where: { id: params.photoId },
    include: { animal: { select: { organizationId: true } } },
  })
  if (!photo || photo.animalId !== params.animalId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const membership = await prisma.userOrganization.findUnique({
    where: {
      userId_organizationId: {
        userId: session.user.id,
        organizationId: photo.animal.organizationId,
      },
    },
  })
  if (!membership) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  // Delete DB record first, then remove from storage
  await prisma.animalPhoto.delete({ where: { id: params.photoId } })

  const { error: storageError } = await supabaseAdmin.storage
    .from(ANIMAL_PHOTOS_BUCKET)
    .remove([photo.key])

  if (storageError) {
    // Log but don't fail — DB record is already gone
    console.error("[photo delete] Storage removal error:", storageError)
  }

  // Promote the next photo to primary if this was the primary
  if (photo.isPrimary) {
    const next = await prisma.animalPhoto.findFirst({
      where: { animalId: params.animalId },
      orderBy: { position: "asc" },
    })
    if (next) {
      await prisma.animalPhoto.update({ where: { id: next.id }, data: { isPrimary: true } })
    }
  }

  return NextResponse.json({ success: true })
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { animalId: string; photoId: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const photo = await prisma.animalPhoto.findUnique({
    where: { id: params.photoId },
    include: { animal: { select: { organizationId: true } } },
  })
  if (!photo || photo.animalId !== params.animalId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const membership = await prisma.userOrganization.findUnique({
    where: {
      userId_organizationId: {
        userId: session.user.id,
        organizationId: photo.animal.organizationId,
      },
    },
  })
  if (!membership) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  // Unset all other primary photos, then set this one
  await prisma.animalPhoto.updateMany({
    where: { animalId: params.animalId, isPrimary: true },
    data: { isPrimary: false },
  })
  const updated = await prisma.animalPhoto.update({
    where: { id: params.photoId },
    data: { isPrimary: true },
  })

  return NextResponse.json(updated)
}
