import { notFound, redirect } from "next/navigation"
import { AnimalForm } from "../_components/animal-form"
import { getSession, getOrgBySlug, getUserMembership } from "@/lib/data-access"

export const dynamic = 'force-dynamic'

export default async function NewAnimalPage({ params }: { params: { orgSlug: string } }) {
  const [session, org] = await Promise.all([getSession(), getOrgBySlug(params.orgSlug)])
  if (!session?.user?.id) redirect("/login")
  if (!org) notFound()

  const membership = await getUserMembership(session.user.id, org.id)
  if (!membership) notFound()

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Add animal</h1>
        <p className="text-muted-foreground text-sm">Record a new animal intake</p>
      </div>
      <AnimalForm orgSlug={params.orgSlug} orgId={org.id} />
    </div>
  )
}
