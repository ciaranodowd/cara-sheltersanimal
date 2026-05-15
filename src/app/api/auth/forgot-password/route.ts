import { NextRequest, NextResponse } from "next/server"
import { randomBytes, createHash } from "crypto"
import { prisma } from "@/lib/prisma"
import { rateLimiters, getIP, checkRateLimit } from "@/lib/ratelimit"
import { sendPasswordResetEmail } from "@/lib/email"

// Always return the same response regardless of whether the email exists to
// prevent email enumeration.
const OK = NextResponse.json({ ok: true })

export async function POST(req: NextRequest) {
  const ip = getIP(req)
  try {
    const limited = await checkRateLimit(rateLimiters.passwordReset, ip)
    if (limited) return OK // Still return OK — prevents email enumeration via timing
  } catch (err) {
    console.error("Rate limit check failed:", err)
  }

  let email: string | undefined
  try {
    const body = await req.json()
    email = typeof body?.email === "string" ? body.email.toLowerCase().trim() : undefined
  } catch {
    return OK
  }

  if (!email || email.length > 254) return OK

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, password: true },
    })

    if (user?.password) {
      // Generate a cryptographically random token to send in the email.
      // Only a SHA-256 hash of the token is stored in the database — if the DB
      // is ever breached, the raw tokens cannot be recovered or used directly.
      const rawToken = randomBytes(32).toString("hex")
      const tokenHash = createHash("sha256").update(rawToken).digest("hex")
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

      // Delete any existing unused tokens for this user before creating a new one
      await prisma.passwordResetToken.deleteMany({
        where: { userId: user.id, usedAt: null },
      })

      await prisma.passwordResetToken.create({
        data: { userId: user.id, token: tokenHash, expiresAt },
      })

      try {
        await sendPasswordResetEmail({ to: user.email, token: rawToken })
      } catch (emailErr) {
        // Log clearly so on-call can act, but don't surface to the client —
        // returning an error here would confirm that the email address exists.
        console.error("[forgot-password] Resend delivery failed for", user.email, emailErr)
      }
    }
  } catch (err) {
    console.error("[forgot-password] error:", err)
  }

  return OK
}
