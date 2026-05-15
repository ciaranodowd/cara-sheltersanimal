"use client"
import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { CheckCircle, AlertTriangle } from "lucide-react"

interface DonationsSettingsProps {
  orgSlug: string
  stripeAccountId: string | null
  stripeOnboarded: boolean
  donationsEnabled: boolean
  isAdmin: boolean
}

function connectStatus(accountId: string | null, onboarded: boolean) {
  if (!accountId) {
    return {
      label: "Not connected",
      variant: "secondary" as const,
      description: "Connect a bank account so donors can send money directly to your shelter.",
    }
  }
  if (!onboarded) {
    return {
      label: "Onboarding incomplete",
      variant: "destructive" as const,
      description: "Finish setting up your Stripe account to start receiving donations.",
    }
  }
  return {
    label: "Connected",
    variant: "default" as const,
    description: "Your bank account is connected. Donations go directly to you — Cara takes no platform fee.",
  }
}

export function DonationsSettings({
  orgSlug,
  stripeAccountId,
  stripeOnboarded,
  donationsEnabled: initialEnabled,
  isAdmin,
}: DonationsSettingsProps) {
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [toggleLoading, setToggleLoading] = useState(false)
  const [error, setError] = useState("")
  const [enabled, setEnabled] = useState(initialEnabled)
  const [banner, setBanner] = useState<"reconnect" | null>(null)

  // Show a notice if Stripe redirected back with ?reconnect=1 (expired link)
  useEffect(() => {
    if (searchParams.get("reconnect") === "1") setBanner("reconnect")
  }, [searchParams])

  const { label, variant, description } = connectStatus(stripeAccountId, stripeOnboarded)

  async function handleConnect() {
    setLoading(true)
    setError("")
    try {
      const res = await fetch(`/api/orgs/${orgSlug}/stripe/connect`, { method: "POST" })
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

  async function handleManage() {
    setLoading(true)
    setError("")
    try {
      const res = await fetch(`/api/orgs/${orgSlug}/stripe/connect/login-link`, { method: "POST" })
      const data = await res.json()
      if (res.ok && data.url) {
        window.open(data.url, "_blank", "noopener,noreferrer")
      } else {
        setError(data.error ?? "Something went wrong")
      }
    } catch {
      setError("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  async function handleToggle(value: boolean) {
    setToggleLoading(true)
    setError("")
    try {
      const res = await fetch(`/api/orgs/${orgSlug}/donations/toggle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: value }),
      })
      const data = await res.json()
      if (res.ok) {
        setEnabled(data.donationsEnabled)
      } else {
        setError(data.error ?? "Failed to update donations setting")
      }
    } catch {
      setError("Something went wrong")
    } finally {
      setToggleLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Donations</CardTitle>
        <CardDescription>
          Connect a bank account via Stripe to receive donations directly from your public portal.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Reconnect notice */}
        {banner === "reconnect" && (
          <div className="flex items-start gap-2 text-sm bg-amber-50 border border-amber-200 text-amber-800 rounded-md px-3 py-2">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>Your Stripe onboarding link expired. Click <strong>Continue onboarding</strong> below to get a fresh link.</span>
          </div>
        )}

        {error && (
          <div className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">{error}</div>
        )}

        {/* Stripe Connect status */}
        <div className="flex items-start justify-between py-3 border-b gap-4">
          <div>
            <p className="text-sm font-medium">Bank account status</p>
            <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
          </div>
          <Badge
            variant={variant}
            className={stripeOnboarded ? "bg-green-600 text-white shrink-0" : "shrink-0"}
          >
            {stripeOnboarded && <CheckCircle className="h-3 w-3 mr-1" />}
            {label}
          </Badge>
        </div>

        {/* Connect / continue onboarding button */}
        {isAdmin && !stripeOnboarded && (
          <Button onClick={handleConnect} disabled={loading}>
            {loading
              ? "Loading…"
              : stripeAccountId
              ? "Continue onboarding"
              : "Connect bank account to receive donations"}
          </Button>
        )}

        {/* Enable/disable toggle — only once onboarded */}
        {stripeOnboarded && (
          <div className="flex items-center justify-between py-3 border-b gap-4">
            <div>
              <Label htmlFor="donations-toggle" className="text-sm font-medium">
                Show donate button on public portal
              </Label>
              <p className="text-sm text-muted-foreground mt-0.5">
                {enabled
                  ? "Donors can see and use the donation form on your portal."
                  : "The donation form is hidden from your public portal."}
              </p>
            </div>
            <Switch
              id="donations-toggle"
              checked={enabled}
              onCheckedChange={isAdmin ? handleToggle : undefined}
              disabled={!isAdmin || toggleLoading}
            />
          </div>
        )}

        {/* Manage Stripe account */}
        {stripeOnboarded && isAdmin && (
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">
              Donations are processed by Stripe and transferred directly to your bank account.
              Cara charges no platform fee.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleManage}
              disabled={loading}
            >
              {loading ? "Loading…" : "Manage Stripe account →"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
