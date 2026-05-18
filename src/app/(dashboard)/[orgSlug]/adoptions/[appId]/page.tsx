"use client"
import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { AlertTriangle, ArrowLeft, Loader2, MessageSquare, Send } from "lucide-react"

const STATUS_OPTIONS = [
  { value: "PENDING", label: "Pending" },
  { value: "UNDER_REVIEW", label: "Reviewing" },
  { value: "HOME_CHECK_SCHEDULED", label: "Home check" },
  { value: "APPROVED", label: "Approved" },
  { value: "CONTRACT_SENT", label: "Contract sent" },
  { value: "COMPLETED", label: "Completed" },
  { value: "REJECTED", label: "Rejected" },
]

const STATUS_ORDER = ["PENDING", "UNDER_REVIEW", "HOME_CHECK_SCHEDULED", "APPROVED", "CONTRACT_SENT", "COMPLETED"]

function labelFor(value: string) {
  return STATUS_OPTIONS.find(s => s.value === value)?.label ?? value.replace(/_/g, " ")
}

function isBackwardsMove(current: string, next: string) {
  if (current === next) return false
  if (current === "REJECTED") return true
  if (current === "APPROVED") {
    const nextIdx = STATUS_ORDER.indexOf(next)
    return nextIdx !== -1 && nextIdx < STATUS_ORDER.indexOf("APPROVED")
  }
  return false
}

