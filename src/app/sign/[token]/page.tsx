"use client"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Loader2, CheckCircle, FileText, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type ContractData = {
  id: string
  contractText: string
  adoptionFee: number | null
  currency: string
  signedAt: string | null
  adopterName: string
  animalName: string
  orgName: string
  orgLogo: string | null
}

export default function SignContractPage() {
  const params = useParams<{ token: string }>()

  const [data, setData] = useState<ContractData | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const [typedName, setTypedName] = useState("")
  const [agreed, setAgreed] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [signed, setSigned] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    fetch(`/api/sign/${params.token}`)
      .then(r => {
        if (r.status === 404) { setNotFound(true); setLoading(false); return null }
        return r.json()
      })
      .then(d => {
        if (d) setData(d)
        setLoading(false)
      })
      .catch(() => { setNotFound(true); setLoading(false) })
  }, [params.token])

  async function handleSign(e: React.FormEvent) {
    e.preventDefault()
    if (!agreed) return
    if (!typedName.trim()) { setError("Please type your full name"); return }
    setError("")
    setSubmitting(true)
    try {
      const res = await fetch(`/api/sign/${params.token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ typedSignature: typedName.trim() }),
      })
      const result = await res.json()
      if (!res.ok) { setError(result.error ?? "Failed to sign"); return }
      setSigned(true)
    } catch {
      setError("Network error — please try again")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-300" />
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <AlertCircle className="h-12 w-12 text-slate-300 mx-auto" />
          <h1 className="text-xl font-semibold text-slate-700">Contract not found</h1>
          <p className="text-slate-500 text-sm">This signing link is invalid or has expired.</p>
        </div>
      </div>
    )
  }

  if (signed || data?.signedAt) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-10 max-w-md w-full text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">Contract signed</h1>
          <p className="text-slate-500 text-sm">
            {signed
              ? `Thank you, ${typedName}. Your adoption contract for ${data?.animalName} has been signed. A copy has been emailed to you.`
              : `This contract was already signed on ${new Date(data!.signedAt!).toLocaleDateString("en-IE", { day: "2-digit", month: "long", year: "numeric" })}.`
            }
          </p>
          <div className="pt-2">
            <span className="inline-block text-xs text-slate-400 bg-slate-50 rounded-full px-3 py-1">
              Powered by <span style={{ color: "#1a3a2a" }} className="font-semibold">Cara</span>
            </span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white px-6 py-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shrink-0" style={{ backgroundColor: "#4ade80", color: "#1a3a2a" }}>C</div>
        <div>
          <p className="text-sm font-semibold text-slate-800">{data!.orgName}</p>
          <p className="text-xs text-slate-400">Adoption contract</p>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-10 space-y-8">
        {/* Intro */}
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 mb-3">
            <FileText className="h-5 w-5 text-slate-400" />
            <h1 className="text-xl font-bold text-slate-900">Review &amp; sign your adoption contract</h1>
          </div>
          <p className="text-sm text-slate-500">
            Please read the contract below carefully. By typing your name you confirm your agreement.
          </p>
          <div className="flex items-center gap-4 pt-1 text-sm text-slate-600">
            <span><span className="text-slate-400">Animal:</span> <strong>{data!.animalName}</strong></span>
            {data!.adoptionFee != null && (
              <span><span className="text-slate-400">Fee:</span> <strong>€{Number(data!.adoptionFee).toFixed(2)}</strong></span>
            )}
          </div>
        </div>

        {/* Contract text */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="bg-slate-50 border-b border-slate-200 px-5 py-2.5 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Contract</span>
            <span className="text-xs text-slate-400">{data!.orgName}</span>
          </div>
          <div className="p-6">
            <pre className="font-sans text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{data!.contractText}</pre>
          </div>
        </div>

        {/* Signature form */}
        <form onSubmit={handleSign} className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
          <h2 className="text-sm font-semibold text-slate-900">Electronic signature</h2>

          <div className="space-y-1.5">
            <Label htmlFor="typedName">
              Type your full name to sign <span className="text-red-500">*</span>
            </Label>
            <Input
              id="typedName"
              placeholder={data!.adopterName}
              value={typedName}
              onChange={e => setTypedName(e.target.value)}
              className="text-base font-medium"
              required
            />
            <p className="text-xs text-slate-400">Your typed name serves as your electronic signature</p>
          </div>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={agreed}
              onChange={e => setAgreed(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-[#1a3a2a]"
            />
            <span className="text-sm text-slate-600 leading-relaxed">
              I have read and agree to the terms of this adoption agreement. I understand that typing my name above constitutes a legally binding electronic signature under eIDAS Regulation (EU) No 910/2014.
            </span>
          </label>

          {error && (
            <div className="rounded-lg bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">{error}</div>
          )}

          <Button
            type="submit"
            disabled={submitting || !agreed || !typedName.trim()}
            className="w-full h-11 text-base gap-2"
            style={{ backgroundColor: "#1a3a2a" }}
          >
            {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Signing…</> : "Sign contract"}
          </Button>

          <p className="text-xs text-slate-400 text-center">
            By signing you confirm your identity as {data!.adopterName}. Your IP address and timestamp will be recorded for legal compliance.
          </p>
        </form>

        <div className="text-center">
          <span className="text-xs text-slate-400">
            Powered by <span style={{ color: "#1a3a2a" }} className="font-semibold">Cara</span> — Animal Shelter Management
          </span>
        </div>
      </div>
    </div>
  )
}
