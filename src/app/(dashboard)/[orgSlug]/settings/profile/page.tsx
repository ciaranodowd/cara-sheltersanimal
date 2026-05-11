"use client"
import { useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, CheckCircle, Download, Trash2, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"

export default function ProfilePage() {
  const params = useParams<{ orgSlug: string }>()
  const { data: session, update } = useSession()
  const [name, setName] = useState(session?.user?.name ?? "")
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState("")
  const [deleteConfirm, setDeleteConfirm] = useState("")
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState("")
  const [exporting, setExporting] = useState(false)

  // Change password state
  const [cpCurrent, setCpCurrent] = useState("")
  const [cpNew, setCpNew] = useState("")
  const [cpConfirm, setCpConfirm] = useState("")
  const [cpLoading, setCpLoading] = useState(false)
  const [cpError, setCpError] = useState("")
  const [cpSaved, setCpSaved] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? "Failed to save"); return }
      await update({ name: data.name })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {
      setError("Network error — please try again")
    } finally {
      setLoading(false)
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    setCpError("")
    setCpSaved(false)
    if (cpNew !== cpConfirm) {
      setCpError("New passwords do not match.")
      return
    }
    if (cpNew.length < 8) {
      setCpError("New password must be at least 8 characters.")
      return
    }
    setCpLoading(true)
    try {
      const res = await fetch("/api/user/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: cpCurrent, newPassword: cpNew }),
      })
      const data = await res.json()
      if (!res.ok) { setCpError(data.error ?? "Failed to change password."); return }
      setCpSaved(true)
      setCpCurrent("")
      setCpNew("")
      setCpConfirm("")
      setTimeout(() => setCpSaved(false), 4000)
    } catch {
      setCpError("Network error — please try again.")
    } finally {
      setCpLoading(false)
    }
  }

  async function handleExport() {
    setExporting(true)
    try {
      const res = await fetch("/api/gdpr/export")
      if (!res.ok) { setError("Export failed — please try again"); return }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `cara-data-export-${new Date().toISOString().split("T")[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      setError("Export failed — please try again")
    } finally {
      setExporting(false)
    }
  }

  async function handleDelete() {
    if (deleteConfirm !== "DELETE MY ACCOUNT") {
      setDeleteError("Please type the confirmation phrase exactly as shown")
      return
    }
    setDeleting(true)
    setDeleteError("")
    try {
      const res = await fetch("/api/gdpr/deletion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmation: "DELETE MY ACCOUNT" }),
      })
      if (!res.ok) {
        const data = await res.json()
        setDeleteError(data.error ?? "Deletion failed")
        setDeleting(false)
        return
      }
      await signOut({ callbackUrl: "/login" })
    } catch {
      setDeleteError("Deletion failed — please try again")
      setDeleting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="p-4 sm:p-8 max-w-lg mx-auto">
        <div className="mb-6">
          <Link href={`/${params.orgSlug}/settings`} className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 mb-4 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to settings
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">My profile</h1>
          <p className="text-sm text-slate-500 mt-0.5">Update your account details</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-xl border border-slate-100 p-6 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Display name</Label>
              <Input
                id="name"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Your name"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input value={session?.user?.email ?? ""} disabled className="bg-slate-50 text-slate-500" />
              <p className="text-xs text-slate-400">Email cannot be changed here</p>
            </div>
          </div>

          {error && (
            <div className="mt-4 rounded-lg bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">{error}</div>
          )}

          <div className="mt-6 flex items-center justify-end gap-3">
            {saved && (
              <span className="flex items-center gap-1.5 text-sm text-green-600">
                <CheckCircle className="h-4 w-4" /> Saved
              </span>
            )}
            <Button type="submit" disabled={loading} style={{ backgroundColor: "#1a3a2a" }}>
              {loading ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </form>

        {/* Change password */}
        <div className="mt-8 bg-white rounded-xl border border-slate-100 p-6">
          <h2 className="font-semibold text-slate-900 text-sm mb-4">Change password</h2>
          <form onSubmit={handleChangePassword} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="cp-current">Current password</Label>
              <Input
                id="cp-current"
                type="password"
                value={cpCurrent}
                onChange={e => setCpCurrent(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cp-new">New password</Label>
              <Input
                id="cp-new"
                type="password"
                value={cpNew}
                onChange={e => setCpNew(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cp-confirm">Confirm new password</Label>
              <Input
                id="cp-confirm"
                type="password"
                value={cpConfirm}
                onChange={e => setCpConfirm(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>
            {cpError && (
              <div className="rounded-lg bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">{cpError}</div>
            )}
            <div className="flex items-center justify-end gap-3 pt-1">
              {cpSaved && (
                <span className="flex items-center gap-1.5 text-sm text-green-600">
                  <CheckCircle className="h-4 w-4" /> Password updated
                </span>
              )}
              <Button type="submit" disabled={cpLoading} style={{ backgroundColor: "#1a3a2a" }}>
                {cpLoading ? "Updating…" : "Update password"}
              </Button>
            </div>
          </form>
        </div>

        {/* Data export */}
        <div className="mt-8 bg-white rounded-xl border border-slate-100 p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-semibold text-slate-900 text-sm">Download your data</h2>
              <p className="text-xs text-slate-500 mt-1">
                Export a JSON file of everything Cara holds about your account — profile, messages,
                and activity. Your right under GDPR Article 20.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              disabled={exporting}
              className="shrink-0"
            >
              <Download className="h-4 w-4 mr-1.5" />
              {exporting ? "Preparing…" : "Export"}
            </Button>
          </div>
        </div>

        {/* Account deletion */}
        <div className="mt-4 bg-white rounded-xl border border-red-100 p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-semibold text-red-700 text-sm flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4" /> Delete account
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Permanently deletes your Cara account. Your messages will be anonymised and you
                will lose access to all organisations. This cannot be undone.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
              className="shrink-0 border-red-200 text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 mr-1.5" />
              Delete
            </Button>
          </div>

          {showDeleteDialog && (
            <div className="mt-5 pt-5 border-t border-red-100 space-y-3">
              <p className="text-sm text-slate-700 font-medium">
                Type <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-xs">DELETE MY ACCOUNT</span> to confirm:
              </p>
              <input
                type="text"
                value={deleteConfirm}
                onChange={e => setDeleteConfirm(e.target.value)}
                placeholder="DELETE MY ACCOUNT"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300"
              />
              {deleteError && (
                <p className="text-xs text-red-600">{deleteError}</p>
              )}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { setShowDeleteDialog(false); setDeleteConfirm(""); setDeleteError("") }}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  {deleting ? "Deleting…" : "Permanently delete my account"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
