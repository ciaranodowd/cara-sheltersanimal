import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const orgSlug = searchParams.get("orgSlug")
  if (!orgSlug) return NextResponse.json({ error: "orgSlug required" }, { status: 400 })

  const org = await prisma.organization.findUnique({
    where: { slug: orgSlug },
    select: { id: true },
  })
  if (!org) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const membership = await prisma.userOrganization.findUnique({
    where: { userId_organizationId: { userId: session.user.id, organizationId: org.id } },
  })
  if (!membership) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const conversations = await prisma.conversation.findMany({
    where: { shelterOrganizationId: org.id },
    orderBy: { updatedAt: "desc" },
    include: {
      participant: { select: { id: true, name: true, email: true } },
      animal: { select: { id: true, name: true, species: true } },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { content: true, createdAt: true, senderId: true },
      },
    },
  })

  // Compute unread counts: messages from the participant (not shelter staff) with no readAt
  const conversationIds = conversations.map(c => c.id)
  const participantMap = Object.fromEntries(conversations.map(c => [c.id, c.participantUserId]))
  const participantIds = Array.from(new Set(Object.values(participantMap)))

  const unreadMessages = await prisma.message.findMany({
    where: { conversationId: { in: conversationIds }, senderId: { in: participantIds }, readAt: null },
    select: { conversationId: true, senderId: true },
  })

  const unreadMap: Record<string, number> = {}
  for (const msg of unreadMessages) {
    if (participantMap[msg.conversationId] === msg.senderId) {
      unreadMap[msg.conversationId] = (unreadMap[msg.conversationId] ?? 0) + 1
    }
  }

  const result = conversations.map(c => ({
    ...c,
    lastMessage: c.messages[0] ?? null,
    unreadCount: unreadMap[c.id] ?? 0,
  }))

  return NextResponse.json(result)
}
