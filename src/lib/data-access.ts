import { cache } from "react"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// React cache() deduplicates each call within a single server render pass.
// Both the layout and its child page call these — without cache() that means
// 6 redundant DB round-trips per navigation (session + org + membership × 2).
// With cache() they each run exactly once per request.

export const getSession = cache(() => getServerSession(authOptions))

type OrgBasic = {
  id: string
  name: string
  slug: string
  plan?: string | null
  trialEndDate?: Date | null
  trialEndsAt?: Date | null
  subscriptionStatus?: string | null
  cancelAt?: Date | null
  cancelAtPeriodEnd?: boolean | null
} | null

export const getOrgBySlug = cache(async (slug: string): Promise<OrgBasic> => {
  try {
    return await prisma.organization.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
        plan: true,
        trialEndDate: true,
        trialEndsAt: true,
        subscriptionStatus: true,
        cancelAt: true,
        cancelAtPeriodEnd: true,
      },
    })
  } catch {
    return prisma.organization.findUnique({
      where: { slug },
      select: { id: true, name: true, slug: true, trialEndsAt: true },
    }).catch(() => null)
  }
})

export const getUserMembership = cache((userId: string, orgId: string) =>
  prisma.userOrganization.findUnique({
    where: { userId_organizationId: { userId, organizationId: orgId } },
    select: { role: true },
  }).catch(() => null)
)
