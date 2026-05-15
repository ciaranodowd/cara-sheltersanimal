"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { ArrowLeft, Mail, Phone, MapPin, FileText, Clock, Pencil, Trash2, Loader2 } from "lucide-react"
import { formatDate } from "@/lib/utils"

export type VolunteerData = {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string | null
  county: string | null
  skills: string
  isHomeChecker: boolean
  isDriver: boolean
  available: boolean
  hoursLogged: number
  notes: string | null
  createdAt: string
}

function parseSkills(raw: string): string[] {
  try { return JSON.parse(raw) } catch { return [] }
}

export function VolunteerDetail({ volunteer: initial, orgSlug }: { volunteer: VolunteerData; orgSlug: string }) {
  const router = useRouter()
  const [volunteer, setVolunteer] = useState(initial)
  const [mode, setMode] = useState<"view" | "edit">("view")
  const [form, setForm] = useState({ ...initial, hoursLogged: String(initial.hoursLogged) })
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState("")
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  function field(key: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(f => ({ ...f, [key]: e.target.value }))
  }

  function startEdit() {
    setForm({ ...volunteer, hoursLogged: String(volunteer.hoursLogged) })
    setError("")
    setMode("edit")
  }

  function cancelEdit() {
    setError("")
    setMode("view")
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setSaving(true)
    try {
      const res = await fetch(`/api/people/volunteers/${volunteer.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phone: form.phone || null,
          county: form.county || null,
          notes: form.notes || null,
          isHomeChecker: form.isHomeChecker,
          isDriver: form.isDriver,
          available: form.available,
          hoursLogged: form.hoursLogged,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? "Failed to save"); return }
      setVolunteer({ ...data, createdAt: volunteer.createdAt })
      setMode("view")
    } catch {
      setError("Network error — please try again")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      const res = await fetch(`/api/people/volunteers/${volunteer.id}`, { method: "DELETE" })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? "Failed to delete")
        setShowDeleteDialog(false)
        return
      }
      router.push(`/${orgSlug}/people?tab=volunteers`)
    } catch {
      setError("Network error — please try again")
      setShowDeleteDialog(false)
    } finally {
      setDeleting(false)
    }
  }

  const skills = parseSkills(volunteer.skills)

  if (mode === "edit") {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-6 pb-28 sm:pb-6">
          <div>
            <button onClick={cancelEdit} className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 mb-4 transition-colors">
              <ArrowLeft className="h-4 w-4" /> Cancel
            </button>
            <h1 className="text-2xl font-bold text-slate-900">Edit volunteer</h1>
          </div>

          <form id="volunteer-edit-form" onSubmit={handleSave}>
            <div className="bg-white rounded-xl border border-slate-100 divide-y divide-slate-50">

              <div className="p-6 space-y-4">
                <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Personal details</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="firstName">First name <span className="text-red-500">*</span></Label>
                    <Input id="firstName" value={form.firstName} onChange={field("firstName")} required className="h-11 sm:h-10" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="lastName">Last name <span className="text-red-500">*</span></Label>
                    <Input id="lastName" value={form.lastName} onChange={field("lastName")} required className="h-11 sm:h-10" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                    <Input id="email" type="email" value={form.email} onChange={field("email")} required className="h-11 sm:h-10" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" type="tel" value={form.phone ?? ""} onChange={field("phone")} className="h-11 sm:h-10" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="county">County</Label>
                  <Input id="county" placeholder="e.g. Dublin" value={form.county ?? ""} onChange={field("county")} className="h-11 sm:h-10" />
                </div>
              </div>

              <div className="p-6 space-y-4">
                <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Roles & availability</h2>
                <div className="space-y-3">
                  {[
                    { key: "isHomeChecker" as const, label: "Home checker", desc: "Can conduct home visits for adoption applications" },
                    { key: "isDriver" as const, label: "Driver", desc: "Available to transport animals" },
                    { key: "available" as const, label: "Currently available", desc: "Actively available to volunteer" },
                  ].map(({ key, label, desc }) => (
                    <label key={key} className="flex items-start gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-[#1a3a2a] cursor-pointer"
                        checked={Boolean(form[key])}
                        onChange={e => setForm(f => ({ ...f, [key]: e.target.checked }))}
                      />
                      <div>
                        <p className="text-sm font-medium text-slate-900">{label}</p>
                        <p className="text-xs text-slate-500">{desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="p-6 space-y-4">
                <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Hours logged</h2>
                <div className="space-y-1.5 max-w-xs">
                  <Label htmlFor="hoursLogged">Total hours</Label>
                  <Input
                    id="hoursLogged"
                    type="number"
                    min="0"
                    step="0.5"
                    value={form.hoursLogged}
                    onChange={field("hoursLogged")}
                  />
                </div>
              </div>

              <div className="p-6 space-y-4">
                <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Notes</h2>
                <div className="space-y-1.5">
                  <Label htmlFor="notes">Internal notes</Label>
                  <Textarea id="notes" rows={3} value={form.notes ?? ""} onChange={field("notes")} placeholder="Any additional information…" />
                </div>
              </div>

            </div>

            {error && (
              <div className="mt-4 rounded-lg bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">{error}</div>
            )}

            {/* Desktop submit buttons */}
            <div className="hidden sm:flex items-center justify-end gap-3 mt-6">
              <Button type="button" variant="outline" onClick={cancelEdit}>Cancel</Button>
              <Button type="submit" disabled={saving} style={{ backgroundColor: "#1a3a2a" }}>
                {saving ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Saving…</> : "Save changes"}
              </Button>
            </div>
          </form>

          {/* Mobile submit bar — fixed above bottom nav */}
          <div className="sm:hidden fixed bottom-[56px] left-0 right-0 z-20 bg-white/95 backdrop-blur-sm border-t px-4 py-3 flex gap-3">
            <Button type="submit" form="volunteer-edit-form" disabled={saving} className="flex-1 h-11" style={{ backgroundColor: "#1a3a2a" }}>
              {saving ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Saving…</> : "Save changes"}
            </Button>
            <Button type="button" variant="outline" className="h-11 px-5" onClick={cancelEdit}>Cancel</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-6">

        <div>
          <Link href={`/${orgSlug}/people?tab=volunteers`} className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 mb-4 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to people
          </Link>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                <span className="text-xl font-bold text-purple-700">{volunteer.firstName[0]}{volunteer.lastName[0]}</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">{volunteer.firstName} {volunteer.lastName}</h1>
                <p className="text-sm text-slate-500">Volunteer · Added {formatDate(new Date(volunteer.createdAt))}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button variant="outline" size="sm" onClick={startEdit} className="gap-1.5">
                <Pencil className="h-3.5 w-3.5" /> Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDeleteDialog(true)}
                className="gap-1.5 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </Button>
            </div>
          </div>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        <div className="bg-white rounded-xl border border-slate-100 p-6 space-y-3">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">Contact details</h2>
          {[
            { icon: Mail, label: volunteer.email, href: `mailto:${volunteer.email}` },
            ...(volunteer.phone ? [{ icon: Phone, label: volunteer.phone, href: `tel:${volunteer.phone}` }] : []),
            ...(volunteer.county ? [{ icon: MapPin, label: volunteer.county, href: undefined }] : []),
          ].map(({ icon: Icon, label, href }) => (
            <div key={label} className="flex items-center gap-3 text-sm">
              <Icon className="h-4 w-4 text-slate-400 shrink-0" />
              {href ? <a href={href} className="text-slate-700 hover:underline">{label}</a> : <span className="text-slate-700">{label}</span>}
            </div>
          ))}
          {volunteer.notes && (
            <div className="flex items-start gap-3 text-sm pt-2 border-t border-slate-50">
              <FileText className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
              <p className="text-slate-600 whitespace-pre-wrap">{volunteer.notes}</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-slate-100 p-5">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Hours logged</p>
            <div className="flex items-center gap-2 mt-2">
              <Clock className="h-5 w-5 text-purple-500" />
              <span className="text-2xl font-bold text-slate-900">{volunteer.hoursLogged}</span>
              <span className="text-sm text-slate-400">hrs</span>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-100 p-5">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Roles</p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {volunteer.isHomeChecker && <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">Home checker</span>}
              {volunteer.isDriver && <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">Driver</span>}
              {volunteer.available
                ? <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">Available</span>
                : <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">Unavailable</span>
              }
            </div>
          </div>
        </div>

        {skills.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-100 p-6">
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill: string) => (
                <span key={skill} className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">{skill}</span>
              ))}
            </div>
          </div>
        )}

      </div>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete volunteer?</DialogTitle>
            <DialogDescription>
              This will permanently remove <strong>{volunteer.firstName} {volunteer.lastName}</strong> from your volunteer records. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Deleting…</> : "Delete volunteer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
