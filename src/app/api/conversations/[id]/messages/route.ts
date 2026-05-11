import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { sendNewMessageEmail } from "@/lib/email"

async function resolveConversation(id: string, userId: string) {
  const conversation = await prisma.conversation.findUnique({
    where: { id },
    select: {
      id: true,
      shelterOrganizationId: true,
      participantUserId: true,
      animal: { select: { name: true } },
      participant: { select: { name: true, email: true } },
      organization: { select: { name: true, slug: true } },
    },
  })
  if (!conversation) return null

  const membership = await prisma.userOrganization.findUnique({
    where: { userId_organizationId: { userId, organizationId: conversation.shelterOrganizationId } },
  })
  if (!membership) return null

  return conversation
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const conversation = await resolveConversation(params.id, session.user.id)
  if (!conversation) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const [messages] = await prisma.$transaction([
    prisma.message.findMany({
      where: { conversationId: params.id },
      orderBy: { createdAt: "asc" },
      include: { sender: { select: { id: true, name: true, email: true } } },
    }),
    prisma.message.updateMany({
      where: { conversationId: params.id, senderId: conversation.participantUserId, readAt: null },
      data: { readAt: new Date() },
    }),
  ])

  const result = messages.map(msg => ({
    ...msg,
    senderName: msg.sender.name ?? msg.sender.email,
    isFromParticipant: msg.senderId === conversation.participantUserId,
  }))

  return NextResponse.json(result)
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const conversation = await resolveConversation(params.id, session.user.id)
  if (!conversation) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const body = await req.json()
  const content = typeof body.content === "string" ? body.content.trim() : ""
  if (!content || content.length > 5000) {
    return NextResponse.json({ error: "Message content is required (max 5000 chars)" }, { status: 400 })
  }

  const [message] = await prisma.$transaction([
    prisma.message.create({
      data: { conversationId: params.id, senderId: session.user.id, content },
      include: { sender: { select: { id: true, name: true, email: true } } },
    }),
    prisma.conversation.update({
      where: { id: params.id },
      data: { updatedAt: new Date() },
    }),
  ])

  // Send email notification to the adopter — fire and forget
  if (conversation.participant.email) {
    sendNewMessageEmail({
      to: conversation.participant.email,
      participantName: conversation.participant.name,
      orgName: conversation.organization.name,
      orgSlug: conversation.organization.slug,
      conversationId: conversation.id,
      animalName: conversation.animal?.name ?? null,
    }).catch(err => console.error("[message email]", err))
  }

  return NextResponse.json(
    {
      ...message,
      senderName: message.sender.name ?? message.sender.email,
      isFromParticipant: false,
    },
    { status: 201 }
  )
}
