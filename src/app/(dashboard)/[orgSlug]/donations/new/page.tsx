import { notFound, redirect } from "next/navigation"
import { DonationForm } from "./_components/donation-form"
import { getSession, getOrgBySlug, getUserMembership } from "@/lib/data-access"

export const dynamic = 'force-dynamic'

export default async function NewDonationPage({ params }: { params: { orgSlug: string } }) {
  const [session, org] = await Promise.all([getSession(), getOrgBySlug(params.orgSlug)])
  if (!session?.user?.id) redirect("/login")
  if (!org) notFound()

  const membership = await getUserMembership(session.user.id, org.id)
  if (!membership) notFound()

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="p-4 sm:p-6 max-w-2xl mx-auto">
        <DonationForm orgSlug={params.orgSlug} orgId={org.id} />
      </div>
    </div>
  )
}
