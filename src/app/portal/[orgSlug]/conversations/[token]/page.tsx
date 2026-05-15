"use client"
import { useState, useEffect, useRef, useCallback } from "react"
import { useParams, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Send, RefreshCw, Loader2 } from "lucide-react"
import { PawLoader } from "@/components/ui/paw-loader"
import { formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"

type Message = {
  id: string
  createdAt: string
  senderId: string
  senderName: string
  isFromParticipant: boolean
  content: string
  readAt: string | null
}

type ConversationInfo = {
  id: string
  participantUserId: string
  type: string
  animal: { name: string; species: string } | null
}

type OrgInfo = {
  name: string
}

export default function PortalConversationPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const orgSlug = params.orgSlug as string
  const token = params.token as string
  const secret = searchParams.get("s")

  const [conversation, setConversation] = useState<ConversationInfo | null>(null)
  const [org, setOrg] = useState<OrgInfo | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [sending, setSending] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [content, setContent] = useState("")
  const [error, setError] = useState("")
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const authHeader = secret ? { "X-Conversation-Secret": secret } : {}

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    else setRefreshing(true)
    try {
      const res = await fetch(`/api/portal/${orgSlug}/conversations/${token}`, { headers: authHeader })
      if (res.status === 404 || res.status === 401) { setNotFound(true); return }
      if (!res.ok) return
      const data = await res.json()
      setConversation(data.conversation)
      setOrg(data.org)
      setMessages(data.messages)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [orgSlug, token, secret]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    const interval = setInterval(() => fetchData(true), 30000)
    return () => clearInterval(interval)
  }, [fetchData])

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    const text = content.trim()
    if (!text || sending) return
    setSending(true)
    setError("")
    try {
      const res = await fetch(`/api/portal/${orgSlug}/conversations/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader },
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div style={{ width: "min(90vw, 420px)" }}>
          <PawLoader />
        </div>
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-xl font-bold">Conversation not found</p>
        <p className="text-muted-foreground text-sm">This link may have expired or is incorrect.</p>
        <Link href={`/portal/${orgSlug}`} className="text-sm text-primary underline">
          Back to shelter
        </Link>
      </div>
    )
  }

  const speciesEmoji = conversation?.animal?.species === "DOG" ? "🐕"
    : conversation?.animal?.species === "CAT" ? "🐈" : "🐾"

  return (
    <div className="min-h-screen flex flex-col" style={{ maxHeight: "100dvh" }}>
      {/* Header */}
      <header
        className="shrink-0 px-4 py-3 text-white"
        style={{ background: "linear-gradient(135deg, #1a3a2a 0%, #2d5a3d 100%)" }}
      >
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3">
            <Link href={`/portal/${orgSlug}`} className="text-white/70 hover:text-white">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm">{org?.name ?? "Shelter"}</p>
              {conversation?.animal && (
                <p className="text-xs text-white/70">
                  {speciesEmoji} {conversation.animal.name} ·{" "}
                  {conversation.type === "FOSTER" ? "Foster enquiry" : "Adoption enquiry"}
                </p>
              )}
            </div>
            <button
              onClick={() => fetchData(true)}
              className="p-1.5 rounded-md hover:bg-white/10 transition-colors text-white/70"
              title="Refresh"
            >
              <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
            </button>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-slate-50 px-4 py-4">
        <div className="max-w-2xl mx-auto space-y-3">
          {messages.length === 0 && (
            <div className="text-center py-12 text-muted-foreground text-sm">
              <p className="font-medium">No messages yet</p>
              <p className="mt-1">Send a message to {org?.name ?? "the shelter"} below.</p>
            </div>
          )}

          {messages.map(msg => (
            <div key={msg.id} className={cn("flex", msg.isFromParticipant ? "justify-end" : "justify-start")}>
              <div className={cn("max-w-[75%] flex flex-col space-y-1", msg.isFromParticipant ? "items-end" : "items-start")}>
                {!msg.isFromParticipant && (
                  <span className="text-[11px] text-muted-foreground ml-1">{msg.senderName}</span>
                )}
                <div
                  className={cn(
                    "px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words",
                    msg.isFromParticipant
                      ? "rounded-tr-sm text-white"
                      : "rounded-tl-sm bg-white border text-foreground"
                  )}
                  style={msg.isFromParticipant ? { backgroundColor: "#1a3a2a" } : undefined}
                >
                  {msg.content}
                </div>
                <span className="text-[10px] text-muted-foreground px-1">
                  {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                </span>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
      <div className="shrink-0 border-t bg-white px-4 py-3">
        <div className="max-w-2xl mx-auto">
          {error && <p className="text-xs text-destructive mb-2">{error}</p>}
          <form onSubmit={handleSend} className="flex gap-2 items-end">
            <Textarea
              ref={textareaRef}
              value={content}
              onChange={e => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message… (Enter to send)"
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
          <p className="text-[10px] text-muted-foreground text-center mt-2">
            Messages refresh automatically every 30 seconds
          </p>
        </div>
      </div>
    </div>
  )
}
