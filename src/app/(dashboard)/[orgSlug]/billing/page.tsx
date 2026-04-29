import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { notFound, redirect } from "next/navigation"
import { BillingClient } from "./_components/billing-client"

export const dynamic = "force-dynamic"

export default async function BillingPage({
  params,
}: {
  params: { orgSlug: string }
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect("/login")

  type OrgRow = { id: string; name: string; slug: string; plan?: string; planStatus?: string; trialEndDate?: Date | null; trialEndsAt?: Date | null }
  let org: OrgRow | null = null
  try {
    org = await prisma.organization.findUnique({
      where: { slug: params.orgSlug },
      select: { id: true, name: true, slug: true, plan: true, planStatus: true, trialEndDate: true, trialEndsAt: true },
    })
  } catch {
    // Fallback if SQL migration not yet run
    org = await prisma.organization.findUnique({
      where: { slug: params.orgSlug },
      select: { id: true, name: true, slug: true, trialEndsAt: true },
    }).catch(() => null)
  }
  if (!org) notFound()

  const membership = await prisma.userOrganization.findUnique({
    where: { userId_organizationId: { userId: session.user.id, organizationId: org.id } },
    select: { role: true },
  }).catch(() => null)
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
        isAdmin={membership!.role === "ADMIN"}
      />
    </div>
  )
}
