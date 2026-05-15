import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(
  req: NextRequest,
  { params }: { params: { orgSlug: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const org = await prisma.organization.findUnique({
    where: { slug: params.orgSlug },
    select: { id: true, stripeOnboarded: true, donationsEnabled: true },
  })
  if (!org) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const membership = await prisma.userOrganization.findUnique({
    where: { userId_organizationId: { userId: session.user.id, organizationId: org.id } },
  })
  if (!membership || membership.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { enabled } = await req.json() as { enabled: boolean }

  if (enabled && !org.stripeOnboarded) {
    return NextResponse.json(
      { error: "Complete Stripe Connect onboarding before enabling donations." },
      { status: 422 }
    )
  }

  const updated = await prisma.organization.update({
    where: { id: org.id },
    data: { donationsEnabled: enabled },
    select: { donationsEnabled: true },
  })

  return NextResponse.json({ donationsEnabled: updated.donationsEnabled })
}
