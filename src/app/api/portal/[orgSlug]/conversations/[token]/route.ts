import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { rateLimiters, getIP, checkRateLimit } from "@/lib/ratelimit"

async function resolveConversation(orgSlug: string, token: string) {
  const org = await prisma.organization.findUnique({
    where: { slug: orgSlug },
    select: { id: true, name: true },
  })
  if (!org) return null

  const conversation = await prisma.conversation.findFirst({
    where: { id: token, shelterOrganizationId: org.id },
    include: {
      animal: { select: { id: true, name: true, species: true } },
      participant: { select: { id: true, name: true, email: true } },
    },
  })
  if (!conversation) return null

  return { conversation, org }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { orgSlug: string; token: string } }
) {
  const resolved = await resolveConversation(params.orgSlug, params.token)
  if (!resolved) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const { conversation, org } = resolved

  const [messages] = await prisma.$transaction([
    prisma.message.findMany({
      where: { conversationId: conversation.id },
      orderBy: { createdAt: "asc" },
      include: { sender: { select: { id: true, name: true, email: true } } },
    }),
    prisma.message.updateMany({
      where: { conversationId: conversation.id, senderId: { not: conversation.participantUserId }, readAt: null },
      data: { readAt: new Date() },
    }),
  ])

  const result = messages.map(msg => ({
    ...msg,
    senderName: msg.sender.name ?? msg.sender.email,
    isFromParticipant: msg.senderId === conversation.participantUserId,
  }))

  return NextResponse.json({ conversation, org, messages: result })
}

export async function POST(
  req: NextRequest,
  { params }: { params: { orgSlug: string; token: string } }
) {
  const ip = getIP(req)
  try {
    const limited = await checkRateLimit(rateLimiters.portalMessage, `${ip}:${params.token}`)
    if (limited) return limited
  } catch (err) {
    console.error("Rate limit check failed:", err)
  }

  const resolved = await resolveConversation(params.orgSlug, params.token)
  if (!resolved) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const { conversation } = resolved

  const body = await req.json()
  const content = typeof body.content === "string" ? body.content.trim() : ""
  if (!content || content.length > 5000) {
    return NextResponse.json({ error: "Message content is required (max 5000 chars)" }, { status: 400 })
  }

  const [message] = await prisma.$transaction([
    prisma.message.create({
      data: { conversationId: conversation.id, senderId: conversation.participantUserId, content },
      include: { sender: { select: { id: true, name: true, email: true } } },
    }),
    prisma.conversation.update({
      where: { id: conversation.id },
      data: { updatedAt: new Date() },
    }),
  ])

  return NextResponse.json(
    {
      ...message,
      senderName: message.sender.name ?? message.sender.email,
      isFromParticipant: true,
    },
    { status: 201 }
  )
}
