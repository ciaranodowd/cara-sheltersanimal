import { prisma } from "@/lib/prisma"
import { notFound, redirect } from "next/navigation"
import { getSession, getOrgBySlug } from "@/lib/data-access"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { OrgSettingsForm } from "./_components/org-settings-form"
import { TeamSettings } from "./_components/team-settings"
import { GdprSettings } from "./_components/gdpr-settings"
import { ContractTemplateSettings } from "./_components/contract-template-settings"
import { BillingSettings } from "./_components/billing-settings"
import { DonationsSettings } from "./_components/donations-settings"

export const dynamic = 'force-dynamic'

export default async function SettingsPage({
  params,
  searchParams,
}: {
  params: { orgSlug: string }
  searchParams: { tab?: string }
}) {
  const [session] = await Promise.all([getSession(), getOrgBySlug(params.orgSlug)])
  if (!session?.user?.id) redirect("/login")

  // Settings needs the full org with users — use its own query alongside the cached lookup
  let org
  try {
    org = await prisma.organization.findUnique({
      where: { slug: params.orgSlug },
      include: {
        users: {
          include: { user: { select: { id: true, name: true, email: true, image: true } } },
        },
      },
    })
  } catch {
    notFound()
  }
  if (!org) notFound()

  const membership = org.users.find((u: any) => u.userId === session.user.id)
  if (!membership) notFound()

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground text-sm">{org.name}</p>
      </div>

      <Tabs defaultValue={searchParams.tab ?? "general"}>
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="contracts">Contracts</TabsTrigger>
          <TabsTrigger value="gdpr">GDPR</TabsTrigger>
          <TabsTrigger value="donations">Donations</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-4">
          <OrgSettingsForm org={org} isAdmin={membership.role === "ADMIN"} />
        </TabsContent>

        <TabsContent value="team" className="mt-4">
          <TeamSettings org={org} members={org.users} currentUserId={session.user.id} isAdmin={membership.role === "ADMIN"} />
        </TabsContent>

        <TabsContent value="contracts" className="mt-4">
          <ContractTemplateSettings
            orgSlug={params.orgSlug}
            initialTemplate={org.contractTemplate ?? ""}
            isAdmin={membership.role === "ADMIN"}
          />
        </TabsContent>

        <TabsContent value="gdpr" className="mt-4">
          <GdprSettings orgId={org.id} orgSlug={params.orgSlug} />
        </TabsContent>

        <TabsContent value="donations" className="mt-4">
          <DonationsSettings
            orgSlug={params.orgSlug}
            donationUrl={org.donationUrl ?? null}
            isAdmin={membership.role === "ADMIN"}
          />
        </TabsContent>

        <TabsContent value="billing" className="mt-4">
          <BillingSettings
            orgSlug={params.orgSlug}
            subscriptionStatus={org.subscriptionStatus}
            stripeCustomerId={org.stripeCustomerId ?? null}
            trialEndsAt={org.trialEndsAt ?? null}
            cancelAt={org.cancelAt ?? null}
            cancelAtPeriodEnd={org.cancelAtPeriodEnd ?? false}
            isAdmin={membership.role === "ADMIN"}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
