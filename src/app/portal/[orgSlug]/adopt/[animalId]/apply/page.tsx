"use client"
import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Loader2, CheckCircle, Clock, Home, PartyPopper, Mail, Heart } from "lucide-react"
import { PawLoader } from "@/components/ui/paw-loader"
import { COUNTIES } from "@/lib/constants"


export default function AdoptApplicationPage() {
  const params = useParams()
  const [animal, setAnimal] = useState<{
    name: string; species: string; breed?: string; photos?: { url: string }[]
  } | null>(null)
  const [org, setOrg] = useState<{ name: string; donationUrl: string | null } | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [conversationToken, setConversationToken] = useState<string | null>(null)
  const [conversationSecret, setConversationSecret] = useState<string | null>(null)
  const [error, setError] = useState("")

  const [form, setForm] = useState({
    applicationType: "ADOPT",
    applicantName: "", applicantEmail: "", applicantPhone: "",
    applicantAddress: "", applicantCounty: "",
    householdType: "", rentOrOwn: "", landlordPermission: false,
    hasGarden: false, gardenFenced: false,
    hasChildren: false, childrenAges: "",
    hasOtherPets: false, otherPetsDetails: "",
    experienceLevel: "", previousPets: "", whyAdopt: "", workingHours: "",
    gdprConsent: false,
    privacyPolicyConsent: false,
  })

  useEffect(() => {
    fetch(`/api/portal/${params.orgSlug}/animals/${params.animalId}`)
      .then(r => r.json())
      .then(data => { setAnimal(data.animal); setOrg(data.org); setLoading(false) })
  }, [params.orgSlug, params.animalId])

  function set(field: string) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(f => ({ ...f, [field]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.gdprConsent) { setError("Please consent to data processing to continue"); return }
    if (!form.privacyPolicyConsent) { setError("Please confirm you have read the Privacy Policy"); return }
    setSubmitting(true)
    setError("")
    try {
      const res = await fetch(`/api/portal/${params.orgSlug}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, animalId: params.animalId, privacyPolicyConsent: form.privacyPolicyConsent }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? "Failed to submit application"); setSubmitting(false); return }
      setConversationToken(data.conversationToken ?? null)
      setConversationSecret(data.conversationSecret ?? null)
      setSubmitted(true)
      window.scrollTo({ top: 0, behavior: "smooth" })
    } catch {
      setError("Something went wrong. Please try again.")
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div style={{ width: "min(90vw, 420px)" }}>
          <PawLoader />
        </div>
      </div>
    )
  }

  // ── POST-SUBMISSION: emotional donation prompt ──────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: "#fdf8f5" }}>
        {/* Celebration hero */}
        <div
          className="relative overflow-hidden pt-14 pb-12 px-4 text-center"
          style={{ background: "linear-gradient(160deg, #1a3a2a 0%, #2d5a3d 60%, #1a3a2a 100%)" }}
        >
          {/* Checkmark */}
          <div className="relative z-10 inline-flex items-center justify-center mb-5">
            <div className="w-20 h-20 rounded-full bg-[#4ade80]/20 flex items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-[#4ade80] flex items-center justify-center shadow-lg shadow-green-900/30">
                <CheckCircle className="h-8 w-8 text-[#1a3a2a]" strokeWidth={2.5} />
              </div>
            </div>
          </div>

          <div className="relative z-10 flex items-center justify-center gap-2 mb-3">
            <PartyPopper className="h-5 w-5 text-[#4ade80]" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Your application is in!
            </h1>
            <PartyPopper className="h-5 w-5 text-[#4ade80] scale-x-[-1]" />
          </div>

          <p className="relative z-10 text-[#a7c4b5] text-base max-w-sm mx-auto leading-relaxed">
            {animal?.name && org?.name
              ? <>You&apos;ve taken the first step toward giving <strong className="text-white">{animal.name}</strong> a forever home. <strong className="text-[#4ade80]">{org.name}</strong> will be in touch soon.</>
              : "We'll review your application and be in touch soon."}
          </p>

          {/* Email reminder */}
          {form.applicantEmail && (
            <div className="relative z-10 mt-4 inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-[#a7c4b5] text-xs px-4 py-2 rounded-full">
              <Mail className="h-3.5 w-3.5 shrink-0" />
              Updates will be sent to <strong className="text-white">{form.applicantEmail}</strong>
            </div>
          )}
        </div>

        {/* Donation ask — only shown when the shelter has a donation link set */}
        {org?.donationUrl && (
          <div className="max-w-lg mx-auto px-4 pt-6 pb-2">
            <div
              className="rounded-2xl p-6 sm:p-8 text-center"
              style={{ backgroundColor: "#1a3a2a" }}
            >
              <p className="text-xs font-semibold tracking-widest uppercase text-[#4ade80]/60 mb-3">
                While you wait
              </p>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white leading-tight mb-3">
                Help the animals still waiting
              </h2>
              <p className="text-sm text-[#a7c4b5] max-w-xs mx-auto leading-relaxed mb-6">
                {animal?.name
                  ? <>While {org.name} reviews your application for <strong className="text-white">{animal.name}</strong>, there are more animals still waiting for their forever home.</>
                  : <>There are more animals still waiting for their forever home.</>}
                {" "}A small donation helps cover food, vet care, and shelter costs.
              </p>
              <a
                href={org.donationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-[#1a3a2a] bg-[#4ade80] hover:bg-[#22c55e] transition-colors"
              >
                <Heart className="h-4 w-4" />
                Donate to {org.name}
              </a>
            </div>
          </div>
        )}

        {/* What happens next */}
        <div className="max-w-lg mx-auto px-4 py-6">
          <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-3">
            What happens next
          </p>
          <div className="flex flex-col gap-0">
            {[
              { icon: <Clock className="h-4 w-4" />, text: `${org?.name ?? "The shelter"} reviews your application`, sub: "Usually within a few days" },
              { icon: <Home className="h-4 w-4" />, text: "Home check or meet-and-greet", sub: "If you're a great match" },
              { icon: <CheckCircle className="h-4 w-4" />, text: `${animal?.name ?? "Your new pet"} comes home!`, sub: "The best day of all" },
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-3 relative">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-[#1a3a2a] text-[#4ade80] flex items-center justify-center shrink-0 z-10">
                    {step.icon}
                  </div>
                  {i < 2 && <div className="w-0.5 h-8 bg-stone-200 my-0.5" />}
                </div>
                <div className="pb-4 pt-1">
                  <p className="text-sm font-semibold text-stone-800">{step.text}</p>
                  <p className="text-xs text-stone-500 mt-0.5">{step.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Message the shelter */}
        {conversationToken && (
          <div className="max-w-lg mx-auto px-4 pb-2">
            <div className="rounded-2xl border bg-white p-5 flex flex-col sm:flex-row items-center gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">Have a question?</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Send a message directly to {org?.name ?? "the shelter"} about your application.
                </p>
              </div>
              <Link
                href={`/portal/${params.orgSlug}/conversations/${conversationToken}${conversationSecret ? `?s=${conversationSecret}` : ""}`}
                className="shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: "#1a3a2a" }}
              >
                <Mail className="h-4 w-4" />
                Message the shelter
              </Link>
            </div>
          </div>
        )}

        <div className="max-w-lg mx-auto px-4 pb-10 text-center">
          <Link
            href={`/portal/${params.orgSlug}`}
            className="text-sm text-stone-400 hover:text-stone-600 transition-colors underline underline-offset-2"
          >
            {org?.donationUrl ? "Skip — " : ""}Take me back to {org?.name ?? "the shelter"}
          </Link>
        </div>
      </div>
    )
  }

  // ── APPLICATION FORM ────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-white">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href={`/portal/${params.orgSlug}/adopt/${params.animalId}`} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <span className="font-semibold">Apply for {animal?.name}</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        {animal && (
          <div className="flex items-center gap-4 mb-6 p-4 bg-slate-50 rounded-xl">
            <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-100 shrink-0">
              {animal.photos?.[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={animal.photos[0].url} alt={animal.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl">🐾</div>
              )}
            </div>
            <div>
              <p className="font-bold">{animal.name}</p>
              <p className="text-sm text-muted-foreground">
                {animal.species}{animal.breed ? ` · ${animal.breed}` : ""}
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">
              {error}
            </div>
          )}

          {/* Application type */}
          <Card>
            <CardHeader><CardTitle className="text-base">I would like to…</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: "ADOPT",  label: "Adopt",  sub: "Give {name} a permanent home" },
                  { value: "FOSTER", label: "Foster", sub: "Provide a temporary home" },
                ].map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, applicationType: opt.value }))}
                    className={`p-4 rounded-xl border-2 text-left transition-colors ${
                      form.applicationType === opt.value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <p className="font-semibold text-sm">{opt.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {opt.sub.replace("{name}", animal?.name ?? "this animal")}
                    </p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Your details</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="col-span-1 sm:col-span-2 space-y-1.5">
                <Label>Full name <span className="text-destructive">*</span></Label>
                <Input placeholder="Jane Murphy" value={form.applicantName} onChange={set("applicantName")} required />
              </div>
              <div className="space-y-1.5">
                <Label>Email <span className="text-destructive">*</span></Label>
                <Input type="email" value={form.applicantEmail} onChange={set("applicantEmail")} required />
              </div>
              <div className="space-y-1.5">
                <Label>Phone</Label>
                <Input type="tel" value={form.applicantPhone} onChange={set("applicantPhone")} />
              </div>
              <div className="col-span-1 sm:col-span-2 space-y-1.5">
                <Label>Address</Label>
                <Input value={form.applicantAddress} onChange={set("applicantAddress")} />
              </div>
              <div className="space-y-1.5">
                <Label>County</Label>
                <Select value={form.applicantCounty} onValueChange={v => setForm(f => ({ ...f, applicantCounty: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select county" /></SelectTrigger>
                  <SelectContent>
                    {COUNTIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Your home</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Home type</Label>
                  <Select value={form.householdType} onValueChange={v => setForm(f => ({ ...f, householdType: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="house">House</SelectItem>
                      <SelectItem value="apartment">Apartment / flat</SelectItem>
                      <SelectItem value="farm">Farm / rural</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Do you rent or own?</Label>
                  <Select value={form.rentOrOwn} onValueChange={v => setForm(f => ({ ...f, rentOrOwn: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="own">Own my home</SelectItem>
                      <SelectItem value="rent">Renting</SelectItem>
                      <SelectItem value="other">Other arrangement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {form.rentOrOwn === "rent" && (
                <label className="flex items-start gap-2.5 cursor-pointer p-3 bg-amber-50 rounded-lg border border-amber-100">
                  <Checkbox
                    checked={form.landlordPermission}
                    onCheckedChange={v => setForm(f => ({ ...f, landlordPermission: v === true }))}
                    className="mt-0.5"
                  />
                  <span className="text-sm">My landlord has given permission for me to have a pet</span>
                </label>
              )}
              <div className="flex flex-wrap gap-4">
                {[
                  { key: "hasGarden",  label: "Has a garden or outdoor space" },
                  { key: "gardenFenced", label: "Garden is fully fenced" },
                  { key: "hasChildren",  label: "Children live at home" },
                  { key: "hasOtherPets", label: "Other pets at home" },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={(form as Record<string, unknown>)[key] as boolean}
                      onCheckedChange={v => setForm(f => ({ ...f, [key]: v === true }))}
                    />
                    <span className="text-sm">{label}</span>
                  </label>
                ))}
              </div>
              {form.hasChildren && (
                <div className="space-y-1.5">
                  <Label>Children&apos;s ages</Label>
                  <Input placeholder="e.g. 3, 7, 12" value={form.childrenAges} onChange={set("childrenAges")} />
                </div>
              )}
              {form.hasOtherPets && (
                <div className="space-y-1.5">
                  <Label>Tell us about your other pets</Label>
                  <Textarea value={form.otherPetsDetails} onChange={set("otherPetsDetails")} rows={2} />
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Experience &amp; lifestyle</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>Experience with pets</Label>
                <Select value={form.experienceLevel} onValueChange={v => setForm(f => ({ ...f, experienceLevel: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select level" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No previous experience</SelectItem>
                    <SelectItem value="some">Some experience</SelectItem>
                    <SelectItem value="experienced">Experienced owner</SelectItem>
                    <SelectItem value="expert">Expert / professional</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Tell us about previous pets</Label>
                <Textarea
                  placeholder="Any pets you've owned before…"
                  value={form.previousPets}
                  onChange={set("previousPets")}
                  rows={2}
                />
              </div>
              <div className="space-y-1.5">
                <Label>
                  Why do you want to {form.applicationType === "FOSTER" ? "foster" : "adopt"}{" "}
                  {animal?.name}? <span className="text-destructive">*</span>
                </Label>
                <Textarea value={form.whyAdopt} onChange={set("whyAdopt")} rows={3} required />
              </div>
              <div className="space-y-1.5">
                <Label>Typical working hours</Label>
                <Input
                  placeholder="e.g. 9–5 Monday–Friday, work from home"
                  value={form.workingHours}
                  onChange={set("workingHours")}
                />
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Consent required</p>
            <label className="flex items-start gap-3 cursor-pointer">
              <Checkbox
                id="gdpr"
                checked={form.gdprConsent}
                onCheckedChange={v => setForm(f => ({ ...f, gdprConsent: v === true }))}
                className="mt-0.5"
              />
              <span className="text-sm text-muted-foreground">
                <span className="text-destructive font-semibold">*</span>{" "}
                I consent to {org?.name ?? "this rescue"} storing and processing my personal data
                to assess this application. My data will be handled in accordance with GDPR and
                will not be shared with third parties.
              </span>
            </label>
            <label className="flex items-start gap-3 cursor-pointer">
              <Checkbox
                id="privacy"
                checked={form.privacyPolicyConsent}
                onCheckedChange={v => setForm(f => ({ ...f, privacyPolicyConsent: v === true }))}
                className="mt-0.5"
              />
              <span className="text-sm text-muted-foreground">
                <span className="text-destructive font-semibold">*</span>{" "}
                I confirm I have read and understood the{" "}
                <a
                  href="/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-foreground hover:text-primary"
                >
                  Privacy Policy
                </a>
                .
              </span>
            </label>
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={submitting}>
            {submitting ? (
              <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Submitting…</>
            ) : (
              `Submit ${form.applicationType === "FOSTER" ? "foster" : "adoption"} application`
            )}
          </Button>
        </form>
      </main>
    </div>
  )
}
