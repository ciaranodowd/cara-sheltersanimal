import { NextRequest, NextResponse } from "next/server"
import { randomBytes } from "crypto"
import { prisma } from "@/lib/prisma"
import { rateLimit } from "@/lib/rate-limit"
import { sendPasswordResetEmail } from "@/lib/email"

// Always return the same response regardless of whether the email exists to
// prevent email enumeration.
const OK = NextResponse.json({ ok: true })

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown"
  const rl = rateLimit(`forgot-password:${ip}`, { limit: 3, windowMs: 15 * 60 * 1000 })
  if (!rl.ok) return OK

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
      const token = randomBytes(32).toString("hex")
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

      // Delete any existing unused tokens for this user before creating a new one
      await prisma.passwordResetToken.deleteMany({
        where: { userId: user.id, usedAt: null },
      })

      await prisma.passwordResetToken.create({
        data: { userId: user.id, token, expiresAt },
      })

      try {
        await sendPasswordResetEmail({ to: user.email, token })
      } catch (emailErr) {
        console.error("[forgot-password] Failed to send reset email:", emailErr)
      }
    }
  } catch (err) {
    console.error("[forgot-password] error:", err)
  }

  return OK
}
