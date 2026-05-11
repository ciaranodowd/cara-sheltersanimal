import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getStripe } from "@/lib/stripe"

export async function POST(
  req: NextRequest,
  { params }: { params: { orgSlug: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const org = await prisma.organization.findUnique({ where: { slug: params.orgSlug } })
  if (!org) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const membership = await prisma.userOrganization.findUnique({
    where: { userId_organizationId: { userId: session.user.id, organizationId: org.id } },
  })
  if (!membership || membership.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const stripe = getStripe()
  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000"

  let accountId = org.stripeAccountId

  if (!accountId) {
    const account = await stripe.accounts.create({
      type: "express",
      email: org.email ?? undefined,
      business_profile: {
        name: org.name,
      },
      metadata: { organizationId: org.id },
    })
    accountId = account.id
    await prisma.organization.update({
      where: { id: org.id },
      data: { stripeAccountId: accountId },
    })
  }

  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${baseUrl}/api/orgs/${params.orgSlug}/stripe/connect/refresh`,
    return_url: `${baseUrl}/${params.orgSlug}/settings?tab=donations`,
    type: "account_onboarding",
  })

  return NextResponse.json({ url: accountLink.url })
}
