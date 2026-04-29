import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { slugify } from "@/lib/utils"

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { name, email, phone, address, city, county, country, website, chyNumber, description } = await req.json()
  if (!name || !email) return NextResponse.json({ error: "Name and email are required" }, { status: 400 })

  // Generate unique slug
  const baseSlug = slugify(name)
  let slug = baseSlug
  let suffix = 1
  while (await prisma.organization.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${suffix++}`
  }

  const now = new Date()
  const trialEndsAt = new Date(now)
  trialEndsAt.setDate(trialEndsAt.getDate() + 30)

  const baseData = {
    name,
    slug,
    email,
    phone: phone || null,
    address: address || null,
    city: city || null,
    county: county || null,
    country: country || "IE",
    website: website || null,
    chyNumber: chyNumber || null,
    description: description || null,
    subscriptionStatus: "TRIALING" as const,
    trialEndsAt,
    users: { create: { userId: session.user.id, role: "ADMIN" as const } },
  }

  // Try to set new billing columns; if SQL migration not yet run the create
  // will fail on unknown columns — fall back to base data only.
  let org
  try {
    org = await prisma.organization.create({
      data: { ...baseData, trialStartDate: now, trialEndDate: trialEndsAt, plan: "trial", planStatus: "active" },
    })
  } catch {
    org = await prisma.organization.create({ data: baseData })
  }

  return NextResponse.json({ slug: org.slug }, { status: 201 })
}
