import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getStripe } from "@/lib/stripe"

export async function GET(
  req: NextRequest,
  { params }: { params: { orgSlug: string } }
) {
  const session = await getServerSession(authOptions)
  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000"
  const settingsUrl = `${baseUrl}/${params.orgSlug}/settings?tab=donations`

  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  const org = await prisma.organization.findUnique({ where: { slug: params.orgSlug } })
  if (!org?.stripeAccountId) {
    return NextResponse.redirect(settingsUrl)
  }

  const membership = await prisma.userOrganization.findUnique({
    where: { userId_organizationId: { userId: session.user.id, organizationId: org.id } },
  })
  if (!membership || membership.role !== "ADMIN") {
    return NextResponse.redirect(settingsUrl)
  }

  const stripe = getStripe()

  const accountLink = await stripe.accountLinks.create({
    account: org.stripeAccountId,
    refresh_url: `${baseUrl}/api/orgs/${params.orgSlug}/stripe/connect/refresh`,
    return_url: settingsUrl,
    type: "account_onboarding",
  })

  return NextResponse.redirect(accountLink.url)
}
