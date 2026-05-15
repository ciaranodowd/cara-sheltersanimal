"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

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
  const [loading, setLoading] = useState(false)
  const [toggleLoading, setToggleLoading] = useState(false)
  const [error, setError] = useState("")
  const [enabled, setEnabled] = useState(initialEnabled)

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
        {error && (
          <div className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">{error}</div>
        )}

        {/* Stripe Connect status */}
        <div className="flex items-start justify-between py-3 border-b gap-4">
          <div>
            <p className="text-sm font-medium">Bank account status</p>
            <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
          </div>
          <Badge variant={variant} className="shrink-0">{label}</Badge>
        </div>

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

        {stripeOnboarded && (
          <div className="text-xs text-muted-foreground space-y-1">
            <p>Donations are processed by Stripe and transferred directly to your bank account.</p>
            <p>Cara charges no platform fee on donations.</p>
            {isAdmin && (
              <Button variant="link" className="h-auto p-0 text-xs" onClick={handleConnect} disabled={loading}>
                Manage Stripe account →
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
