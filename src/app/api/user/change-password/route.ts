import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import bcrypt from "bcryptjs"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { currentPassword, newPassword } = body

    if (typeof currentPassword !== "string" || !currentPassword) {
      return NextResponse.json({ error: "Current password is required." }, { status: 400 })
    }
    if (typeof newPassword !== "string" || newPassword.length < 8 || newPassword.length > 128) {
      return NextResponse.json(
        { error: "New password must be between 8 and 128 characters." },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, password: true },
    })

    if (!user?.password) {
      return NextResponse.json(
        { error: "Your account uses social login and doesn't have a password." },
        { status: 400 }
      )
    }

    const valid = await bcrypt.compare(currentPassword, user.password)
    if (!valid) {
      return NextResponse.json({ error: "Current password is incorrect." }, { status: 400 })
    }

    if (currentPassword === newPassword) {
      return NextResponse.json(
        { error: "New password must be different from the current password." },
        { status: 400 }
      )
    }

    const hashed = await bcrypt.hash(newPassword, 12)
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashed },
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[change-password] error:", err)
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    )
  }
}
