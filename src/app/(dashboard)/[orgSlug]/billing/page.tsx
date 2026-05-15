import { prisma } from "@/lib/prisma"
import { notFound, redirect } from "next/navigation"
import { getSession, getOrgBySlug, getUserMembership } from "@/lib/data-access"
import { BillingClient } from "./_components/billing-client"

export const dynamic = "force-dynamic"

export default async function BillingPage({
  params,
}: {
  params: { orgSlug: string }
}) {
  const [session, cachedOrg] = await Promise.all([
    getSession(),
    getOrgBySlug(params.orgSlug),
  ])
  if (!session?.user?.id) redirect("/login")
  if (!cachedOrg) notFound()

  type OrgRow = {
    id: string
    name: string
    slug: string
    plan?: string | null
    planStatus?: string | null
    trialEndDate?: Date | null
    trialEndsAt?: Date | null
    subscriptionStatus?: string | null
    cancelAt?: Date | null
    cancelAtPeriodEnd?: boolean | null
  }
  let org: OrgRow | null = null
  try {
    org = await prisma.organization.findUnique({
      where: { slug: params.orgSlug },
      select: {
        id: true,
        name: true,
        slug: true,
        plan: true,
        planStatus: true,
        trialEndDate: true,
        trialEndsAt: true,
        subscriptionStatus: true,
        cancelAt: true,
        cancelAtPeriodEnd: true,
      },
    })
  } catch {
    org = await prisma.organization.findUnique({
      where: { slug: params.orgSlug },
      select: { id: true, name: true, slug: true, trialEndsAt: true },
    }).catch(() => null)
  }
  if (!org) notFound()

  const membership = await getUserMembership(session.user.id, org.id)
  if (!membership) notFound()

  const effectiveTrialEnd = org.trialEndDate ?? org.trialEndsAt

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Billing</h1>
        <p className="text-muted-foreground text-sm">{org.name}</p>
      </div>
      <BillingClient
        orgSlug={params.orgSlug}
        plan={org.plan ?? "trial"}
        planStatus={org.planStatus ?? "active"}
        trialEndDate={effectiveTrialEnd?.toISOString() ?? null}
        subscriptionStatus={org.subscriptionStatus ?? null}
        cancelAt={org.cancelAt?.toISOString() ?? null}
        cancelAtPeriodEnd={org.cancelAtPeriodEnd ?? false}
        isAdmin={membership!.role === "ADMIN"}
      />
    </div>
  )
}
