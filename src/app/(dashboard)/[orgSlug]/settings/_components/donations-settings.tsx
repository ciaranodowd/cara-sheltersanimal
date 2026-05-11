"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface DonationsSettingsProps {
  orgSlug: string
  stripeAccountId: string | null
  stripeOnboarded: boolean
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
      description: "Finish setting up your account to start receiving donations.",
    }
  }
  return {
    label: "Connected",
    variant: "default" as const,
    description: "Your bank account is connected. Donations go directly to you — Cara takes no platform fee.",
  }
}

export function DonationsSettings({ orgSlug, stripeAccountId, stripeOnboarded, isAdmin }: DonationsSettingsProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
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
      </CardContent>
    </Card>
  )
}
