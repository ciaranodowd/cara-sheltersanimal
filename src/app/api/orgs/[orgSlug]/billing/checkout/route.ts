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

  let customerId = org.stripeCustomerId ?? null

  // If we have a stored customer ID, verify it exists in the current Stripe mode.
  // A live-mode customer ID used with a test-mode key (or vice versa) throws
  // resource_missing — detect and replace it with a fresh customer rather than crash.
  if (customerId) {
    try {
      const existing = await stripe.customers.retrieve(customerId)
      if ((existing as { deleted?: boolean }).deleted) {
        console.warn(`[checkout] Stripe customer ${customerId} is deleted — creating a new one. org=${org.id}`)
        customerId = null
      }
    } catch (err: any) {
      if (err?.code === "resource_missing") {
        console.warn(
          `[checkout] Replacing stale Stripe customer ${customerId} — ` +
          `it does not exist in the current Stripe mode (live/test mismatch?). org=${org.id}`
        )
        customerId = null
      } else {
        throw err
      }
    }
  }

  if (!customerId) {
    const customer = await stripe.customers.create({
      name: org.name,
      email: org.email ?? undefined,
      metadata: { organizationId: org.id },
    })
    customerId = customer.id
    await prisma.organization.update({
      where: { id: org.id },
      data: { stripeCustomerId: customerId },
    })
    console.info(`[checkout] Created new Stripe customer ${customerId}. org=${org.id}`)
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: process.env.STRIPE_SUBSCRIPTION_PRICE_ID!, quantity: 1 }],
    subscription_data: {
      metadata: { organizationId: org.id },
    },
    success_url: `${baseUrl}/${params.orgSlug}/settings?tab=billing&success=true`,
    cancel_url: `${baseUrl}/${params.orgSlug}/settings?tab=billing`,
    metadata: { organizationId: org.id },
  })

  return NextResponse.json({ url: checkoutSession.url })
}
