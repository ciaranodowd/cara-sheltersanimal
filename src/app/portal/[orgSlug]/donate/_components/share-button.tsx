"use client"
import { useState } from "react"
import { Share2, Check, Copy } from "lucide-react"

interface Props {
  orgName: string
  orgSlug: string
  amount: number
}

export function ShareButton({ orgName, orgSlug, amount }: Props) {
  const [copied, setCopied] = useState(false)

  const shareText = `I just donated €${amount} to ${orgName} to help care for animals in need 🐾❤️`
  const shareUrl = typeof window !== "undefined"
    ? `${window.location.origin}/portal/${orgSlug}`
    : `/portal/${orgSlug}`

  async function handleShare() {
    const hasNativeShare =
      typeof navigator !== "undefined" &&
      typeof navigator.share === "function"

    if (hasNativeShare) {
      try {
        await navigator.share({ title: `I donated to ${orgName}`, text: shareText, url: shareUrl })
        return
      } catch {
        // user cancelled or not supported — fall through to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(`${shareText} ${shareUrl}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      // silently ignore
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className="flex items-center justify-center gap-2 w-full border-2 border-stone-200 bg-white hover:bg-stone-50 text-stone-700 font-semibold py-3.5 rounded-2xl transition-colors text-sm"
    >
      {copied
        ? <><Check className="h-4 w-4 text-green-500" /> Copied to clipboard!</>
        : <><Share2 className="h-4 w-4" /> Share that you donated</>}
      {!copied && <Copy className="h-3.5 w-3.5 text-stone-400 ml-auto" />}
    </button>
  )
}
