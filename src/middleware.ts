import { withAuth } from "next-auth/middleware"
import { getToken } from "next-auth/jwt"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { rateLimiters, getIP, checkRateLimit } from "@/lib/ratelimit"

export default withAuth(
  async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl

    // Redirect already-authenticated users away from /login and /register
    // so they can't land back on the marketing/auth pages after signing in.
    if (pathname === "/login" || pathname === "/register") {
      const token = await getToken({ req })
      if (token) {
        return NextResponse.redirect(new URL("/dashboard", req.url))
      }
    }

    try {
      const ip = getIP(req)

      // Tighter limit for the NextAuth credentials login POST
      if (pathname === "/api/auth/callback/credentials" && req.method === "POST") {
        const limited = await checkRateLimit(rateLimiters.login, ip)
        if (limited) return limited
      }

      // General API rate limit for all other /api/* routes.
      // Stripe webhooks are excluded — they must not be IP-rate-limited.
      // Routes with their own specific limiters still get this broad check
      // as a first line of defence (defence in depth).
      if (pathname.startsWith("/api/") && !pathname.startsWith("/api/webhooks")) {
        const limited = await checkRateLimit(rateLimiters.api, ip)
        if (limited) return limited
      }
    } catch (err) {
      console.error("Rate limit check failed:", err)
      // Allow through — never let rate limiting take down the app
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl
        // Public routes
        if (
          pathname === "/" ||
          pathname.startsWith("/adopt") ||
          pathname.startsWith("/about") ||
          pathname.startsWith("/privacy") ||
          pathname.startsWith("/portal") ||
          pathname.startsWith("/api/portal") ||
          pathname.startsWith("/api/webhooks") ||
          pathname.startsWith("/login") ||
          pathname.startsWith("/register") ||
          pathname.startsWith("/onboarding") ||
          pathname.startsWith("/forgot-password") ||
          pathname.startsWith("/reset-password") ||
          pathname.startsWith("/api/auth") ||
          pathname.startsWith("/sign") ||
          pathname.startsWith("/api/sign")
        ) {
          return true
        }
        return !!token
      },
    },
  }
)

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico|fonts|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
}
