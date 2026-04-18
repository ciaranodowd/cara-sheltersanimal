"use client"
import { useState, useEffect, useRef, useCallback } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Send, RefreshCw, Loader2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"

type Message = {
  id: string
  createdAt: string
  conversationId: string
  senderId: string
  senderName: string
  isFromParticipant: boolean
  content: string
  readAt: string | null
}

type ConversationData = {
  id: string
  participantUserId: string
  participant: { name: string | null; email: string }
  type: string
  animal: { id: string; name: string; species: string } | null
}

export default function ChatPage() {
  const params = useParams()
  const orgSlug = params.orgSlug as string
  const conversationId = params.conversationId as string

  const [conversation, setConversation] = useState<ConversationData | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [content, setContent] = useState("")
  const [error, setError] = useState("")
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const fetchMessages = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    else setRefreshing(true)
    try {
      const res = await fetch(`/api/conversations/${conversationId}/messages`)
      if (!res.ok) return
      const data = await res.json()
      setMessages(data)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [conversationId])

  const fetchConversation = useCallback(async () => {
    const res = await fetch(`/api/conversations?orgSlug=${orgSlug}`)
    if (!res.ok) return
    const data: ConversationData[] = await res.json()
    const conv = data.find(c => c.id === conversationId)
    if (conv) setConversation(conv)
  }, [orgSlug, conversationId])

  useEffect(() => {
    fetchConversation()
    fetchMessages()
  }, [fetchConversation, fetchMessages])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    const interval = setInterval(() => fetchMessages(true), 30000)
    return () => clearInterval(interval)
  }, [fetchMessages])

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    const text = content.trim()
    if (!text || sending) return
    setSending(true)
    setError("")
    try {
      const res = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text }),
      })
      if (!res.ok) {
        const d = await res.json()
        setError(d.error ?? "Failed to send message")
        return
      }
      const msg = await res.json()
      setMessages(prev => [...prev, msg])
      setContent("")
      textareaRef.current?.focus()
    } finally {
      setSending(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend(e as unknown as React.FormEvent)
    }
  }

  const displayName = conversation
    ? (conversation.participant.name ?? conversation.participant.email)
    : "…"
  const speciesEmoji = conversation?.animal?.species === "DOG" ? "🐕"
    : conversation?.animal?.species === "CAT" ? "🐈" : "🐾"

  return (
    <div className="flex flex-col h-[calc(100vh-0px)] md:h-screen">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b bg-white shrink-0">
        <Link href={`/${orgSlug}/messages`} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-sm truncate">{displayName}</p>
            {conversation?.type && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 font-normal shrink-0">
                {conversation.type === "FOSTER" ? "Foster" : "Adoption"}
              </Badge>
            )}
          </div>
          {conversation?.animal && (
            <p className="text-xs text-muted-foreground">
              {speciesEmoji} {conversation.animal.name}
            </p>
          )}
          {conversation?.participant.email && (
            <p className="text-xs text-muted-foreground">{conversation.participant.email}</p>
          )}
        </div>
        <button
          onClick={() => fetchMessages(true)}
          className="p-1.5 rounded-md hover:bg-slate-100 transition-colors text-muted-foreground"
          title="Refresh messages"
        >
          <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
        {loading && (
          <div className="flex justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        )}

        {!loading && messages.length === 0 && (
          <div className="text-center py-10 text-muted-foreground text-sm">
            No messages yet. Start the conversation below.
          </div>
        )}

        {messages.map(msg => (
          <div key={msg.id} className={cn("flex", !msg.isFromParticipant ? "justify-end" : "justify-start")}>
            <div className={cn("max-w-[75%] space-y-1", !msg.isFromParticipant ? "items-end" : "items-start", "flex flex-col")}>
              {msg.isFromParticipant && (
                <span className="text-[11px] text-muted-foreground ml-1">{msg.senderName}</span>
              )}
              <div
                className={cn(
                  "px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words",
                  !msg.isFromParticipant
                    ? "rounded-tr-sm text-white"
                    : "rounded-tl-sm bg-white border text-foreground"
                )}
                style={!msg.isFromParticipant ? { backgroundColor: "#1a3a2a" } : undefined}
              >
                {msg.content}
              </div>
              <span className="text-[10px] text-muted-foreground px-1">
                {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                {!msg.isFromParticipant && msg.readAt && " · Read"}
              </span>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t bg-white px-4 py-3 shrink-0">
        {error && (
          <p className="text-xs text-destructive mb-2">{error}</p>
        )}
        <form onSubmit={handleSend} className="flex gap-2 items-end">
          <Textarea
            ref={textareaRef}
            value={content}
            onChange={e => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message… (Enter to send, Shift+Enter for new line)"
            rows={1}
            className="resize-none min-h-[40px] max-h-32 flex-1 text-sm"
          />
          <Button
            type="submit"
            disabled={sending || !content.trim()}
            size="icon"
            className="shrink-0 h-10 w-10"
            style={{ backgroundColor: "#1a3a2a" }}
          >
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </div>
    </div>
  )
}
