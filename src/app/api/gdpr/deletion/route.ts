import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 })
  }

  const body = await req.json()
  if (body.confirmation !== "DELETE MY ACCOUNT") {
    return NextResponse.json({ error: "Invalid confirmation phrase" }, { status: 400 })
  }

  const userId = session.user.id

  try {
    await prisma.$transaction([
      // Detach from assigned applications (preserve applications for org records)
      prisma.adoptionApplication.updateMany({
        where: { assignedToId: userId },
        data: { assignedToId: null },
      }),
      prisma.adoptionApplication.updateMany({
        where: { homeCheckerId: userId },
        data: { homeCheckerId: null },
      }),
      // Wipe message content, keep conversation structure intact
      prisma.message.updateMany({
        where: { senderId: userId },
        data: { content: "[Message removed – user account deleted]" },
      }),
      // Remove audit trail entries referencing this user
      prisma.activityLog.deleteMany({
        where: { userId },
      }),
      // Remove all org memberships (revokes all dashboard access)
      prisma.userOrganization.deleteMany({
        where: { userId },
      }),
      // Delete user — Prisma onDelete: Cascade removes Account and Session rows
      prisma.user.delete({
        where: { id: userId },
      }),
    ])
  } catch (err) {
    console.error("[gdpr deletion]", err)
    return NextResponse.json({ error: "Account deletion failed. Please contact support." }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
