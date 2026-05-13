import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest, { params }: { params: { appId: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const app = await prisma.adoptionApplication.findUnique({
    where: { id: params.appId },
    include: {
      animal: { select: { name: true, species: true, microchipNumber: true, breed: true } },
      organization: { select: { name: true, email: true, contractTemplate: true } },
      contract: true,
    },
  })
  if (!app) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const membership = await prisma.userOrganization.findUnique({
    where: { userId_organizationId: { userId: session.user.id, organizationId: app.organizationId } },
  })
  if (!membership) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  // Find the conversation linked to this application (no FK — look up by applicant email + animal)
  let conversationId: string | null = null
  if (app.animalId && app.applicantEmail) {
    const participant = await prisma.user.findUnique({ where: { email: app.applicantEmail } })
    if (participant) {
      const conversation = await prisma.conversation.findFirst({
        where: {
          shelterOrganizationId: app.organizationId,
          participantUserId: participant.id,
          animalId: app.animalId,
        },
        select: { id: true },
      })
      conversationId = conversation?.id ?? null
    }
  }

  return NextResponse.json({ ...app, conversationId })
}

export async function PATCH(req: NextRequest, { params }: { params: { appId: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const app = await prisma.adoptionApplication.findUnique({ where: { id: params.appId } })
  if (!app) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const membership = await prisma.userOrganization.findUnique({
    where: { userId_organizationId: { userId: session.user.id, organizationId: app.organizationId } },
  })
  if (!membership) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { status, internalNotes, homeCheckDate, homeCheckNotes, homeCheckPassed } = await req.json()

  let updated
  try {
    updated = await prisma.adoptionApplication.update({
      where: { id: params.appId },
      data: {
        status: status ?? app.status,
        internalNotes: internalNotes !== undefined ? internalNotes : app.internalNotes,
        homeCheckDate: homeCheckDate !== undefined ? (homeCheckDate ? new Date(homeCheckDate) : null) : app.homeCheckDate,
        homeCheckNotes: homeCheckNotes !== undefined ? homeCheckNotes : app.homeCheckNotes,
        homeCheckPassed: homeCheckPassed !== undefined ? homeCheckPassed : app.homeCheckPassed,
      },
    })
  } catch (err) {
    console.error("[application PATCH]", err)
    return NextResponse.json({ error: "Failed to update application" }, { status: 500 })
  }

  return NextResponse.json(updated)
}
