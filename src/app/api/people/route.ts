import { NextRequest, NextResponse } from "next/server"
import { randomBytes, createHash } from "crypto"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { sendInviteEmail } from "@/lib/email"

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { organizationId, type, firstName, lastName, email, phone, address, notes, inviteToDashboard } = body

  if (!organizationId || !type || !firstName || !lastName || !email) {
    return NextResponse.json({ error: "First name, last name, and email are required" }, { status: 400 })
  }

  const membership = await prisma.userOrganization.findUnique({
    where: { userId_organizationId: { userId: session.user.id, organizationId } },
  })
  if (!membership) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const common = {
    organizationId,
    firstName,
    lastName,
    email,
    phone: phone || null,
    notes: notes || null,
  }

  try {
    if (type === "adopter") {
      const existing = await prisma.adopter.findUnique({ where: { email_organizationId: { email, organizationId } } })
      if (existing) return NextResponse.json({ error: "An adopter with this email already exists" }, { status: 409 })

      const adopter = await prisma.adopter.create({ data: { ...common, address: address || null } })
      return NextResponse.json(adopter, { status: 201 })
    }

    if (type === "donor") {
      const existing = await prisma.donor.findUnique({ where: { email_organizationId: { email, organizationId } } })
      if (existing) return NextResponse.json({ error: "A donor with this email already exists" }, { status: 409 })

      const donor = await prisma.donor.create({ data: { ...common } })
      return NextResponse.json(donor, { status: 201 })
    }

    if (type === "volunteer") {
      const existing = await prisma.volunteer.findUnique({ where: { email_organizationId: { email, organizationId } } })
      if (existing) return NextResponse.json({ error: "A volunteer with this email already exists" }, { status: 409 })

      const volunteer = await prisma.volunteer.create({ data: { ...common, skills: "[]" } })

      if (inviteToDashboard) {
        const org = await prisma.organization.findUnique({
          where: { id: organizationId },
          select: { name: true },
        })
        if (!org) return NextResponse.json({ ...volunteer, inviteSent: false }, { status: 201 })

        // Find or create a User account for this volunteer's email
        let user = await prisma.user.findUnique({ where: { email } })
        const isNewUser = !user
        if (!user) {
          user = await prisma.user.create({
            data: { email, name: `${firstName} ${lastName}`.trim() },
          })
        }

        // If they're already a member of this org they already have access
        const existingOrgMembership = await prisma.userOrganization.findUnique({
          where: { userId_organizationId: { userId: user.id, organizationId } },
        })
        if (existingOrgMembership) {
          return NextResponse.json({ ...volunteer, inviteSent: false, alreadyHasAccess: true }, { status: 201 })
        }

        // Grant VOLUNTEER role on this org
        await prisma.userOrganization.create({
          data: { userId: user.id, organizationId, role: "VOLUNTEER" },
        })

        // If they already have a password they can log in — no invite token needed
        if (user.password) {
          return NextResponse.json({ ...volunteer, inviteSent: false, alreadyHasAccess: true }, { status: 201 })
        }

        // New account — generate a hashed invite token and send the setup email
        const rawToken = randomBytes(32).toString("hex")
        const tokenHash = createHash("sha256").update(rawToken).digest("hex")
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

        await prisma.passwordResetToken.deleteMany({ where: { userId: user.id, usedAt: null } })
        await prisma.passwordResetToken.create({ data: { userId: user.id, token: tokenHash, expiresAt } })

        try {
          await sendInviteEmail({ to: email, orgName: org.name, token: rawToken })
          return NextResponse.json({ ...volunteer, inviteSent: true }, { status: 201 })
        } catch (emailErr) {
          console.error("[people invite] Failed to send invite email to", email, emailErr)
          // Roll back the invite artifacts — the volunteer contact record is kept
          await prisma.passwordResetToken.deleteMany({ where: { userId: user.id, usedAt: null } })
          await prisma.userOrganization.deleteMany({ where: { userId: user.id, organizationId } })
          if (isNewUser) await prisma.user.delete({ where: { id: user.id } })
          return NextResponse.json({ ...volunteer, inviteSent: false, inviteError: true }, { status: 201 })
        }
      }

      return NextResponse.json(volunteer, { status: 201 })
    }
  } catch (err) {
    console.error("[people POST]", err)
    return NextResponse.json({ error: "Failed to create record" }, { status: 500 })
  }

  return NextResponse.json({ error: "Invalid person type" }, { status: 400 })
}