export default function ApplicationPage() {
  const params = useParams()
  const router = useRouter()
  const [app, setApp] = useState<any & { conversationId?: string | null }>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [sending, setSending] = useState(false)
  const [sendResult, setSendResult] = useState<{ ok: boolean; message: string } | null>(null)
  const [notes, setNotes] = useState("")
  const [status, setStatus] = useState("")
  const [showConfirm, setShowConfirm] = useState(false)

  useEffect(() => {
    fetch(`/api/applications/${params.appId}`)
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(data => {
        setApp(data)
        setNotes(data.internalNotes ?? "")
        setStatus(data.status ?? "PENDING")
        setLoading(false)
      })
      .catch(() => {
        setApp(null)
        setLoading(false)
      })
  }, [params.appId])

  async function saveStatus() {
    setShowConfirm(false)
    setSaving(true)
    await fetch(`/api/applications/${params.appId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, internalNotes: notes }),
    })
    setSaving(false)
    router.refresh()
  }

  function handleSaveClick() {
    if (app && isBackwardsMove(app.status, status)) {
      setShowConfirm(true)
    } else {
      saveStatus()
    }
  }

  async function sendContract() {
    setSending(true)
    setSendResult(null)
    try {
      const res = await fetch(`/api/applications/${params.appId}/contract/send`, { method: "POST" })
      const data = await res.json()
      if (!res.ok) {
        setSendResult({ ok: false, message: data.error ?? "Failed to send contract email" })
      } else {
        setSendResult({ ok: true, message: `Contract email sent to ${app.applicantEmail}` })
        setApp((a: any) => ({ ...a, status: "CONTRACT_SENT" }))
        setStatus("CONTRACT_SENT")
      }
    } catch {
      setSendResult({ ok: false, message: "Network error — please try again" })
    } finally {
      setSending(false)
    }
  }

  if (loading) return <div className="p-6 flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</div>
  if (!app) return <div className="p-6">Application not found</div>

  const fields = [
    ["Applicant", app.applicantName],
    ["Email", app.applicantEmail],
    ["Phone", app.applicantPhone ?? "—"],
    ["Address", app.applicantAddress ?? "—"],
    ["County", app.applicantCounty ?? "—"],
    ["Home type", app.householdType ?? "—"],
    ["Rent or own", app.rentOrOwn ?? "—"],
    ["Landlord permission", app.rentOrOwn === "rent" ? (app.landlordPermission ? "Yes" : "No / not stated") : "N/A"],
    ["Has garden", app.hasGarden ? "Yes" : "No"],
    ["Garden fenced", app.gardenFenced != null ? (app.gardenFenced ? "Yes" : "No") : "—"],
    ["Has children", app.hasChildren ? "Yes" : "No"],
    ["Children's ages", app.childrenAges ?? "—"],
    ["Has other pets", app.hasOtherPets ? "Yes" : "No"],
    ["Other pets", app.otherPetsDetails ?? "—"],
    ["Experience level", app.experienceLevel ?? "—"],
    ["Working hours", app.workingHours ?? "—"],
  ]

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6">
      <Link href={`/${params.orgSlug}/adoptions`}>
        <Button variant="ghost" size="sm" className="gap-1.5">
          <ArrowLeft className="h-4 w-4" /> Adoptions
        </Button>
      </Link>

      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              app.applicationType === "FOSTER"
                ? "bg-blue-100 text-blue-700"
                : "bg-primary/10 text-primary"
            }`}>
              {app.applicationType === "FOSTER" ? "Foster application" : "Adoption application"}
            </span>
          </div>
          <h1 className="text-2xl font-bold">{app.applicantName}</h1>
          <p className="text-muted-foreground text-sm">
            For {app.animal?.name} · {new Date(app.createdAt).toLocaleDateString("en-IE")}
          </p>
        </div>
        <Badge className="text-sm">{app.status.replace(/_/g, " ")}</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Applicant details</CardTitle></CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2.5 text-sm">
                {fields.map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-muted-foreground">{label}</dt>
                    <dd className="font-medium">{value ?? "—"}</dd>
                  </div>
                ))}
              </dl>
            </CardContent>
          </Card>

          {app.whyAdopt && (
            <Card>
              <CardHeader><CardTitle className="text-base">Why do you want to adopt?</CardTitle></CardHeader>
              <CardContent><p className="text-sm whitespace-pre-wrap">{app.whyAdopt}</p></CardContent>
            </Card>
          )}

          {app.previousPets && (
            <Card>
              <CardHeader><CardTitle className="text-base">Previous pets</CardTitle></CardHeader>
              <CardContent><p className="text-sm whitespace-pre-wrap">{app.previousPets}</p></CardContent>
            </Card>
          )}
        </div>

        {/* Actions panel */}
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Update status</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map(s => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Internal notes</Label>
                <Textarea rows={4} value={notes} onChange={e => setNotes(e.target.value)}
                  placeholder="Notes visible to staff only…" />
              </div>
              <Button className="w-full" onClick={handleSaveClick} disabled={saving}>
                {saving ? "Saving…" : "Save & Notify Applicant"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Messages</CardTitle></CardHeader>
            <CardContent>
              {app.conversationId ? (
                <Button className="w-full gap-2" variant="outline" asChild>
                  <Link href={`/${params.orgSlug}/messages/${app.conversationId}`}>
                    <MessageSquare className="h-4 w-4" />
                    Message applicant
                  </Link>
                </Button>
              ) : (
                <p className="text-sm text-muted-foreground">No conversation found for this application.</p>
              )}
            </CardContent>
          </Card>

          <Card>
              <CardHeader><CardTitle className="text-base">Contract & e-signature</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {app.contract?.signedAt ? (
                  <div className="rounded-lg bg-green-50 border border-green-100 px-3 py-2.5 text-sm text-green-700 space-y-1">
                    <p className="font-medium">Adoption complete</p>
                    <p className="text-xs">Signed {new Date(app.contract.signedAt).toLocaleDateString("en-IE")} by {app.contract.signatureData}</p>
                  </div>
                ) : app.status === "CONTRACT_SENT" ? (
                  <div className="rounded-lg bg-amber-50 border border-amber-100 px-3 py-2.5 text-sm text-amber-700 space-y-2">
                    <p className="font-medium">Awaiting signature</p>
                    <p className="text-xs">Contract sent to {app.applicantEmail}</p>
                  </div>
                ) : null}

                {sendResult && (
                  <div className={`rounded-lg px-3 py-2.5 text-sm ${sendResult.ok ? "bg-green-50 border border-green-100 text-green-700" : "bg-red-50 border border-red-100 text-red-700"}`}>
                    {sendResult.message}
                  </div>
                )}

                <Button className="w-full" variant="outline" asChild>
                  <Link href={`/${params.orgSlug}/adoptions/${params.appId}/contract`}>
                    {app.contract ? "View / edit contract" : "Prepare contract"}
                  </Link>
                </Button>

                {!app.contract?.signedAt && (
                  <Button className="w-full gap-2" onClick={sendContract} disabled={sending} style={{ backgroundColor: "#1a3a2a" }}>
                    {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    {sending ? "Sending…" : "Send contract for signing"}
                  </Button>
                )}
              </CardContent>
            </Card>
        </div>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full space-y-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h3 className="font-semibold text-slate-900 text-sm">Update application status?</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  This applicant was previously marked as <strong>{labelFor(app.status)}</strong> — are you sure you want to update their status to <strong>{labelFor(status)}</strong>? They will receive a new email notification.
                </p>
              </div>
            </div>
            <div className="flex gap-3 justify-end pt-1">
              <Button variant="outline" size="sm" onClick={() => setShowConfirm(false)}>Cancel</Button>
              <Button size="sm" onClick={saveStatus} disabled={saving}>
                {saving ? "Saving…" : "Confirm"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
