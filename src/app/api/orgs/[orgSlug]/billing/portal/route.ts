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
      console.warn(
        `[billing-portal] Stale Stripe customer ${org.stripeCustomerId} detected — ` +
        `does not exist in the current Stripe mode (live/test mismatch?). org=${org.id}`
      )
      return NextResponse.json(
        { error: "Billing account not available. Please re-subscribe to continue." },
        { status: 400 }
      )
    }
    throw err
  }

  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000"

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: org.stripeCustomerId,
    return_url: `${baseUrl}/${params.orgSlug}/billing`,
  })

  return NextResponse.json({ url: portalSession.url })
}
