import { prisma } from "@/lib/prisma"
import { notFound, redirect } from "next/navigation"
import { MedicalRecordForm } from "./_components/medical-record-form"
import { getSession, getOrgBySlug, getUserMembership } from "@/lib/data-access"

export const dynamic = 'force-dynamic'

export default async function NewMedicalRecordPage({ params }: { params: { orgSlug: string; animalId: string } }) {
  const [session, org] = await Promise.all([getSession(), getOrgBySlug(params.orgSlug)])
  if (!session?.user?.id) redirect("/login")
  if (!org) notFound()

  const [membership, animal] = await Promise.all([
    getUserMembership(session.user.id, org.id),
    prisma.animal.findFirst({
      where: { id: params.animalId, organizationId: org.id },
      select: { id: true, name: true },
    }).catch(() => null),
  ])
  if (!membership) notFound()
  if (!animal) notFound()

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="p-4 sm:p-6 max-w-2xl mx-auto">
        <MedicalRecordForm orgSlug={params.orgSlug} animalId={animal.id} animalName={animal.name} />
      </div>
    </div>
  )
}
