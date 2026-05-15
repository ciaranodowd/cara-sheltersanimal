"use client"
import { useState } from "react"
import { CheckCircle, Clock, AlertTriangle, CalendarClock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Props {
  orgSlug: string
  plan: string
  planStatus: string
  trialEndDate: string | null
  subscriptionStatus: string | null
  cancelAt: string | null
  cancelAtPeriodEnd: boolean
  isAdmin: boolean
}

const FEATURES = [
  "Unlimited animals & intake records",
  "Full adoption workflow & e-sign contracts",
  "Public adoption portal for your shelter",
  "Team access with role-based permissions",
  "Email templates & donor tracking",
  "GDPR tools & reporting",
]

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

export function BillingClient({
  orgSlug,
  plan,
  trialEndDate,
  subscriptionStatus,
  cancelAt,
  cancelAtPeriodEnd,
  isAdmin,
}: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const trialDate = trialEndDate ? new Date(trialEndDate) : null
  const trialDaysLeft = trialDate
    ? Math.max(0, Math.ceil((trialDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0

  const isPro = plan === "pro"
  // Pending cancel: active subscription scheduled to end
  const cancelDate = cancelAt ? new Date(cancelAt) : null
  const isPendingCancel = isPro && (cancelAtPeriodEnd || (cancelDate !== null && cancelDate > new Date()))
  const isExpired = plan === "trial" && trialDaysLeft === 0
  const isActiveTrial = plan === "trial" && trialDaysLeft > 0

  async function handleUpgrade() {
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

  return (
    <div className="space-y-4">
      {error && (
        <div className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">{error}</div>
      )}

      {/* ── Active subscription (no pending cancel) ── */}
      {isPro && !isPendingCancel && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
              <Badge className="bg-green-600 text-white hover:bg-green-600">Cara Pro ✓</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="font-semibold text-green-800">You&apos;re on Cara Pro — €34.99/month</p>
            <p className="text-sm text-green-700">Thank you for supporting Cara.</p>
            {isAdmin && (
              <Button variant="outline" onClick={handlePortal} disabled={loading}>
                {loading ? "Loading…" : "Manage subscription"}
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── Active but cancellation scheduled ── */}
      {isPendingCancel && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <CalendarClock className="h-5 w-5 text-amber-600 shrink-0" />
              <Badge className="bg-amber-500 text-white hover:bg-amber-500">Cancelling</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="font-semibold text-amber-800">
              Your subscription is active until{" "}
              {cancelDate ? formatDate(cancelDate.toISOString()) : "end of billing period"}.
            </p>
            <p className="text-sm text-amber-700">
              You have full access until then. After that, your account will move to the free plan.
            </p>
            {isAdmin && (
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={handlePortal} disabled={loading}>
                  {loading ? "Loading…" : "Manage subscription"}
                </Button>
                <Button
                  onClick={handleUpgrade}
                  disabled={loading}
                  className="bg-[#1a3a2a] hover:bg-[#1a3a2a]/90 text-white"
                >
                  {loading ? "Loading…" : "Resubscribe"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── Active trial ── */}
      {isActiveTrial && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-blue-500 shrink-0" />
              <Badge className="bg-blue-500 text-white hover:bg-blue-500">Free Trial</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm font-medium text-blue-800">
              You have {trialDaysLeft} day{trialDaysLeft !== 1 ? "s" : ""} left on your free trial
            </p>
            {isAdmin && (
              <Button
                onClick={handleUpgrade}
                disabled={loading}
                className="bg-[#1a3a2a] hover:bg-[#1a3a2a]/90 text-white"
              >
                {loading ? "Loading…" : "Upgrade to Cara Pro — €34.99/month"}
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── Trial expired / subscription ended ── */}
      {isExpired && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-red-500 shrink-0" />
              <Badge className="bg-red-500 text-white hover:bg-red-500">
                {subscriptionStatus === "CANCELLED" ? "Subscription ended" : "Trial Expired"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm font-medium text-red-800">
              {subscriptionStatus === "CANCELLED"
                ? "Your subscription has ended."
                : "Your free trial has ended."}
            </p>
            <p className="text-sm text-red-700">
              Subscribe to Cara Pro to continue using all features.
            </p>
            {isAdmin && (
              <Button
                onClick={handleUpgrade}
                disabled={loading}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {loading ? "Loading…" : "Subscribe to Cara Pro — €34.99/month"}
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-3">
          <p className="text-base font-semibold">What&apos;s included in Cara Pro</p>
        </CardHeader>
        <CardContent>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
            {FEATURES.map(f => (
              <li key={f} className="flex items-start gap-2">
                <CheckCircle className="h-3.5 w-3.5 text-green-500 shrink-0 mt-0.5" />
                {f}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
