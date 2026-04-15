"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle } from "lucide-react"

const DEFAULT_TEMPLATE = `ADOPTION AGREEMENT

This agreement is entered into between {{org_name}} (hereinafter "the Rescue") and {{adopter_name}} (hereinafter "the Adopter").

Animal: {{animal_name}}
Date: {{date}}
Adoption fee: {{adoption_fee}}

TERMS AND CONDITIONS

1. CARE COMMITMENT
The Adopter agrees to provide {{animal_name}} with a safe, loving, and permanent home, including adequate food, clean water, appropriate shelter, and all necessary veterinary care.

2. VETERINARY CARE
The Adopter agrees to ensure {{animal_name}} receives all required vaccinations, parasite prevention, and veterinary treatment as recommended by a licensed veterinarian.

3. SUPERVISION
The Adopter agrees not to allow {{animal_name}} to roam unsupervised and to take all reasonable steps to ensure their safety.

4. NON-TRANSFER
The Adopter agrees not to sell, give away, or otherwise transfer ownership of {{animal_name}} without the prior written consent of the Rescue.

5. RIGHT OF RETURN
Should the Adopter be unable to keep {{animal_name}} at any time, they agree to contact the Rescue immediately and return {{animal_name}} if requested.

6. RIGHT OF RECLAIM
The Rescue reserves the right to reclaim {{animal_name}} if the conditions of this agreement are not met.

By signing below, the Adopter confirms they have read, understood, and agreed to the terms of this adoption agreement.`

const PLACEHOLDERS = [
  { key: "{{adopter_name}}", desc: "Full name of the adopter" },
  { key: "{{animal_name}}", desc: "Name of the animal being adopted" },
  { key: "{{org_name}}", desc: "Your shelter / rescue name" },
  { key: "{{date}}", desc: "Date of the contract" },
  { key: "{{adoption_fee}}", desc: "Adoption fee (e.g. €150.00)" },
  { key: "{{adopter_email}}", desc: "Adopter's email address" },
  { key: "{{adopter_address}}", desc: "Adopter's address" },
]

export function ContractTemplateSettings({ orgSlug, initialTemplate, isAdmin }: {
  orgSlug: string
  initialTemplate: string
  isAdmin: boolean
}) {
  const [template, setTemplate] = useState(initialTemplate || DEFAULT_TEMPLATE)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState("")

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError("")
    setSaved(false)
    const res = await fetch(`/api/orgs/${orgSlug}/contract-template`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contractTemplate: template }),
    })
    setSaving(false)
    if (res.ok) {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } else {
      const data = await res.json()
      setError(data.error ?? "Failed to save")
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Contract template</CardTitle>
          <CardDescription>
            This template is used to pre-populate adoption contracts. Use placeholders that are automatically replaced with real values when a contract is created.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && <div className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">{error}</div>}

          <div className="rounded-lg border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Available placeholders</p>
            </div>
            <table className="w-full text-sm">
              <tbody>
                {PLACEHOLDERS.map(p => (
                  <tr key={p.key} className="border-b border-slate-100 last:border-0">
                    <td className="px-4 py-2 font-mono text-xs text-primary font-medium whitespace-nowrap">{p.key}</td>
                    <td className="px-4 py-2 text-slate-500">{p.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Textarea
            rows={20}
            className="font-mono text-sm"
            value={template}
            onChange={e => setTemplate(e.target.value)}
            disabled={!isAdmin}
            placeholder="Enter your contract template…"
          />
        </CardContent>
      </Card>

      {isAdmin && (
        <div className="flex items-center justify-end gap-3">
          {saved && (
            <span className="flex items-center gap-1.5 text-sm text-green-600">
              <CheckCircle className="h-4 w-4" /> Saved
            </span>
          )}
          <Button type="submit" disabled={saving} style={{ backgroundColor: "#1a3a2a" }}>
            {saving ? "Saving…" : "Save template"}
          </Button>
        </div>
      )}
    </form>
  )
}
