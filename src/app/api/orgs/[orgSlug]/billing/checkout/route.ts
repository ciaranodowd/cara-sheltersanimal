/*
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

  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000"

  let customerId = org.stripeCustomerId
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
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [
      {
        price: process.env.STRIPE_SUBSCRIPTION_PRICE_ID!,
        quantity: 1,
      },
    ],
    subscription_data: {
      trial_period_days: 30,
      metadata: { organizationId: org.id },
    },
    success_url: `${baseUrl}/${params.orgSlug}/billing?success=true`,
    cancel_url: `${baseUrl}/${params.orgSlug}/billing/upgrade`,
    metadata: { organizationId: org.id, type: "subscription" },
  })

  return NextResponse.json({ url: checkoutSession.url })
}
*/

import { NextResponse } from "next/server"

export async function POST() {
  return NextResponse.json({ error: "Billing temporarily disabled" }, { status: 503 })
}
