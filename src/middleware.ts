import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware() {
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl
        // Public routes
        if (
          pathname === "/" ||
          pathname.startsWith("/portal") ||
          pathname.startsWith("/api/portal") ||
          pathname.startsWith("/api/webhooks") ||
          pathname.startsWith("/login") ||
          pathname.startsWith("/register") ||
          pathname.startsWith("/forgot-password") ||
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
  matcher: ["/((?!_next/static|_next/image|favicon.ico|fonts).*)"],
}
