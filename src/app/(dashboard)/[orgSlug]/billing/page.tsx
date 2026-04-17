import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { notFound, redirect } from "next/navigation"
import { BillingClient } from "./_components/billing-client"

export const dynamic = "force-dynamic"

export default async function BillingPage({
  params,
  searchParams,
}: {
  params: { orgSlug: string }
  searchParams: { success?: string }
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect("/login")

  const org = await prisma.organization.findUnique({
    where: { slug: params.orgSlug },
    select: {
      id: true,
      name: true,
      slug: true,
      subscriptionStatus: true,
      stripeCustomerId: true,
      stripeSubscriptionId: true,
      trialEndsAt: true,
    },
  })
  if (!org) notFound()

  const membership = await prisma.userOrganization.findUnique({
    where: { userId_organizationId: { userId: session.user.id, organizationId: org.id } },
    select: { role: true },
  })
  if (!membership) notFound()

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Billing</h1>
        <p className="text-muted-foreground text-sm">{org.name}</p>
      </div>
      <BillingClient
        orgSlug={params.orgSlug}
        subscriptionStatus={org.subscriptionStatus}
        trialEndsAt={org.trialEndsAt?.toISOString() ?? null}
        hasStripeCustomer={!!org.stripeCustomerId}
        isAdmin={membership.role === "ADMIN"}
        showSuccess={searchParams.success === "true"}
      />
    </div>
  )
}
