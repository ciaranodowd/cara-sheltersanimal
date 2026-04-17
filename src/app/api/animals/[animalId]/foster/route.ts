import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { sendFosterInviteEmail } from "@/lib/email"

export async function POST(req: NextRequest, { params }: { params: { animalId: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { fosterId, startDate, endDate, notes } = body

  if (!fosterId || !startDate) {
    return NextResponse.json({ error: "Foster and start date are required" }, { status: 400 })
  }

  const animal = await prisma.animal.findUnique({
    where: { id: params.animalId },
    select: { organizationId: true, name: true },
  })
  if (!animal) return NextResponse.json({ error: "Animal not found" }, { status: 404 })

  const membership = await prisma.userOrganization.findUnique({
    where: { userId_organizationId: { userId: session.user.id, organizationId: animal.organizationId } },
  })
  if (!membership) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const [foster, org] = await Promise.all([
    prisma.foster.findUnique({
      where: { id: fosterId },
      select: { firstName: true, lastName: true, email: true, organizationId: true },
    }),
    prisma.organization.findUnique({
      where: { id: animal.organizationId },
      select: { name: true },
    }),
  ])

  if (!foster) return NextResponse.json({ error: "Foster not found" }, { status: 404 })

  // Prevent cross-organisation IDOR: ensure the foster belongs to the same org as the animal
  if (foster.organizationId !== animal.organizationId) {
    return NextResponse.json({ error: "Foster not found" }, { status: 404 })
  }

  const fosterPortalToken = crypto.randomUUID()

  const assignment = await prisma.fosterAssignment.create({
    data: {
      organizationId: animal.organizationId,
      animalId: params.animalId,
      fosterId,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
      notes: notes || null,
      status: "ACTIVE",
      fosterPortalToken,
    },
  })

  // Update animal status to FOSTERED
  await prisma.animal.update({
    where: { id: params.animalId },
    data: { status: "FOSTERED" },
  })

  // Send foster invite email (non-fatal)
  try {
    const baseUrl = process.env.NEXTAUTH_URL ?? "https://cara.ie"
    await sendFosterInviteEmail({
      to: foster.email,
      fosterName: `${foster.firstName} ${foster.lastName}`,
      animalName: animal.name,
      orgName: org?.name ?? "the shelter",
      portalUrl: `${baseUrl}/foster/${fosterPortalToken}`,
    })
  } catch (err) {
    console.error("Failed to send foster invite email:", err)
  }

  return NextResponse.json(assignment, { status: 201 })
}
