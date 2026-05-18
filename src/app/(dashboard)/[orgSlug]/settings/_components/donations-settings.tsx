"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"

interface DonationsSettingsProps {
  orgSlug: string
  donationUrl: string | null
  isAdmin: boolean
}

export function DonationsSettings({
  orgSlug,
  donationUrl: initialDonationUrl,
  isAdmin,
}: DonationsSettingsProps) {
  const [donationUrl, setDonationUrl] = useState(initialDonationUrl ?? "")
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState("")

  async function handleSave() {
    setSaving(true)
    setError("")
    setSaved(false)
    try {
      const res = await fetch(`/api/orgs/${orgSlug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ donationUrl: donationUrl.trim() || null }),
      })
      const data = await res.json()
      if (res.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      } else {
        setError(data.error ?? "Failed to save")
      }
    } catch {
      setError("Something went wrong")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Donations</CardTitle>
        <CardDescription>
          Add a link to your donation page so applicants can support your shelter after applying.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="donation-url" className="text-sm font-medium">Donation Link</Label>
          <p className="text-sm text-muted-foreground mt-0.5">
            Paste a GoFundMe, iDonate, or PayPal link. Applicants will see a donate button
            after submitting an adoption application.
          </p>
        </div>
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
        <div className="flex gap-2">
          <Input
            id="donation-url"
            type="url"
            placeholder="https://www.gofundme.com/your-page"
            value={donationUrl}
            onChange={e => setDonationUrl(e.target.value)}
            disabled={!isAdmin || saving}
            className="flex-1"
          />
          {isAdmin && (
            <Button variant="outline" onClick={handleSave} disabled={saving}>
              {saving ? "Saving…" : saved ? "Saved ✓" : "Save"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
