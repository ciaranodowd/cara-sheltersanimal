import { prisma } from "@/lib/prisma"
import { notFound, redirect } from "next/navigation"
import { getSession, getOrgBySlug, getUserMembership } from "@/lib/data-access"
import { AnimalForm } from "../../_components/animal-form"

export const dynamic = 'force-dynamic'

export default async function EditAnimalPage({ params }: { params: { orgSlug: string; animalId: string } }) {
  const [session, org] = await Promise.all([getSession(), getOrgBySlug(params.orgSlug)])
  if (!session?.user?.id) redirect("/login")
  if (!org) notFound()

  const [membership, animal] = await Promise.all([
    getUserMembership(session.user.id, org.id),
    prisma.animal.findFirst({
      where: { id: params.animalId, organizationId: org.id },
    }).catch(() => null),
  ])
  if (!membership) notFound()
  if (!animal) notFound()

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Edit {animal.name}</h1>
      </div>
      <AnimalForm orgSlug={params.orgSlug} orgId={org.id} animal={animal} />
    </div>
  )
}
