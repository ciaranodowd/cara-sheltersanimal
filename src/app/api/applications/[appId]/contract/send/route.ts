import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { sendContractSigningEmail } from "@/lib/email"

export async function POST(req: NextRequest, { params }: { params: { appId: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const app = await prisma.adoptionApplication.findUnique({
    where: { id: params.appId },
    include: {
      contract: true,
      animal: { select: { name: true } },
      organization: { select: { name: true, email: true } },
    },
  })
  if (!app) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const membership = await prisma.userOrganization.findUnique({
    where: { userId_organizationId: { userId: session.user.id, organizationId: app.organizationId } },
  })
  if (!membership) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  if (!app.contract) return NextResponse.json({ error: "Save the contract first before sending" }, { status: 400 })
  if (app.contract.signedAt) return NextResponse.json({ error: "Contract already signed" }, { status: 400 })

  // Generate a fresh token (allow re-sending)
  const signingToken = crypto.randomUUID()
  const sentAt = new Date()

  await prisma.adoptionContract.update({
    where: { applicationId: params.appId },
    data: { signingToken, sentAt },
  })

  await prisma.adoptionApplication.update({
    where: { id: params.appId },
    data: { status: "CONTRACT_SENT" },
  })

  // Mark animal as adoption-pending so it stops appearing as available
  // on the public portal while the contract is out for signing
  await prisma.animal.update({
    where: { id: app.animalId },
    data: { status: "ADOPTION_PENDING" },
  })

  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000"
  const signingUrl = `${baseUrl}/sign/${signingToken}`

  try {
    await sendContractSigningEmail({
      to: app.applicantEmail,
      adopterName: app.applicantName,
      animalName: app.animal.name,
      orgName: app.organization.name,
      signingUrl,
    })
  } catch (err) {
    console.error("Failed to send contract email:", err)
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: `Email failed: ${message}` }, { status: 500 })
  }

  return NextResponse.json({ ok: true, sentAt, signingUrl })
}
