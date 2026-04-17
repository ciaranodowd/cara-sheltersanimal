import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { rateLimit } from "@/lib/rate-limit"

// Always return the same response regardless of whether the email exists to
// prevent email enumeration.
const OK = NextResponse.json({ ok: true })

export async function POST(req: NextRequest) {
  // 3 attempts per IP per 15 minutes
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown"
  const rl = rateLimit(`forgot-password:${ip}`, { limit: 3, windowMs: 15 * 60 * 1000 })
  if (!rl.ok) return OK // Silently absorb — don't expose rate limit state

  let email: string | undefined
  try {
    const body = await req.json()
    email = typeof body?.email === "string" ? body.email.toLowerCase().trim() : undefined
  } catch {
    return OK
  }

  if (!email || email.length > 254) return OK

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, password: true },
  })

  // Only process for accounts that use credential login (have a password set)
  if (user?.password) {
    // TODO: Generate a time-limited reset token, persist it, and send the
    // reset email via Resend. Example:
    //
    //   const token = crypto.randomUUID()
    //   const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour
    //   await prisma.passwordResetToken.create({
    //     data: { userId: user.id, token, expiresAt },
    //   })
    //   await sendPasswordResetEmail({ to: user.email, token })
    //
    // Until implemented, inform the developer so it doesn't fail silently:
    console.warn("[forgot-password] Reset requested for user but email sending not yet implemented.", user.id)
  }

  return OK
}
