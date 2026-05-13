"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle } from "lucide-react"

const DEFAULT_TEMPLATE = `ADOPTION AGREEMENT

This Adoption Agreement ("Agreement") is entered into between {{org_name}} ("the Rescue") and {{adopter_name}} of {{adopter_address}} (email: {{adopter_email}}) ("the Adopter").

ANIMAL DETAILS
Name:           {{animal_name}}
Species / Type: {{animal_species}}
Microchip No.:  {{animal_microchip}}
Date:           {{date}}
Adoption Fee:   {{adoption_fee}}

TERMS AND CONDITIONS

1. CARE COMMITMENT
The Adopter agrees to provide {{animal_name}} with a safe, loving, and permanent home, including adequate food, clean water, appropriate shelter, regular exercise, and all necessary veterinary care. The Adopter confirms they are aware of the responsibilities involved in caring for {{animal_name}} and accept full duty of care as required under the Animal Health and Welfare Act 2013.

2. VETERINARY CARE
The Adopter agrees to ensure {{animal_name}} receives all required vaccinations, parasite prevention, and veterinary treatment as recommended by a licensed veterinarian. The Adopter acknowledges the current health and vaccination status of {{animal_name}} as represented by the Rescue at the time of adoption.

3. SPAY / NEUTER
If {{animal_name}} has not already been spayed or neutered, the Adopter agrees to have this procedure carried out by a licensed veterinarian within a reasonable time period as agreed with the Rescue.

4. NO BREEDING
The Adopter agrees that {{animal_name}} will not be used for breeding, stud, or any commercial reproductive purpose.

5. SUPERVISION AND SECURE ENVIRONMENT
The Adopter agrees not to allow {{animal_name}} to roam unsupervised and to take all reasonable steps to ensure their safety. Dogs must be kept within a securely fenced property or on a lead in public at all times, in accordance with the Control of Dogs Act 1986. The Adopter agrees to keep {{animal_name}} in an environment appropriate to their species and welfare needs.

6. NON-TRANSFER
The Adopter agrees not to sell, give away, transfer ownership of, surrender to a laboratory or research facility, or otherwise rehome {{animal_name}} without the prior written consent of the Rescue. This Agreement is personal to the Adopter and is not assignable.

7. RIGHT OF RETURN
Should the Adopter be unable to keep {{animal_name}} at any time, they agree to contact the Rescue immediately and return {{animal_name}} to the Rescue. The Adopter agrees not to surrender {{animal_name}} to any third party, pound, or shelter without first contacting the Rescue.

8. RIGHT OF INSPECTION
The Rescue reserves the right to carry out a home visit or welfare check on {{animal_name}} at any reasonable time, with advance notice. The Adopter agrees to cooperate with any such inspection.

9. RIGHT OF RECLAIM
The Rescue reserves the right to reclaim {{animal_name}} if, in the Rescue's reasonable opinion, the conditions of this Agreement are not being met. The Rescue will give reasonable notice and an opportunity to remedy any breach, except where the welfare of {{animal_name}} requires immediate action.

10. MICROCHIP TRANSFER
The Adopter agrees to transfer the microchip registration for {{animal_name}} (microchip no. {{animal_microchip}}) into their name within 30 days of this Agreement. This is a legal requirement under the Microchipping of Dogs Regulations 2015 (S.I. No. 63 of 2015).

11. LIMITATION OF LIABILITY
The Rescue shall not be liable for any injury, loss, damage, or expense suffered by the Adopter or any third party arising from the behaviour of {{animal_name}} following adoption. The Adopter accepts full responsibility for {{animal_name}} from the date of this Agreement.

12. GOVERNING LAW
This Agreement shall be governed by and construed in accordance with the laws of Ireland. Any dispute arising under this Agreement shall be subject to the exclusive jurisdiction of the Irish courts.

13. ENTIRE AGREEMENT
This Agreement constitutes the entire agreement between the parties in respect of the adoption of {{animal_name}} and supersedes all prior discussions, representations, and agreements.

14. SEVERABILITY
If any provision of this Agreement is found to be invalid or unenforceable, the remaining provisions shall continue in full force and effect.

By signing below, the Adopter confirms they have read, understood, and agreed to all terms of this Adoption Agreement.`

const PLACEHOLDERS = [
  { key: "{{adopter_name}}", desc: "Full name of the adopter" },
  { key: "{{adopter_email}}", desc: "Adopter's email address" },
  { key: "{{adopter_address}}", desc: "Adopter's home address" },
  { key: "{{animal_name}}", desc: "Name of the animal being adopted" },
  { key: "{{animal_species}}", desc: "Species of the animal (e.g. Dog, Cat)" },
  { key: "{{animal_microchip}}", desc: "Animal's microchip number (or 'Not microchipped')" },
  { key: "{{org_name}}", desc: "Your shelter / rescue name" },
  { key: "{{date}}", desc: "Date of the contract" },
  { key: "{{adoption_fee}}", desc: "Adoption fee (e.g. €150.00)" },
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
