import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { rateLimit } from "@/lib/rate-limit"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(req: NextRequest) {
  // 5 registration attempts per IP per 15 minutes
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown"
  const rl = rateLimit(`register:${ip}`, { limit: 5, windowMs: 15 * 60 * 1000 })
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } }
    )
  }

  try {
    const body = await req.json()
    const { name, email, password } = body

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email and password are required" }, { status: 400 })
    }

    if (typeof name !== "string" || name.trim().length < 2 || name.trim().length > 100) {
      return NextResponse.json({ error: "Name must be between 2 and 100 characters" }, { status: 400 })
    }
    if (typeof email !== "string" || !EMAIL_RE.test(email) || email.length > 254) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 })
    }
    if (typeof password !== "string" || password.length < 8 || password.length > 128) {
      return NextResponse.json({ error: "Password must be between 8 and 128 characters" }, { status: 400 })
    }

    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })
    if (existing) {
      // Placeholder accounts (created via invite, no password set) can complete registration
      if (existing.password) {
        return NextResponse.json({ error: "An account with this email already exists" }, { status: 400 })
      }
      const hashed = await bcrypt.hash(password, 12)
      await prisma.user.update({
        where: { id: existing.id },
        data: { name: name.trim(), password: hashed },
      })
      return NextResponse.json({ success: true }, { status: 200 })
    }

    const hashed = await bcrypt.hash(password, 12)
    await prisma.user.create({
      data: { name: name.trim(), email: email.toLowerCase(), password: hashed },
    })

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (err: unknown) {
    const isDev = process.env.NODE_ENV === "development"
    const message = err instanceof Error ? err.message : String(err)
    console.error("[register] error:", message)
    return NextResponse.json(
      { error: "Registration failed", ...(isDev && { detail: message }) },
      { status: 500 }
    )
  }
}
