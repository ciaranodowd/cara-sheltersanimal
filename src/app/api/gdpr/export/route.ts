import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 })
  }

  const userId = session.user.id

  const [user, memberships, messages, activityLog] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.userOrganization.findMany({
      where: { userId },
      include: { organization: { select: { name: true, slug: true } } },
    }),
    prisma.message.findMany({
      where: { senderId: userId },
      select: { id: true, content: true, createdAt: true, conversationId: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.activityLog.findMany({
      where: { userId },
      select: { id: true, action: true, entityType: true, entityId: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    }),
  ])

  const exportData = {
    exportedAt: new Date().toISOString(),
    exportedBy: "Cara — carashelters.ie",
    gdprNote:
      "This file contains all personal data held about you under GDPR Article 20 (Right to Data Portability). Requested by the account holder.",
    profile: user,
    organisationMemberships: memberships.map(m => ({
      organisation: m.organization.name,
      slug: m.organization.slug,
      role: m.role,
      joinedAt: m.joinedAt,
    })),
    messages,
    activityLog,
  }

  const date = new Date().toISOString().split("T")[0]
  return new NextResponse(JSON.stringify(exportData, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="cara-data-export-${date}.json"`,
    },
  })
}
