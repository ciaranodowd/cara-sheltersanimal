"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, CheckCircle, Mail, UserCheck } from "lucide-react"
import Link from "next/link"

interface PersonFormProps {
  orgSlug: string
  orgId: string
  defaultType: string
}

const TYPE_LABELS: Record<string, string> = {
  adopter: "Adopter",
  volunteer: "Volunteer",
  donor: "Donor",
}

type SuccessMeta = {
  inviteSent?: boolean
  alreadyHasAccess?: boolean
  inviteError?: boolean
  email: string
}

export function PersonForm({ orgSlug, orgId, defaultType }: PersonFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [successMeta, setSuccessMeta] = useState<SuccessMeta | null>(null)

  const validDefault = ["adopter", "volunteer", "donor"].includes(defaultType) ? defaultType : "adopter"

  const [form, setForm] = useState({
    type: validDefault,
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    notes: "",
  })
  const [inviteToDashboard, setInviteToDashboard] = useState(false)

  function set(field: string) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(f => ({ ...f, [field]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const res = await fetch("/api/people", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          organizationId: orgId,
          inviteToDashboard: form.type === "volunteer" ? inviteToDashboard : false,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? "Something went wrong")
        return
      }
      setSuccessMeta({
        inviteSent: data.inviteSent,
        alreadyHasAccess: data.alreadyHasAccess,
        inviteError: data.inviteError,
        email: form.email,
      })
      const tabMap: Record<string, string> = { adopter: "adopters", volunteer: "volunteers", donor: "donors" }
      setTimeout(() => router.push(`/${orgSlug}/people?tab=${tabMap[form.type] ?? "adopters"}`), 2500)
    } catch {
      setError("Network error — please try again")
    } finally {
      setLoading(false)
    }
  }

  if (successMeta) {
    const isVolunteer = form.type === "volunteer"
    return (
      <div className="flex items-center justify-center py-24">
        <div className="bg-white rounded-xl border border-slate-100 p-10 text-center max-w-sm w-full space-y-3">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
          <h2 className="text-lg font-semibold text-slate-900">{TYPE_LABELS[form.type]} added</h2>

          {isVolunteer && inviteToDashboard && (
            <div className={`rounded-lg px-4 py-3 text-sm flex items-start gap-2 text-left ${
              successMeta.inviteSent
                ? "bg-green-50 border border-green-100 text-green-700"
                : successMeta.alreadyHasAccess
                ? "bg-blue-50 border border-blue-100 text-blue-700"
                : "bg-amber-50 border border-amber-100 text-amber-700"
            }`}>
              {successMeta.inviteSent ? (
                <><Mail className="h-4 w-4 shrink-0 mt-0.5" /><span>Invite sent to <strong>{successMeta.email}</strong></span></>
              ) : successMeta.alreadyHasAccess ? (
                <><UserCheck className="h-4 w-4 shrink-0 mt-0.5" /><span>Already has dashboard access</span></>
              ) : (
                <><Mail className="h-4 w-4 shrink-0 mt-0.5" /><span>Volunteer added, but the invite email failed to send. You can invite them from <strong>Settings → Team</strong>.</span></>
              )}
            </div>
          )}

          <p className="text-sm text-slate-500">Redirecting…</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="mb-6">
        <Link href={`/${orgSlug}/people`} className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 mb-4 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to people
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Add person</h1>
        <p className="text-sm text-slate-500 mt-0.5">Add a new contact to your organisation</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-xl border border-slate-100 divide-y divide-slate-50">

          <div className="p-6 space-y-4">
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Person type</h2>
            <div className="space-y-1.5">
              <Label htmlFor="type">Type <span className="text-red-500">*</span></Label>
              <Select
                value={form.type}
                onValueChange={v => {
                  setForm(f => ({ ...f, type: v }))
                  if (v !== "volunteer") setInviteToDashboard(false)
                }}
              >
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="adopter">Adopter</SelectItem>
                  <SelectItem value="volunteer">Volunteer</SelectItem>
                  <SelectItem value="donor">Donor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Personal details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="firstName">First name <span className="text-red-500">*</span></Label>
                <Input id="firstName" placeholder="Jane" value={form.firstName} onChange={set("firstName")} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lastName">Last name <span className="text-red-500">*</span></Label>
                <Input id="lastName" placeholder="Smith" value={form.lastName} onChange={set("lastName")} required />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
              <Input id="email" type="email" placeholder="jane@example.com" value={form.email} onChange={set("email")} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone number</Label>
              <Input id="phone" type="tel" placeholder="+353 87 123 4567" value={form.phone} onChange={set("phone")} />
            </div>
          </div>

          {form.type === "adopter" && (
            <div className="p-6 space-y-4">
              <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Address</h2>
              <div className="space-y-1.5">
                <Label htmlFor="address">Address</Label>
                <Input id="address" placeholder="123 Main St, Dublin" value={form.address} onChange={set("address")} />
              </div>
            </div>
          )}

          {form.type === "volunteer" && (
            <div className="p-6 space-y-4">
              <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Dashboard access</h2>
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-[#1a3a2a] cursor-pointer"
                  checked={inviteToDashboard}
                  onChange={e => setInviteToDashboard(e.target.checked)}
                />
                <div>
                  <p className="text-sm font-medium text-slate-900 group-hover:text-slate-700">
                    Invite to dashboard
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Sends a password setup email so this volunteer can log in and access the shelter dashboard.
                  </p>
                </div>
              </label>
            </div>
          )}

          <div className="p-6 space-y-4">
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Notes</h2>
            <div className="space-y-1.5">
              <Label htmlFor="notes">Internal notes</Label>
              <Textarea id="notes" placeholder="Any additional information…" rows={3} value={form.notes} onChange={set("notes")} />
            </div>
          </div>

        </div>

        {error && (
          <div className="mt-4 rounded-lg bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        <div className="mt-6 flex items-center justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" disabled={loading} style={{ backgroundColor: "#1a3a2a" }}>
            {loading ? "Saving…" : `Add ${TYPE_LABELS[form.type] ?? "person"}`}
          </Button>
        </div>
      </form>
    </>
  )
}
