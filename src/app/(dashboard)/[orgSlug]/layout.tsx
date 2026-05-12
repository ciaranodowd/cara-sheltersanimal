import { notFound, redirect } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { MobileNav } from "@/components/layout/mobile-nav"
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
  // session and org don't depend on each other — fetch in parallel
  const [session, org] = await Promise.all([
    getSession(),
    getOrgBySlug(params.orgSlug),
  ])
  if (!session?.user?.id) redirect("/login")
  if (!org) notFound()

  const membership = await getUserMembership(session.user.id, org.id)
  if (!membership) notFound()

  const effectiveTrialEnd = org.trialEndDate ?? org.trialEndsAt

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar orgSlug={org.slug} orgName={org.name} plan={org.plan ?? undefined} />
      <main className="flex-1 min-w-0 pb-16 md:pb-0">
        <TrialBanner
          plan={org.plan ?? undefined}
          trialEndDate={effectiveTrialEnd?.toISOString() ?? null}
          orgSlug={org.slug}
        />
        {children}
      </main>
      <MobileNav orgSlug={org.slug} />
    </div>
  )
}
