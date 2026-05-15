import { notFound, redirect } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { MobileNav } from "@/components/layout/mobile-nav"
import { MobileHeader } from "@/components/layout/mobile-header"
import { TrialBanner } from "@/components/layout/trial-banner"
import { getSession, getOrgBySlug, getUserMembership } from "@/lib/data-access"

export const dynamic = 'force-dynamic'

export default async function OrgLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { orgSlug: string }
}) {
  const [session, org] = await Promise.all([
    getSession(),
    getOrgBySlug(params.orgSlug),
  ])
  if (!session?.user?.id) redirect("/login")
  if (!org) notFound()

  const membership = await getUserMembership(session.user.id, org.id)
  if (!membership) notFound()

  const isAdmin = membership.role === "ADMIN"
  const effectiveTrialEnd = org.trialEndDate ?? org.trialEndsAt

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar orgSlug={org.slug} orgName={org.name} plan={org.plan ?? undefined} />
      <MobileHeader orgSlug={org.slug} orgName={org.name} />
      {/* pt-14 offsets the fixed mobile header; pb-16 offsets the fixed mobile nav */}
      <main className="flex-1 min-w-0 pt-14 pb-16 md:pt-0 md:pb-0">
        <TrialBanner
          plan={org.plan ?? undefined}
          subscriptionStatus={org.subscriptionStatus ?? undefined}
          trialEndDate={effectiveTrialEnd?.toISOString() ?? null}
          orgSlug={org.slug}
        />
        {children}
      </main>
      <MobileNav orgSlug={org.slug} isAdmin={isAdmin} />
    </div>
  )
}
