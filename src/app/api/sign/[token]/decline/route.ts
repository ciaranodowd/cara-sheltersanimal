import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendDeclineNotificationEmail } from "@/lib/email"
import { rateLimiters, checkRateLimit } from "@/lib/ratelimit"

export async function POST(req: NextRequest, { params }: { params: { token: string } }) {
  try {
    const limited = await checkRateLimit(rateLimiters.contractSigning, params.token)
    if (limited) return limited
  } catch (err) {
    console.error("Rate limit check failed:", err)
  }

  const contract = await prisma.adoptionContract.findUnique({
    where: { signingToken: params.token },
    include: {
      application: { select: { applicantName: true, applicantEmail: true } },
      animal: { select: { name: true } },
      organization: { select: { email: true } },
    },
  })

  if (!contract) return NextResponse.json({ error: "Not found" }, { status: 404 })
  if (contract.signedAt) return NextResponse.json({ error: "Contract already signed" }, { status: 409 })
  if (contract.tokenExpiresAt && contract.tokenExpiresAt < new Date()) {
    return NextResponse.json({ error: "This signing link has expired." }, { status: 410 })
  }

  const { message } = await req.json()
  if (!message?.trim()) return NextResponse.json({ error: "Message is required" }, { status: 400 })
  if (typeof message !== "string" || message.trim().length > 2000) {
    return NextResponse.json({ error: "Message must be under 2000 characters" }, { status: 400 })
  }

  if (!contract.organization.email) {
    return NextResponse.json({ error: "Organisation has no contact email configured" }, { status: 422 })
  }

  await sendDeclineNotificationEmail({
    orgEmail: contract.organization.email,
    adopterName: contract.application.applicantName,
    adopterEmail: contract.application.applicantEmail,
    animalName: contract.animal.name,
    message: message.trim(),
  })

  return NextResponse.json({ ok: true })
}
