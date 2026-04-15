import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

async function getOrgAndVerify(orgSlug: string, userId: string) {
  const org = await prisma.organization.findUnique({ where: { slug: orgSlug } })
  if (!org) return null
  const membership = await prisma.userOrganization.findUnique({
    where: { userId_organizationId: { userId, organizationId: org.id } },
  })
  if (!membership) return null
  return { org, membership }
}

export async function GET(req: NextRequest, { params }: { params: { orgSlug: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const result = await getOrgAndVerify(params.orgSlug, session.user.id)
  if (!result) return NextResponse.json({ error: "Not found" }, { status: 404 })

  return NextResponse.json({ contractTemplate: result.org.contractTemplate ?? "" })
}

export async function PATCH(req: NextRequest, { params }: { params: { orgSlug: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const result = await getOrgAndVerify(params.orgSlug, session.user.id)
  if (!result) return NextResponse.json({ error: "Not found" }, { status: 404 })
  if (result.membership.role !== "ADMIN") return NextResponse.json({ error: "Admins only" }, { status: 403 })

  const { contractTemplate } = await req.json()

  const updated = await prisma.organization.update({
    where: { slug: params.orgSlug },
    data: { contractTemplate: contractTemplate ?? null },
  })

  return NextResponse.json({ contractTemplate: updated.contractTemplate ?? "" })
}
