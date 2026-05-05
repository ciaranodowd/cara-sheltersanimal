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
  isAdmin: boolean
}

function statusLabel(status: string | null) {
  switch (status) {
    case "ACTIVE":    return { label: "Active",    variant: "default" as const }
    case "TRIALING":  return { label: "Trial",     variant: "secondary" as const }
    case "PAST_DUE":  return { label: "Past due",  variant: "destructive" as const }
    case "CANCELLED": return { label: "Cancelled", variant: "destructive" as const }
    case "INACTIVE":  return { label: "Inactive",  variant: "destructive" as const }
    default:          return { label: "Unknown",   variant: "secondary" as const }
  }
}

export function BillingSettings({ orgSlug, subscriptionStatus, stripeCustomerId, trialEndsAt, isAdmin }: BillingSettingsProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const { label, variant } = statusLabel(subscriptionStatus)

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

  const isSubscribed = subscriptionStatus === "ACTIVE" || subscriptionStatus === "PAST_DUE"

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
            <p className="text-sm text-muted-foreground">Cara — €34.99/month</p>
          </div>
          <Badge variant={variant}>{label}</Badge>
        </div>

        {subscriptionStatus === "TRIALING" && trialEndsAt && (
          <div className="text-sm text-muted-foreground">
            Trial ends on{" "}
            <span className="font-medium text-foreground">
              {new Date(trialEndsAt).toLocaleDateString("en-IE", { day: "numeric", month: "long", year: "numeric" })}
            </span>
          </div>
        )}

        {isAdmin && (
          <div>
            {isSubscribed && stripeCustomerId ? (
              <Button onClick={handlePortal} disabled={loading} variant="outline">
                {loading ? "Loading…" : "Manage subscription"}
              </Button>
            ) : (
              <Button onClick={handleCheckout} disabled={loading}>
                {loading ? "Loading…" : "Subscribe — €34.99/mo"}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
