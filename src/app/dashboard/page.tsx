import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"

export const dynamic = "force-dynamic"

/**
 * Server-side redirect hub after login.
 * - Has an org → go to its dashboard
 * - No org yet → go to onboarding
 * - No session → back to login
 */
export default async function DashboardRedirectPage() {
  const session = await getSession()

  if (!session?.user?.id) {
    redirect("/login")
  }

  const firstOrg = session.user.organizations?.[0]
  if (firstOrg?.slug) {
    redirect(`/${firstOrg.slug}`)
  }

  // Authenticated but no org yet (e.g. fresh account)
  redirect("/onboarding")
}
