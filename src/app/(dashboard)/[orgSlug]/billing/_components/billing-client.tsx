"use client"
import { useState } from "react"
import Link from "next/link"
import { CheckCircle, AlertCircle, Clock, XCircle, ExternalLink, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SubscriptionStatus } from "@prisma/client"

interface Props {
  orgSlug: string
  subscriptionStatus: SubscriptionStatus
  trialEndsAt: string | null
  hasStripeCustomer: boolean
  isAdmin: boolean
  showSuccess: boolean
}

const STATUS_CONFIG: Record<
  SubscriptionStatus,
  { label: string; description: string; icon: React.ReactNode; colour: string }
> = {
  ACTIVE: {
    label: "Active",
    description: "Your subscription is active. Full access to all features.",
    icon: <CheckCircle className="h-5 w-5 text-green-500" />,
    colour: "bg-green-50 border-green-200",
  },
  TRIALING: {
    label: "Free trial",
    description: "You're on a free trial.",
    icon: <Clock className="h-5 w-5 text-blue-500" />,
    colour: "bg-blue-50 border-blue-200",
  },
  PAST_DUE: {
    label: "Payment overdue",
    description: "Your last payment failed. Please update your payment method.",
    icon: <AlertCircle className="h-5 w-5 text-amber-500" />,
    colour: "bg-amber-50 border-amber-200",
  },
  INACTIVE: {
    label: "Inactive",
    description: "Your subscription is inactive. Subscribe to restore access.",
    icon: <XCircle className="h-5 w-5 text-slate-400" />,
    colour: "bg-slate-50 border-slate-200",
  },
  CANCELLED: {
    label: "Cancelled",
    description: "Your subscription has been cancelled.",
    icon: <XCircle className="h-5 w-5 text-red-400" />,
    colour: "bg-red-50 border-red-200",
  },
}

export function BillingClient({
  orgSlug,
  subscriptionStatus,
  trialEndsAt,
  hasStripeCustomer,
  isAdmin,
  showSuccess,
}: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const config = STATUS_CONFIG[subscriptionStatus]

  async function handlePortal() {
    setLoading(true)
    setError("")
    try {
      const res = await fetch(`/api/orgs/${orgSlug}/billing/portal`, { method: "POST" })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? "Something went wrong"); setLoading(false); return }
      window.location.href = data.url
    } catch {
      setError("Something went wrong. Please try again.")
      setLoading(false)
    }
  }

  const trialDate = trialEndsAt ? new Date(trialEndsAt) : null
  const trialDaysLeft = trialDate
    ? Math.max(0, Math.ceil((trialDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null

  return (
    <div className="space-y-4">
      {showSuccess && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
          <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
          <p className="text-sm font-medium text-green-800">
            Subscription activated! Welcome to Cara.
          </p>
        </div>
      )}

      {error && (
        <div className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">
          {error}
        </div>
      )}

      {/* Current plan */}
      <Card className={`border ${config.colour}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            {config.icon}
            <CardTitle className="text-base">{config.label}</CardTitle>
          </div>
          <CardDescription>{config.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {subscriptionStatus === "TRIALING" && trialDaysLeft !== null && (
            <p className="text-sm font-medium">
              {trialDaysLeft > 0
                ? `${trialDaysLeft} day${trialDaysLeft !== 1 ? "s" : ""} remaining in your trial`
                : "Your trial has ended"}
            </p>
          )}

          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold">€35</span>
            <span className="text-muted-foreground text-sm">/month</span>
          </div>

          {isAdmin && (
            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              {hasStripeCustomer ? (
                <Button
                  onClick={handlePortal}
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  {loading ? "Loading…" : "Manage subscription"}
                  {!loading && <ExternalLink className="h-4 w-4" />}
                </Button>
              ) : (
                <Link href={`/${orgSlug}/billing/upgrade`}>
                  <Button className="flex items-center gap-2">
                    Subscribe now
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              )}

              {hasStripeCustomer && (subscriptionStatus === "INACTIVE" || subscriptionStatus === "CANCELLED") && (
                <Link href={`/${orgSlug}/billing/upgrade`}>
                  <Button variant="outline">Resubscribe</Button>
                </Link>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Plan features */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">What&apos;s included</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
            {[
              "Unlimited animals",
              "Adoption workflow",
              "Foster management",
              "Public portal",
              "Team access",
              "Email templates",
              "Donor tracking",
              "GDPR tools",
            ].map(f => (
              <li key={f} className="flex items-center gap-2">
                <CheckCircle className="h-3.5 w-3.5 text-green-500 shrink-0" />
                {f}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
