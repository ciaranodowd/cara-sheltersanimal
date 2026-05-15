"use client"
import { useState } from "react"
import { X } from "lucide-react"
import Link from "next/link"

interface Props {
  plan?: string
  subscriptionStatus?: string
  trialEndDate: string | null
  orgSlug: string
}

export function TrialBanner({ plan, subscriptionStatus, trialEndDate, orgSlug }: Props) {
  const [dismissed, setDismissed] = useState(false)

  // Suppress if pro, or if subscription is active/trialing (catches plan-field lag)
  if (dismissed || !plan || plan === "pro") return null
  // Suppress if subscription is active (safety net for plan-field lag after webhook)
  if (subscriptionStatus === "ACTIVE") return null

  const trialDate = trialEndDate ? new Date(trialEndDate) : null
  const trialDaysLeft = trialDate
    ? Math.max(0, Math.ceil((trialDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0

  const isExpired = trialDaysLeft === 0
  const showBanner = isExpired || trialDaysLeft <= 7

  if (!showBanner) return null

  return (
    <div
      className={`flex items-center gap-3 px-4 py-2.5 text-sm ${
        isExpired
          ? "bg-red-50 border-b border-red-200 text-red-800"
          : "bg-amber-50 border-b border-amber-200 text-amber-800"
      }`}
    >
      <span className="flex-1">
        {isExpired
          ? "🔒 Your free trial has expired. "
          : `⚠️ Your free trial ends in ${trialDaysLeft} day${trialDaysLeft !== 1 ? "s" : ""}. `}
        <Link
          href={`/${orgSlug}/billing`}
          className="font-semibold underline underline-offset-2 hover:opacity-80"
        >
          Upgrade to Cara Pro
        </Link>
        {isExpired ? " to continue using Cara." : " to keep access."}
      </span>
      <button
        onClick={() => setDismissed(true)}
        aria-label="Dismiss"
        className="shrink-0 p-1 rounded hover:bg-black/10 transition-colors"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}
