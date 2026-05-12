import { prisma } from "@/lib/prisma"
import { notFound, redirect } from "next/navigation"
import { getSession, getOrgBySlug, getUserMembership } from "@/lib/data-access"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"
import { MessageSquare, PawPrint } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function MessagesPage({ params }: { params: { orgSlug: string } }) {
  const [session, org] = await Promise.all([getSession(), getOrgBySlug(params.orgSlug)])
  if (!session?.user?.id) redirect("/login")
  if (!org) notFound()

  const membership = await getUserMembership(session.user.id, org.id)
  if (!membership) notFound()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let conversations: any[] = []
  try {
    conversations = await prisma.conversation.findMany({
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
  } catch {
    // Messaging tables may not be migrated yet — show empty state gracefully
  }

  const conversationIds = conversations.map((c: { id: string }) => c.id)
  const participantMap = Object.fromEntries(conversations.map((c: { id: string; participantUserId: string }) => [c.id, c.participantUserId]))
  const participantIds = Array.from(new Set(Object.values(participantMap) as string[]))

  let unreadMessages: { conversationId: string; senderId: string }[] = []
  try {
    unreadMessages = await prisma.message.findMany({
      where: { conversationId: { in: conversationIds }, senderId: { in: participantIds }, readAt: null },
      select: { conversationId: true, senderId: true },
    })
  } catch {
    // ignore
  }

  const unreadMap: Record<string, number> = {}
  for (const msg of unreadMessages) {
    if (participantMap[msg.conversationId] === msg.senderId) {
      unreadMap[msg.conversationId] = (unreadMap[msg.conversationId] ?? 0) + 1
    }
  }

  const byAnimal: Record<string, typeof conversations> = {}
  const noAnimal: typeof conversations = []

  for (const conv of conversations) {
    if (conv.animal) {
      const key = conv.animal.id
      if (!byAnimal[key]) byAnimal[key] = []
      byAnimal[key].push(conv)
    } else {
      noAnimal.push(conv)
    }
  }

  const totalUnread = Object.values(unreadMap).reduce((sum, n) => sum + n, 0)

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Messages</h1>
          <p className="text-muted-foreground text-sm">
            {conversations.length} conversation{conversations.length !== 1 ? "s" : ""}
            {totalUnread > 0 && ` · ${totalUnread} unread`}
          </p>
        </div>
      </div>

      {conversations.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <MessageSquare className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No conversations yet</p>
          <p className="text-sm mt-1">Conversations are created automatically when people apply via the portal.</p>
        </div>
      )}

      {Object.entries(byAnimal).map(([, convs]) => {
        const animal = convs[0].animal!
        const speciesEmoji = animal.species === "DOG" ? "🐕" : animal.species === "CAT" ? "🐈" : "🐾"
        return (
          <div key={animal.id}>
            <div className="flex items-center gap-2 mb-2 px-1">
              <PawPrint className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-semibold text-muted-foreground">
                {speciesEmoji} {animal.name}
              </span>
            </div>
            <div className="rounded-xl border bg-white overflow-hidden divide-y">
              {convs.map(conv => (
                <ConversationRow
                  key={conv.id}
                  conv={conv}
                  orgSlug={params.orgSlug}
                  unreadCount={unreadMap[conv.id] ?? 0}
                />
              ))}
            </div>
          </div>
        )
      })}

      {noAnimal.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2 px-1">
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-semibold text-muted-foreground">General</span>
          </div>
          <div className="rounded-xl border bg-white overflow-hidden divide-y">
            {noAnimal.map(conv => (
              <ConversationRow
                key={conv.id}
                conv={conv}
                orgSlug={params.orgSlug}
                unreadCount={unreadMap[conv.id] ?? 0}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

type ConvType = {
  id: string
  participantUserId: string
  participant: { name: string | null; email: string }
  type: string
  updatedAt: Date
  animal: { id: string; name: string; species: string } | null
  messages: { content: string; createdAt: Date; senderId: string }[]
}

function ConversationRow({
  conv,
  orgSlug,
  unreadCount,
}: {
  conv: ConvType
  orgSlug: string
  unreadCount: number
}) {
  const lastMessage = conv.messages[0] ?? null
  const displayName = conv.participant.name ?? conv.participant.email
  const isLastFromParticipant = lastMessage?.senderId === conv.participantUserId

  return (
    <Link
      href={`/${orgSlug}/messages/${conv.id}`}
      className="flex items-start gap-3 p-4 hover:bg-slate-50 transition-colors"
    >
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
        style={{ backgroundColor: "#e8f5e9", color: "#1a3a2a" }}
      >
        {displayName.charAt(0).toUpperCase()}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="font-semibold text-sm truncate">{displayName}</span>
          <div className="flex items-center gap-2 shrink-0">
            {unreadCount > 0 && (
              <Badge className="text-[10px] px-1.5 py-0 h-5 min-w-5 flex items-center justify-center" style={{ backgroundColor: "#1a3a2a" }}>
                {unreadCount}
              </Badge>
            )}
            {lastMessage && (
              <span className="text-[11px] text-muted-foreground">
                {formatDistanceToNow(new Date(lastMessage.createdAt), { addSuffix: true })}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 font-normal">
            {conv.type === "FOSTER" ? "Foster" : "Adoption"}
          </Badge>
          {lastMessage && (
            <p className="text-xs text-muted-foreground truncate">
              {!isLastFromParticipant ? "You: " : ""}
              {lastMessage.content}
            </p>
          )}
          {!lastMessage && (
            <p className="text-xs text-muted-foreground italic">No messages yet</p>
          )}
        </div>
      </div>
    </Link>
  )
}
