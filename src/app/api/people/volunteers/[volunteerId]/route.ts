import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

async function getAndVerify(volunteerId: string, userId: string) {
  const volunteer = await prisma.volunteer.findUnique({ where: { id: volunteerId } })
  if (!volunteer) return null

  const membership = await prisma.userOrganization.findUnique({
    where: { userId_organizationId: { userId, organizationId: volunteer.organizationId } },
  })
  if (!membership) return null

  return { volunteer, membership }
}

export async function PATCH(req: NextRequest, { params }: { params: { volunteerId: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const result = await getAndVerify(params.volunteerId, session.user.id)
  if (!result) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const { volunteer } = result
  const body = await req.json()
  const { firstName, lastName, email, phone, county, notes, isHomeChecker, isDriver, available, hoursLogged } = body

  if (firstName !== undefined) {
    if (typeof firstName !== "string" || firstName.trim().length < 1 || firstName.trim().length > 100) {
      return NextResponse.json({ error: "First name must be between 1 and 100 characters" }, { status: 400 })
    }
  }
  if (lastName !== undefined) {
    if (typeof lastName !== "string" || lastName.trim().length < 1 || lastName.trim().length > 100) {
      return NextResponse.json({ error: "Last name must be between 1 and 100 characters" }, { status: 400 })
    }
  }
  if (email !== undefined) {
    if (typeof email !== "string" || !EMAIL_RE.test(email) || email.length > 254) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 })
    }
    // Check the new email isn't already used by another volunteer in this org
    if (email.toLowerCase().trim() !== volunteer.email) {
      const conflict = await prisma.volunteer.findUnique({
        where: { email_organizationId: { email: email.toLowerCase().trim(), organizationId: volunteer.organizationId } },
      })
      if (conflict) return NextResponse.json({ error: "A volunteer with this email already exists" }, { status: 409 })
    }
  }
  if (phone !== undefined && phone !== null && phone !== "") {
    if (typeof phone !== "string" || phone.length > 30) {
      return NextResponse.json({ error: "Phone number is too long" }, { status: 400 })
    }
  }
  if (hoursLogged !== undefined && hoursLogged !== null) {
    if (isNaN(parseFloat(hoursLogged)) || parseFloat(hoursLogged) < 0) {
      return NextResponse.json({ error: "Hours logged must be a positive number" }, { status: 400 })
    }
  }

  try {
    const updated = await prisma.volunteer.update({
      where: { id: params.volunteerId },
      data: {
        firstName: firstName !== undefined ? firstName.trim() : volunteer.firstName,
        lastName: lastName !== undefined ? lastName.trim() : volunteer.lastName,
        email: email !== undefined ? email.toLowerCase().trim() : volunteer.email,
        phone: phone !== undefined ? (phone || null) : volunteer.phone,
        county: county !== undefined ? (county || null) : volunteer.county,
        notes: notes !== undefined ? (notes || null) : volunteer.notes,
        isHomeChecker: isHomeChecker !== undefined ? Boolean(isHomeChecker) : volunteer.isHomeChecker,
        isDriver: isDriver !== undefined ? Boolean(isDriver) : volunteer.isDriver,
        available: available !== undefined ? Boolean(available) : volunteer.available,
        hoursLogged: hoursLogged !== undefined ? parseFloat(hoursLogged) : volunteer.hoursLogged,
      },
    })
    return NextResponse.json({ ...updated, hoursLogged: Number(updated.hoursLogged) })
  } catch (err) {
    console.error("[volunteer PATCH]", err)
    return NextResponse.json({ error: "Failed to update volunteer" }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { volunteerId: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const result = await getAndVerify(params.volunteerId, session.user.id)
  if (!result) return NextResponse.json({ error: "Not found" }, { status: 404 })

  try {
    await prisma.volunteer.delete({ where: { id: params.volunteerId } })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[volunteer DELETE]", err)
    return NextResponse.json({ error: "Failed to delete volunteer" }, { status: 500 })
  }
}
