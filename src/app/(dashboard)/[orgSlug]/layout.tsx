import { notFound, redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Sidebar } from "@/components/layout/sidebar"
import { MobileNav } from "@/components/layout/mobile-nav"
import { TrialBanner } from "@/components/layout/trial-banner"

export const dynamic = 'force-dynamic'

export default async function OrgLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { orgSlug: string }
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect("/login")

  // Try to load all billing fields; if SQL migration hasn't been run yet the
  // DB will reject the query — fall back to the fields that always exist.
  type OrgRow = { id: string; name: string; slug: string; plan?: string; trialEndDate?: Date | null; trialEndsAt?: Date | null }
  let org: OrgRow | null = null
  try {
    org = await prisma.organization.findUnique({
      where: { slug: params.orgSlug },
      select: { id: true, name: true, slug: true, plan: true, trialEndDate: true, trialEndsAt: true },
    })
  } catch {
    org = await prisma.organization.findUnique({
      where: { slug: params.orgSlug },
      select: { id: true, name: true, slug: true, trialEndsAt: true },
    }).catch(() => null)
  }
  if (!org) notFound()

  const membership = await prisma.userOrganization.findUnique({
    where: { userId_organizationId: { userId: session.user.id, organizationId: org.id } },
    select: { role: true },
  })
  if (!membership) notFound()

  const effectiveTrialEnd = org.trialEndDate ?? org.trialEndsAt

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar orgSlug={org.slug} orgName={org.name} plan={org.plan} />
      <main className="flex-1 min-w-0 pb-16 md:pb-0">
        <TrialBanner
          plan={org.plan}
          trialEndDate={effectiveTrialEnd?.toISOString() ?? null}
          orgSlug={org.slug}
        />
        {children}
      </main>
      <MobileNav orgSlug={org.slug} />
    </div>
  )
}
