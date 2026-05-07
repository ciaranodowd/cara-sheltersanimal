import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "./auth"
import { prisma } from "./prisma"
import { orgStorage, type OrgContext } from "./org-context"
import type { OrgRole } from "@prisma/client"

type OrgHandler<P extends Record<string, string> = Record<string, string>> = (
  req: NextRequest,
  context: { params: P; auth: OrgContext }
) => Promise<NextResponse>

/**
 * Route handler wrapper for org-scoped endpoints.
 *
 * Validates session, checks org membership, then runs the handler inside an
 * AsyncLocalStorage context so that Prisma's $use middleware can automatically
 * scope multi-tenant queries to the current org.
 *
 * Usage:
 *   export const POST = withOrgAuth<{ orgSlug: string }>(async (req, { params, auth }) => {
 *     // auth.orgId, auth.userId, auth.role are available
 *     // Prisma findMany / findFirst queries are automatically scoped to auth.orgId
 *   })
 *
 * Optionally restrict to a minimum role:
 *   withOrgAuth(handler, { minRole: "ADMIN" })
 */
export function withOrgAuth<P extends { orgSlug: string }>(
  handler: OrgHandler<P>,
  options?: { minRole?: OrgRole }
) {
  return async (req: NextRequest, { params }: { params: P }): Promise<NextResponse> => {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const org = await prisma.organization.findUnique({
      where: { slug: params.orgSlug },
      select: { id: true },
    })
    if (!org) {
      return NextResponse.json({ error: "Organisation not found" }, { status: 404 })
    }

    const membership = await prisma.userOrganization.findUnique({
      where: { userId_organizationId: { userId: session.user.id, organizationId: org.id } },
    })
    if (!membership) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    if (options?.minRole) {
      const ROLE_RANK: Record<OrgRole, number> = { ADMIN: 3, STAFF: 2, VOLUNTEER: 1, FOSTER: 0 }
      if ((ROLE_RANK[membership.role] ?? 0) < (ROLE_RANK[options.minRole] ?? 0)) {
        return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
      }
    }

    const auth: OrgContext = {
      orgId: org.id,
      userId: session.user.id,
      role: membership.role,
    }

    return orgStorage.run(auth, () => handler(req, { params, auth }))
  }
}
