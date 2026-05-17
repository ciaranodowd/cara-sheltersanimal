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

  const org = await prisma.organization.findUnique({
    where: { slug: params.orgSlug },
  })
  if (!org) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const membership = await prisma.userOrganization.findUnique({
    where: { userId_organizationId: { userId: session.user.id, organizationId: org.id } },
  })
  if (!membership || membership.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  if (!org.stripeCustomerId) {
    return NextResponse.json({ error: "No billing account found. Please subscribe first." }, { status: 400 })
  }

  const stripe = getStripe()

  // Verify the customer exists in the current Stripe mode before creating a portal
  // session. A live-mode ID used with a test-mode key (or vice versa) would fail
  // with resource_missing — return a clear error rather than a 500.
  try {
    const existing = await stripe.customers.retrieve(org.stripeCustomerId)
    if ((existing as { deleted?: boolean }).deleted) {
      console.warn(`[billing-portal] Stripe customer ${org.stripeCustomerId} is deleted. org=${org.id}`)
      return NextResponse.json(
        { error: "Billing account not found. Please contact support." },
        { status: 400 }
      )
    }
  } catch (err: any) {
    if (err?.code === "resource_missing") {
      console.log(
        `[billing-portal] stale customer ${org.stripeCustomerId} not found in current Stripe mode — ` +
        `creating new live customer for org=${org.slug}`
      )
      const newCustomer = await stripe.customers.create({
        email: org.email ?? undefined,
        name: org.name,
        metadata: { organizationId: org.id },
      })
      await prisma.organization.update({
        where: { id: org.id },
        data: { stripeCustomerId: newCustomer.id },
      })
      org.stripeCustomerId = newCustomer.id
      console.log(`[billing-portal] created new live customer ${newCustomer.id} for org=${org.slug}`)
    } else {
      throw err
    }
  }

  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000"

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: org.stripeCustomerId,
    return_url: `${baseUrl}/${params.orgSlug}/billing`,
  })

  return NextResponse.json({ url: portalSession.url })
}
