import { NextRequest, NextResponse } from "next/server"
import { randomBytes, createHash } from "crypto"
import { getServerSession } from "next-auth"
import { OrgRole } from "@prisma/client"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { sendInviteEmail } from "@/lib/email"

export async function POST(req: NextRequest, { params }: { params: { orgSlug: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const org = await prisma.organization.findUnique({ where: { slug: params.orgSlug } })
  if (!org) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const membership = await prisma.userOrganization.findUnique({
    where: { userId_organizationId: { userId: session.user.id, organizationId: org.id } },
  })
  if (!membership || membership.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  let email: string | undefined
  let role: OrgRole | undefined
  try {
    const body = await req.json()
    email = typeof body?.email === "string" ? body.email.toLowerCase().trim() : undefined
    const rawRole = body?.role
    role = Object.values(OrgRole).includes(rawRole) ? (rawRole as OrgRole) : undefined
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 })

  const existingUser = await prisma.user.findUnique({ where: { email } })

  if (existingUser) {
    const alreadyMember = await prisma.userOrganization.findUnique({
      where: { userId_organizationId: { userId: existingUser.id, organizationId: org.id } },
    })
    if (alreadyMember) {
      return NextResponse.json({ error: "This person is already a member" }, { status: 400 })
    }

    await prisma.userOrganization.create({
      data: { userId: existingUser.id, organizationId: org.id, role: role ?? "STAFF" },
    })
    return NextResponse.json({ success: true })
  }

  // New user: create account, issue a password-setup token, send invite email
  const newUser = await prisma.user.create({ data: { email } })

  await prisma.userOrganization.create({
    data: { userId: newUser.id, organizationId: org.id, role: role ?? "STAFF" },
  })

  const rawToken = randomBytes(32).toString("hex")
  const tokenHash = createHash("sha256").update(rawToken).digest("hex")
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

  await prisma.passwordResetToken.create({
    data: { userId: newUser.id, token: tokenHash, expiresAt },
  })

  try {
    await sendInviteEmail({ to: email, orgName: org.name, token: rawToken })
  } catch (emailErr) {
    console.error("[invite] Failed to send invite email:", emailErr)
    // Roll back: delete the token, membership, and placeholder user
    await prisma.passwordResetToken.deleteMany({ where: { userId: newUser.id } })
    await prisma.userOrganization.deleteMany({ where: { userId: newUser.id } })
    await prisma.user.delete({ where: { id: newUser.id } })
    return NextResponse.json(
      { error: "Failed to send invite email. Please try again." },
      { status: 502 }
    )
  }

  return NextResponse.json({ success: true })
}
