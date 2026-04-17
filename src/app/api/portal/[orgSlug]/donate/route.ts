import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getStripe } from "@/lib/stripe"

export async function POST(
  req: NextRequest,
  { params }: { params: { orgSlug: string } }
) {
  const org = await prisma.organization.findUnique({
    where: { slug: params.orgSlug },
    select: { id: true, name: true, slug: true },
  })
  if (!org) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const body = await req.json()
  const { amount, donorName, donorEmail } = body as {
    amount: number
    donorName?: string
    donorEmail?: string
  }

  if (!amount || typeof amount !== "number" || amount < 1) {
    return NextResponse.json({ error: "Amount must be at least €1" }, { status: 400 })
  }

  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000"

  const session = await getStripe().checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "eur",
          unit_amount: Math.round(amount * 100),
          product_data: {
            name: `Donation to ${org.name}`,
            description: `Your donation supports animals at ${org.name}`,
          },
        },
        quantity: 1,
      },
    ],
    success_url: `${baseUrl}/portal/${org.slug}/donate/thank-you?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/portal/${org.slug}`,
    metadata: {
      organizationId: org.id,
      type: "donation",
      donorName: donorName ?? "",
      donorEmail: donorEmail ?? "",
    },
    customer_email: donorEmail ?? undefined,
    submit_type: "donate",
  })

  return NextResponse.json({ url: session.url })
}
