import { redirect } from "next/navigation"

export default function DonateThankYouPage({ params }: { params: { orgSlug: string } }) {
  redirect(`/portal/${params.orgSlug}`)
}
