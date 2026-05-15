import { NextRequest, NextResponse } from "next/server"

// Stripe redirects here when an account link expires during onboarding.
// Send the user back to settings so they can click "Continue onboarding" for a fresh link.
export async function GET(
  _req: NextRequest,
  { params }: { params: { orgSlug: string } }
) {
  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000"
  return NextResponse.redirect(`${baseUrl}/${params.orgSlug}/settings?tab=donations&reconnect=1`)
}
