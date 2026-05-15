"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface BillingSettingsProps {
  orgSlug: string
  subscriptionStatus: string | null
  stripeCustomerId: string | null
  trialEndsAt: Date | null
  cancelAt: Date | null
  cancelAtPeriodEnd: boolean
  isAdmin: boolean
}

function formatDate(date: Date) {
  return date.toLocaleDateString("en-IE", { day: "numeric", month: "long", year: "numeric" })
}

function statusBadge(status: string | null, isPendingCancel: boolean) {
  if (isPendingCancel) return { label: "Cancelling", variant: "outline" as const, className: "border-amber-400 text-amber-700" }
  switch (status) {
    case "ACTIVE":    return { label: "Active",    variant: "default" as const,      className: "bg-green-600 text-white" }
    case "TRIALING":  return { label: "Trial",     variant: "secondary" as const,    className: "" }
    case "PAST_DUE":  return { label: "Past due",  variant: "destructive" as const,  className: "" }
    case "CANCELLED": return { label: "Cancelled", variant: "destructive" as const,  className: "" }
    case "INACTIVE":  return { label: "Inactive",  variant: "destructive" as const,  className: "" }
    default:          return { label: "Unknown",   variant: "secondary" as const,    className: "" }
  }
}

export function BillingSettings({
  orgSlug,
  subscriptionStatus,
  stripeCustomerId,
  trialEndsAt,
  cancelAt,
  cancelAtPeriodEnd,
  isAdmin,
}: BillingSettingsProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const isPendingCancel =
    subscriptionStatus === "ACTIVE" &&
    (cancelAtPeriodEnd || (cancelAt !== null && cancelAt > new Date()))

  const { label, variant, className } = statusBadge(subscriptionStatus, isPendingCancel)

  async function handleCheckout() {
    setLoading(true)
    setError("")
    try {
      const res = await fetch(`/api/orgs/${orgSlug}/billing/checkout`, { method: "POST" })
      const data = await res.json()
      if (res.ok && data.url) {
        window.location.href = data.url
      } else {
        setError(data.error ?? "Something went wrong")
        setLoading(false)
      }
    } catch {
      setError("Something went wrong")
      setLoading(false)
    }
  }

  async function handlePortal() {
    setLoading(true)
    setError("")
    try {
      const res = await fetch(`/api/orgs/${orgSlug}/billing/portal`, { method: "POST" })
      const data = await res.json()
      if (res.ok && data.url) {
        window.location.href = data.url
      } else {
        setError(data.error ?? "Something went wrong")
        setLoading(false)
      }
    } catch {
      setError("Something went wrong")
      setLoading(false)
    }
  }

  const isActiveOrPastDue = subscriptionStatus === "ACTIVE" || subscriptionStatus === "PAST_DUE"

  return (
    <Card>
      <CardHeader>
        <CardTitle>Billing</CardTitle>
        <CardDescription>Manage your Cara subscription</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <div className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">{error}</div>
        )}

        <div className="flex items-center justify-between py-3 border-b">
          <div>
            <p className="text-sm font-medium">Current plan</p>
            <p className="text-sm text-muted-foreground">Cara Pro — €34.99/month</p>
          </div>
          <Badge variant={variant} className={className}>{label}</Badge>
        </div>

        {subscriptionStatus === "TRIALING" && trialEndsAt && (
          <p className="text-sm text-muted-foreground">
            Trial ends on{" "}
            <span className="font-medium text-foreground">{formatDate(new Date(trialEndsAt))}</span>
          </p>
        )}

        {isPendingCancel && cancelAt && (
          <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
            Your subscription is active until{" "}
            <span className="font-semibold">{formatDate(new Date(cancelAt))}</span>. After that, your account
            moves to the free plan.
          </p>
        )}

        {subscriptionStatus === "CANCELLED" && (
          <p className="text-sm text-muted-foreground">
            Your subscription has ended. Subscribe to restore full access.
          </p>
        )}

        {isAdmin && (
          <div className="flex flex-wrap gap-2">
            {isActiveOrPastDue && stripeCustomerId ? (
              <Button onClick={handlePortal} disabled={loading} variant="outline">
                {loading ? "Loading…" : "Manage subscription"}
              </Button>
            ) : null}
            {(!isActiveOrPastDue || isPendingCancel) && (
              <Button onClick={handleCheckout} disabled={loading}>
                {loading ? "Loading…" : isPendingCancel ? "Resubscribe — €34.99/mo" : "Subscribe — €34.99/mo"}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
