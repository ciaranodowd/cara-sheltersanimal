import { prisma } from "@/lib/prisma"
import { notFound, redirect } from "next/navigation"
import { getSession, getOrgBySlug, getUserMembership } from "@/lib/data-access"
import { VolunteerDetail } from "./_components/volunteer-detail"

export const dynamic = 'force-dynamic'

export default async function VolunteerDetailPage({ params }: { params: { orgSlug: string; volunteerId: string } }) {
  const [session, org] = await Promise.all([getSession(), getOrgBySlug(params.orgSlug)])
  if (!session?.user?.id) redirect("/login")
  if (!org) notFound()

  const [membership, volunteer] = await Promise.all([
    getUserMembership(session.user.id, org.id),
    prisma.volunteer.findFirst({
      where: { id: params.volunteerId, organizationId: org.id },
    }).catch(() => null),
  ])
  if (!membership) notFound()
  if (!volunteer) notFound()

  return (
    <VolunteerDetail
      orgSlug={params.orgSlug}
      volunteer={{
        id: volunteer.id,
        firstName: volunteer.firstName,
        lastName: volunteer.lastName,
        email: volunteer.email,
        phone: volunteer.phone,
        county: volunteer.county,
        skills: volunteer.skills,
        isHomeChecker: volunteer.isHomeChecker,
        isDriver: volunteer.isDriver,
        available: volunteer.available,
        hoursLogged: Number(volunteer.hoursLogged),
        notes: volunteer.notes,
        createdAt: volunteer.createdAt.toISOString(),
      }}
    />
  )
}
