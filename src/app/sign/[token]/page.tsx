"use client"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { CheckCircle, FileText, AlertCircle, HelpCircle, Loader2 } from "lucide-react"
import { PawLoader } from "@/components/ui/paw-loader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

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
  const [expired, setExpired] = useState(false)

  const [typedName, setTypedName] = useState("")
  const [agreed, setAgreed] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [signed, setSigned] = useState(false)
  const [error, setError] = useState("")
  const [nameMismatch, setNameMismatch] = useState(false)

  const [showDecline, setShowDecline] = useState(false)
  const [declineMessage, setDeclineMessage] = useState("")
  const [decliningSubmitting, setDecliningSubmitting] = useState(false)
  const [declined, setDeclined] = useState(false)
  const [declineError, setDeclineError] = useState("")

  useEffect(() => {
    fetch(`/api/sign/${params.token}`)
      .then(r => {
        if (r.status === 404) { setNotFound(true); setLoading(false); return null }
        if (r.status === 410) { setExpired(true); setLoading(false); return null }
        return r.json()
      })
      .then(d => {
        if (d) setData(d)
        setLoading(false)
      })
      .catch(() => { setNotFound(true); setLoading(false) })
  }, [params.token])

  function checkNameMatch(typed: string) {
    if (!data?.adopterName || !typed.trim()) { setNameMismatch(false); return }
    const normalize = (s: string) => s.toLowerCase().replace(/[^a-z\s]/g, "").trim()
    const typedWords = normalize(typed).split(/\s+/).filter(Boolean)
    const expectedWords = normalize(data.adopterName).split(/\s+/).filter(Boolean)
    const hasMatch = typedWords.some(w => expectedWords.includes(w))
    setNameMismatch(!hasMatch)
  }

  async function handleDecline(e: React.FormEvent) {
    e.preventDefault()
    if (!declineMessage.trim()) { setDeclineError("Please include a message so the rescue can follow up"); return }
    setDeclineError("")
    setDecliningSubmitting(true)
    try {
      const res = await fetch(`/api/sign/${params.token}/decline`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: declineMessage.trim() }),
      })
      const result = await res.json()
      if (!res.ok) { setDeclineError(result.error ?? "Failed to send"); return }
      setDeclined(true)
    } catch {
      setDeclineError("Network error — please try again")
    } finally {
      setDecliningSubmitting(false)
    }
  }

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
        <div style={{ width: "min(90vw, 420px)" }}>
          <PawLoader />
        </div>
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <AlertCircle className="h-12 w-12 text-slate-300 mx-auto" />
          <h1 className="text-xl font-semibold text-slate-700">Contract not found</h1>
          <p className="text-slate-500 text-sm">This signing link is invalid. Please contact the rescue.</p>
        </div>
      </div>
    )
  }

  if (expired) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <AlertCircle className="h-12 w-12 text-amber-300 mx-auto" />
          <h1 className="text-xl font-semibold text-slate-700">Signing link expired</h1>
          <p className="text-slate-500 text-sm">This link is no longer valid. Please contact the rescue to request a new one.</p>
        </div>
      </div>
    )
  }

  if (declined) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-10 max-w-md w-full text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center mx-auto">
            <HelpCircle className="h-8 w-8 text-amber-500" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">Message sent</h1>
          <p className="text-slate-500 text-sm">Your message has been sent to {data!.orgName}. They will be in touch shortly.</p>
          <div className="pt-2">
            <span className="inline-block text-xs text-slate-400 bg-slate-50 rounded-full px-3 py-1">
              Powered by <span style={{ color: "#1a3a2a" }} className="font-semibold">Cara</span>
            </span>
          </div>
        </div>
      </div>
    )
  }

  if (signed || data?.signedAt) {
    const platformFeeUrl = process.env.NEXT_PUBLIC_CARA_PLATFORM_FEE_URL
    const justSigned = signed

    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full space-y-4">
          {/* Success card */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-10 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">Contract signed</h1>
            <p className="text-slate-500 text-sm">
              {justSigned
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

          {/* Platform fee — only shown immediately after signing */}
          {justSigned && platformFeeUrl && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 text-center space-y-3">
              <p className="text-sm font-semibold text-slate-800">One last step — pay the Cara platform fee</p>
              <p className="text-xs text-slate-500 leading-relaxed">
                A small €5 fee helps keep Cara running and free for shelters.
              </p>
              <a
                href={platformFeeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-full gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-white transition-colors"
                style={{ backgroundColor: "#1a3a2a" }}
              >
                Pay €5 now
              </a>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white px-4 py-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shrink-0" style={{ backgroundColor: "#4ade80", color: "#1a3a2a" }}>C</div>
        <div>
          <p className="text-sm font-semibold text-slate-800">{data!.orgName}</p>
          <p className="text-xs text-slate-400">Adoption contract</p>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-8">
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
              onChange={e => { setTypedName(e.target.value); checkNameMatch(e.target.value) }}
              className="text-base font-medium"
              required
            />
            {nameMismatch ? (
              <p className="text-xs text-amber-600">
                This name doesn&apos;t match the name on the contract ({data!.adopterName}). Please make sure you&apos;re signing with your correct full name.
              </p>
            ) : (
              <p className="text-xs text-slate-400">Your typed name serves as your electronic signature</p>
            )}
          </div>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={agreed}
              onChange={e => setAgreed(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-[#1a3a2a]"
            />
            <span className="text-sm text-slate-600 leading-relaxed">
              I have read and agree to all terms of this adoption agreement. I understand that typing my name above constitutes a valid electronic signature under eIDAS Regulation (EU) No 910/2014.
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

        {/* Decline / query section */}
        {!showDecline ? (
          <div className="text-center">
            <button
              type="button"
              onClick={() => setShowDecline(true)}
              className="text-xs text-slate-400 hover:text-slate-600 underline underline-offset-2 transition-colors"
            >
              Have a question or not ready to sign?
            </button>
          </div>
        ) : (
          <form onSubmit={handleDecline} className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-slate-400 shrink-0" />
              <h2 className="text-sm font-semibold text-slate-900">Send a message to {data!.orgName}</h2>
            </div>
            <p className="text-sm text-slate-500">
              If you have questions or are not ready to sign, send a message and the rescue will follow up with you directly.
            </p>
            <div className="space-y-1.5">
              <Label htmlFor="declineMessage">Your message <span className="text-red-500">*</span></Label>
              <Textarea
                id="declineMessage"
                rows={4}
                placeholder="e.g. I have a question about clause 5…"
                value={declineMessage}
                onChange={e => setDeclineMessage(e.target.value)}
                required
              />
            </div>
            {declineError && (
              <div className="rounded-lg bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">{declineError}</div>
            )}
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => setShowDecline(false)} className="flex-1">Cancel</Button>
              <Button type="submit" disabled={decliningSubmitting || !declineMessage.trim()} variant="outline" className="flex-1 gap-2">
                {decliningSubmitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Sending…</> : "Send message"}
              </Button>
            </div>
          </form>
        )}

        <div className="text-center">
          <span className="text-xs text-slate-400">
            Powered by <span style={{ color: "#1a3a2a" }} className="font-semibold">Cara</span> — Animal Shelter Management
          </span>
        </div>
      </div>
    </div>
  )
}
