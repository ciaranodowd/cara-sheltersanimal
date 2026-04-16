"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Home, CheckCircle } from "lucide-react"

interface Foster {
  id: string
  firstName: string
  lastName: string
  email: string
}

interface Props {
  orgSlug: string
  animalId: string
  animalName: string
  fosters: Foster[]
}

export function AssignFosterModal({ orgSlug, animalId, animalName, fosters }: Props) {
  const router = useRouter()
  const today = new Date().toISOString().split("T")[0]

  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ fosterId: "", startDate: today, endDate: "", notes: "" })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  function set(field: string) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(f => ({ ...f, [field]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const res = await fetch(`/api/animals/${animalId}/foster`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? "Failed to save"); return }
      setSuccess(true)
      setTimeout(() => {
        setOpen(false)
        setSuccess(false)
        setForm({ fosterId: "", startDate: today, endDate: "", notes: "" })
        router.refresh()
      }, 1500)
    } catch {
      setError("Network error — please try again")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={o => { setOpen(o); if (!o) { setError(""); setSuccess(false) } }}>
      <DialogTrigger asChild>
        <Button size="sm" style={{ backgroundColor: "#1a3a2a" }} className="text-white">
          <Home className="h-4 w-4 mr-1.5" /> Assign foster
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Assign to foster — {animalName}</DialogTitle>
        </DialogHeader>

        {success ? (
          <div className="py-8 text-center">
            <CheckCircle className="h-10 w-10 text-emerald-500 mx-auto mb-3" />
            <p className="font-medium">Foster assigned!</p>
            <p className="text-sm text-muted-foreground mt-1">An invite has been sent to the foster carer.</p>
          </div>
        ) : fosters.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-sm text-muted-foreground">
              No approved foster carers found. Add and approve fosters in the{" "}
              <a href={`/${orgSlug}/people?tab=fosters`} className="underline text-primary">People section</a>.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            {error && (
              <div className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">{error}</div>
            )}

            <div className="space-y-1.5">
              <Label>Foster carer <span className="text-destructive">*</span></Label>
              <Select value={form.fosterId} onValueChange={v => setForm(f => ({ ...f, fosterId: v }))} required>
                <SelectTrigger><SelectValue placeholder="Select a foster carer…" /></SelectTrigger>
                <SelectContent>
                  {fosters.map(f => (
                    <SelectItem key={f.id} value={f.id}>
                      {f.firstName} {f.lastName} — {f.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Start date <span className="text-destructive">*</span></Label>
                <Input type="date" value={form.startDate} onChange={set("startDate")} required />
              </div>
              <div className="space-y-1.5">
                <Label className="text-muted-foreground font-normal">End date (optional)</Label>
                <Input type="date" value={form.endDate} onChange={set("endDate")} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-muted-foreground font-normal">Handover notes (optional)</Label>
              <Textarea
                placeholder="Any special requirements or notes for the foster carer…"
                rows={3}
                value={form.notes}
                onChange={set("notes")}
              />
            </div>

            <div className="flex gap-3 pt-1">
              <Button type="submit" disabled={loading || !form.fosterId} style={{ backgroundColor: "#1a3a2a" }} className="flex-1 text-white">
                {loading ? "Saving…" : "Assign & send invite"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
