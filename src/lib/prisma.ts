import { PrismaClient } from "@prisma/client"
import { getOrgContext } from "./org-context"

// Models that carry organizationId and should be automatically scoped
const TENANTED_MODELS = new Set([
  "Animal", "Location", "Adopter", "Volunteer", "Donor",
  "AdoptionApplication", "AdoptionContract", "Donation", "Campaign",
  "EmailTemplate", "GdprRequest", "ActivityLog", "UserOrganization", "Invite",
])

// Operations that accept an arbitrary `where` clause
const FILTERABLE_OPS = new Set([
  "findMany", "findFirst", "findFirstOrThrow",
  "count", "aggregate", "groupBy",
  "updateMany", "deleteMany",
])

function createPrismaClient() {
  const client = new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  })

  // Automatically scope multi-tenant queries to the org set by withOrgAuth.
  // findUnique/update/delete by ID are intentionally excluded — route handlers
  // must verify ownership themselves for those operations.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(client as any).$use(async (params: any, next: any) => {
    const ctx = getOrgContext()
    if (
      ctx &&
      params.model &&
      TENANTED_MODELS.has(params.model) &&
      FILTERABLE_OPS.has(params.action)
    ) {
      params.args ??= {}
      params.args.where = { ...params.args.where, organizationId: ctx.orgId }
    }
    return next(params)
  })

  return client
}

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
