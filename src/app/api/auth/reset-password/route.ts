import { NextRequest, NextResponse } from "next/server"
import { createHash } from "crypto"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { rateLimiters, getIP, checkRateLimit } from "@/lib/ratelimit"

export async function POST(req: NextRequest) {
  try {
    const ip = getIP(req)
    try {
      const limited = await checkRateLimit(rateLimiters.passwordReset, ip)
      if (limited) return limited
    } catch (err) {
      console.error("Rate limit check failed:", err)
    }

    const body = await req.json()
    const { token, password } = body

    if (typeof token !== "string" || !token) {
      return NextResponse.json({ error: "Invalid reset link." }, { status: 400 })
    }
    if (typeof password !== "string" || password.length < 8 || password.length > 128) {
      return NextResponse.json(
        { error: "Password must be between 8 and 128 characters." },
        { status: 400 }
      )
    }

    // Hash the incoming raw token to look up the stored hash.
    // Tokens are never stored in plain text — only their SHA-256 digest is persisted.
    const tokenHash = createHash("sha256").update(token).digest("hex")

    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token: tokenHash },
      select: { id: true, userId: true, expiresAt: true, usedAt: true },
    })

    if (!resetToken) {
      return NextResponse.json(
        { error: "Invalid or expired reset link. Please request a new one." },
        { status: 400 }
      )
    }
    if (resetToken.usedAt) {
      return NextResponse.json(
        { error: "This reset link has already been used. Please request a new one." },
        { status: 400 }
      )
    }
    if (new Date() > resetToken.expiresAt) {
      return NextResponse.json(
        { error: "This reset link has expired. Please request a new one." },
        { status: 400 }
      )
    }

    const hashed = await bcrypt.hash(password, 12)

    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetToken.userId },
        data: { password: hashed },
      }),
      prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { usedAt: new Date() },
      }),
    ])

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[reset-password] error:", err)
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    )
  }
}
