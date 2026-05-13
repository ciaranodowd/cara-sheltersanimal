"use client"
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Loader2, FileText, CheckCircle, Send, Clock, Copy, Check } from "lucide-react"

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

function resolvePlaceholders(template: string, data: {
  adopterName: string
  animalName: string
  orgName: string
  adoptionFee?: string
  adopterEmail?: string
  adopterAddress?: string
  animalSpecies?: string
  animalMicrochip?: string
}) {
  const fee = data.adoptionFee ? `€${parseFloat(data.adoptionFee).toFixed(2)}` : "{{adoption_fee}}"
  return template
    .replace(/\{\{adopter_name\}\}/g, data.adopterName)
    .replace(/\{\{animal_name\}\}/g, data.animalName)
    .replace(/\{\{org_name\}\}/g, data.orgName)
    .replace(/\{\{date\}\}/g, new Date().toLocaleDateString("en-IE", { day: "2-digit", month: "long", year: "numeric" }))
    .replace(/\{\{adoption_fee\}\}/g, fee)
    .replace(/\{\{adopter_email\}\}/g, data.adopterEmail ?? "")
    .replace(/\{\{adopter_address\}\}/g, data.adopterAddress ?? "")
    .replace(/\{\{animal_species\}\}/g, data.animalSpecies ?? "")
    .replace(/\{\{animal_microchip\}\}/g, data.animalMicrochip ?? "Not microchipped")
}

