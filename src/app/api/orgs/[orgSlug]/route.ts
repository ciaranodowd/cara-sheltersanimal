import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function PATCH(req: NextRequest, { params }: { params: { orgSlug: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const org = await prisma.organization.findUnique({ where: { slug: params.orgSlug } })
  if (!org) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const membership = await prisma.userOrganization.findUnique({
    where: { userId_organizationId: { userId: session.user.id, organizationId: org.id } },
  })
  if (!membership || membership.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { name, email, phone, address, city, county, country, website, chyNumber, description, vetName, vetPhone, coordinatorPhone, donationUrl } = await req.json()

  if (name !== undefined) {
    if (typeof name !== "string" || name.trim().length < 1 || name.trim().length > 200) {
      return NextResponse.json({ error: "Organisation name must be between 1 and 200 characters" }, { status: 400 })
    }
  }
  if (email !== undefined && email !== null && email !== "") {
    if (typeof email !== "string" || !EMAIL_RE.test(email) || email.length > 254) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 })
    }
  }
  if (phone !== undefined && phone !== null && phone !== "") {
    if (typeof phone !== "string" || phone.length > 30) {
      return NextResponse.json({ error: "Phone number is too long" }, { status: 400 })
    }
  }
  if (website !== undefined && website !== null && website !== "") {
    if (typeof website !== "string" || website.length > 500) {
      return NextResponse.json({ error: "Website URL is too long" }, { status: 400 })
    }
    if (!/^https?:\/\//i.test(website)) {
      return NextResponse.json({ error: "Website must start with http:// or https://" }, { status: 400 })
    }
  }
  if (donationUrl !== undefined && donationUrl !== null && donationUrl !== "") {
    if (typeof donationUrl !== "string" || donationUrl.length > 500) {
      return NextResponse.json({ error: "Donation URL is too long" }, { status: 400 })
    }
    if (!/^https?:\/\//i.test(donationUrl)) {
      return NextResponse.json({ error: "Donation URL must start with http:// or https://" }, { status: 400 })
    }
  }
  if (address !== undefined && address !== null && address !== "") {
    if (typeof address !== "string" || address.length > 500) {
      return NextResponse.json({ error: "Address is too long" }, { status: 400 })
    }
  }

  const updated = await prisma.organization.update({
    where: { id: org.id },
    data: {
      name: name !== undefined ? name.trim() : org.name,
      email: email !== undefined ? (email || null) : org.email,
      phone: phone !== undefined ? (phone || null) : org.phone,
      address: address !== undefined ? (address || null) : org.address,
      city: city !== undefined ? (city || null) : org.city,
      county: county !== undefined ? (county || null) : org.county,
      country: country ?? org.country,
      website: website !== undefined ? (website || null) : org.website,
      chyNumber: chyNumber !== undefined ? (chyNumber || null) : org.chyNumber,
      description: description !== undefined ? (description || null) : org.description,
      vetName: vetName !== undefined ? (vetName || null) : org.vetName,
      vetPhone: vetPhone !== undefined ? (vetPhone || null) : org.vetPhone,
      coordinatorPhone: coordinatorPhone !== undefined ? (coordinatorPhone || null) : org.coordinatorPhone,
      donationUrl: donationUrl !== undefined ? (donationUrl || null) : org.donationUrl,
    },
  })

  return NextResponse.json(updated)
}
