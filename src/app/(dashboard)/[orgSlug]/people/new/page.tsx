import { notFound, redirect } from "next/navigation"
import { PersonForm } from "./_components/person-form"
import { getSession, getOrgBySlug, getUserMembership } from "@/lib/data-access"

export const dynamic = 'force-dynamic'

export default async function NewPersonPage({
  params,
  searchParams,
}: {
  params: { orgSlug: string }
  searchParams: { type?: string }
}) {
  const [session, org] = await Promise.all([getSession(), getOrgBySlug(params.orgSlug)])
  if (!session?.user?.id) redirect("/login")
  if (!org) notFound()

  const membership = await getUserMembership(session.user.id, org.id)
  if (!membership) notFound()

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="p-4 sm:p-6 max-w-2xl mx-auto">
        <PersonForm orgSlug={params.orgSlug} orgId={org.id} defaultType={searchParams.type ?? "adopter"} />
      </div>
    </div>
  )
}