export default function ContractPage() {
  const params = useParams<{ orgSlug: string; appId: string }>()
  const router = useRouter()

  const [app, setApp] = useState<any>(null)
  const [contract, setContract] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [sending, setSending] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState("")
  const [sendError, setSendError] = useState("")
  const [sentInfo, setSentInfo] = useState<{ sentAt: string; signingUrl: string } | null>(null)
  const [copied, setCopied] = useState(false)

  const [form, setForm] = useState({ adoptionFee: "", contractText: "" })

  useEffect(() => {
    fetch(`/api/applications/${params.appId}`)
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(data => {
        setApp(data)
        if (data.contract) {
          setContract(data.contract)
          setForm({
            adoptionFee: data.contract.adoptionFee ? String(data.contract.adoptionFee) : "",
            contractText: data.contract.contractText ?? "",
          })
          if (data.contract.sentAt) {
            const baseUrl = window.location.origin
            setSentInfo({
              sentAt: data.contract.sentAt,
              signingUrl: `${baseUrl}/sign/${data.contract.signingToken}`,
            })
          }
        } else {
          // Auto-populate from org template or built-in default
          const template = data.organization?.contractTemplate || DEFAULT_TEMPLATE
          setForm(f => ({
            ...f,
            contractText: resolvePlaceholders(template, {
              adopterName: data.applicantName ?? "",
              animalName: data.animal?.name ?? "",
              orgName: data.organization?.name ?? "",
              adopterEmail: data.applicantEmail,
              adopterAddress: data.applicantAddress,
              animalSpecies: data.animal?.species
                ? data.animal.species.charAt(0) + data.animal.species.slice(1).toLowerCase()
                : "",
              animalMicrochip: data.animal?.microchipNumber ?? undefined,
            }),
          }))
        }
        setLoading(false)
      })
      .catch(() => {
        setApp(null)
        setLoading(false)
      })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.appId])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setSaving(true)
    try {
      const res = await fetch(`/api/applications/${params.appId}/contract`, {
        method: contract ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adoptionFee: form.adoptionFee ? parseFloat(form.adoptionFee) : null,
          contractText: form.contractText,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? "Failed to save"); return }
      setContract(data)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {
      setError("Network error — please try again")
    } finally {
      setSaving(false)
    }
  }

  async function handleSend() {
    setSendError("")
    setSending(true)
    try {
      const res = await fetch(`/api/applications/${params.appId}/contract/send`, {
        method: "POST",
      })
      const data = await res.json()
      if (!res.ok) { setSendError(data.error ?? "Failed to send"); return }
      setSentInfo({ sentAt: data.sentAt, signingUrl: data.signingUrl })
      setContract((c: any) => ({ ...c, sentAt: data.sentAt }))
    } catch {
      setSendError("Network error — please try again")
    } finally {
      setSending(false)
    }
  }

  function copyLink() {
    if (!sentInfo?.signingUrl) return
    navigator.clipboard.writeText(sentInfo.signingUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    )
  }

  if (!app) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-500">Application not found</p>
      </div>
    )
  }

  const isSigned = !!contract?.signedAt
  const isSent = !!sentInfo || !!contract?.sentAt

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-6">
        <div>
          <Link href={`/${params.orgSlug}/adoptions/${params.appId}`} className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 mb-4 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to application
          </Link>
          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6 text-slate-400" />
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Adoption contract</h1>
              <p className="text-sm text-slate-500">{app.applicantName} · {app.animal?.name}</p>
            </div>
          </div>
        </div>

        {/* Signed banner */}
        {isSigned && (
          <div className="bg-green-50 border border-green-100 rounded-xl px-5 py-3 flex items-center gap-2 text-sm text-green-700">
            <CheckCircle className="h-4 w-4 shrink-0" />
            <span>
              Signed by <strong>{contract.signatureData}</strong> on {new Date(contract.signedAt).toLocaleDateString("en-IE", { day: "2-digit", month: "long", year: "numeric" })} · IP: {contract.signerIp}
            </span>
          </div>
        )}

        {/* Sent / awaiting banner */}
        {!isSigned && isSent && (
          <div className="bg-amber-50 border border-amber-100 rounded-xl px-5 py-4 space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-amber-800">
              <Clock className="h-4 w-4 shrink-0" />
              Contract sent — awaiting signature from {app.applicantName}
            </div>
            {sentInfo?.signingUrl && (
              <div className="flex items-center gap-2">
                <code className="flex-1 text-xs bg-amber-100 text-amber-800 px-3 py-1.5 rounded-md truncate">{sentInfo.signingUrl}</code>
                <Button type="button" size="sm" variant="outline" className="shrink-0 gap-1.5 text-xs" onClick={copyLink}>
                  {copied ? <><Check className="h-3 w-3" /> Copied</> : <><Copy className="h-3 w-3" /> Copy link</>}
                </Button>
              </div>
            )}
            <p className="text-xs text-amber-700">
              You can resend the email or share the link above directly with the adopter.
            </p>
          </div>
        )}

        <form onSubmit={handleSave}>
          <div className="bg-white rounded-xl border border-slate-100 divide-y divide-slate-50">

            <div className="p-6 space-y-4">
              <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Adoption fee</h2>
              <div className="space-y-1.5 max-w-xs">
                <Label htmlFor="fee">Fee (€)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none">€</span>
                  <Input
                    id="fee"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    className="pl-7"
                    value={form.adoptionFee}
                    onChange={e => setForm(f => ({ ...f, adoptionFee: e.target.value }))}
                    disabled={isSigned}
                  />
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Contract text</h2>
              <div className="space-y-1.5">
                <Label htmlFor="contractText">Contract <span className="text-red-500">*</span></Label>
                <Textarea
                  id="contractText"
                  rows={20}
                  className="font-mono text-sm"
                  value={form.contractText}
                  onChange={e => setForm(f => ({ ...f, contractText: e.target.value }))}
                  required
                  disabled={isSigned}
                />
              </div>
            </div>

          </div>

          {error && (
            <div className="mt-4 rounded-lg bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">{error}</div>
          )}

          {!isSigned && (
            <div className="mt-6 flex items-center justify-end gap-3">
              {saved && (
                <span className="flex items-center gap-1.5 text-sm text-green-600">
                  <CheckCircle className="h-4 w-4" /> Saved
                </span>
              )}
              <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
              <Button type="submit" disabled={saving} style={{ backgroundColor: "#1a3a2a" }}>
                {saving ? "Saving…" : contract ? "Update contract" : "Save contract"}
              </Button>
            </div>
          )}
        </form>

        {/* Send for e-signature section */}
        {contract && !isSigned && (
          <div className="bg-white rounded-xl border border-slate-100 p-6 space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Send for e-signature</h2>
              <p className="text-sm text-slate-500 mt-1">
                {isSent
                  ? "Resend the signing email or share the link above with the adopter."
                  : `Send a signing link to ${app.applicantEmail}. The adopter will type their name to sign electronically.`
                }
              </p>
            </div>
            {sendError && (
              <div className="rounded-lg px-4 py-3 text-sm bg-red-50 border border-red-100 text-red-700">{sendError}</div>
            )}
            <div className="flex gap-3">
              <Button
                type="button"
                onClick={handleSend}
                disabled={sending}
                style={{ backgroundColor: "#1a3a2a" }}
                className="gap-2"
              >
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {sending ? "Sending…" : isSent ? "Resend signing email" : "Send contract for signing"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
