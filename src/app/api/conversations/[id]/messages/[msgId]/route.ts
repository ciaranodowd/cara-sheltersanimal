import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string; msgId: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const conversation = await prisma.conversation.findUnique({
    where: { id: params.id },
    select: { shelterOrganizationId: true },
  })
  if (!conversation) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const membership = await prisma.userOrganization.findUnique({
    where: { userId_organizationId: { userId: session.user.id, organizationId: conversation.shelterOrganizationId } },
  })
  if (!membership) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const message = await prisma.message.findFirst({
    where: { id: params.msgId, conversationId: params.id },
  })
  if (!message) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const updated = await prisma.message.update({
    where: { id: params.msgId },
    data: { readAt: message.readAt ?? new Date() },
  })

  return NextResponse.json(updated)
}
