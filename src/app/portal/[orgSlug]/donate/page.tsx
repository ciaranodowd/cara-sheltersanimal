import { prisma } from "@/lib/prisma"
import { notFound, redirect } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function DonatePage({ params }: { params: { orgSlug: string } }) {
  const org = await prisma.organization.findUnique({
    where: { slug: params.orgSlug },
    select: { donationUrl: true },
  })
  if (!org) notFound()

  if (org.donationUrl) {
    redirect(org.donationUrl)
  } else {
    redirect(`/portal/${params.orgSlug}`)
  }
}
