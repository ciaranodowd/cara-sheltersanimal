import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import {
  sendApplicationApprovedEmail,
  sendApplicationRejectedEmail,
  sendMeetGreetScheduledEmail,
  sendAdoptionCompleteEmail,
} from "@/lib/email-workflows"

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

  const app = await prisma.adoptionApplication.findUnique({
    where: { id: params.appId },
    include: {
      animal: { select: { name: true } },
      organization: { select: { name: true, slug: true, email: true, address: true, city: true, county: true } },
    },
  })
  if (!app) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const membership = await prisma.userOrganization.findUnique({
    where: { userId_organizationId: { userId: session.user.id, organizationId: app.organizationId } },
  })
  if (!membership) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { status, internalNotes, homeCheckDate, homeCheckNotes, homeCheckPassed } = await req.json()

  const statusChanging = status !== undefined && status !== app.status

  let updated
  try {
    updated = await prisma.adoptionApplication.update({
      where: { id: params.appId },
      data: {
        status: status ?? app.status,
        // Set completedAt only on the first transition to COMPLETED
        ...(status === "COMPLETED" && !app.completedAt ? { completedAt: new Date() } : {}),
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

  // Send automated emails on status transitions — fire-and-forget so email failure
  // never rolls back or blocks the shelter staff's action.
  if (statusChanging) {
    const isFoster = app.applicationType === "FOSTER"
    const animalName = app.animal.name
    const { name: orgName, slug: orgSlug, email: orgEmail, address, city, county } = app.organization
    const orgAddress = [address, city, county].filter(Boolean).join(", ") || null

    if (status === "APPROVED") {
      sendApplicationApprovedEmail({
        to: app.applicantEmail,
        applicantName: app.applicantName,
        animalName,
        orgName,
        orgSlug,
        isFoster,
      }).catch(err => console.error("[app PATCH] approved email failed:", err))

    } else if (status === "REJECTED") {
      sendApplicationRejectedEmail({
        to: app.applicantEmail,
        applicantName: app.applicantName,
        animalName,
        orgName,
        orgSlug,
        isFoster,
      }).catch(err => console.error("[app PATCH] rejected email failed:", err))

    } else if (status === "HOME_CHECK_SCHEDULED") {
      sendMeetGreetScheduledEmail({
        to: app.applicantEmail,
        applicantName: app.applicantName,
        animalName,
        orgName,
        orgAddress,
        homeCheckDate: updated.homeCheckDate,
      }).catch(err => console.error("[app PATCH] meet & greet email failed:", err))

    } else if (status === "COMPLETED" && !isFoster) {
      // Only for adoption completions via the PATCH route (e.g. no contract).
      // Contract-signing completions are handled by sendSignedContractEmails in sign/[token]/route.ts.
      sendAdoptionCompleteEmail({
        to: app.applicantEmail,
        adopterName: app.applicantName,
        animalName,
        orgName,
        orgEmail,
      }).catch(err => console.error("[app PATCH] adoption complete email failed:", err))
    }
  }

  return NextResponse.json(updated)
}
