"use client"
import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Loader2, CheckCircle, Clock, Home, PartyPopper, Mail, Heart } from "lucide-react"
import { PawLoader } from "@/components/ui/paw-loader"
import { COUNTIES } from "@/lib/constants"

const PERSONALITY_TRAITS = [
  "Silly", "Protective", "Passive", "Calm", "Playful", "Cute",
  "Couch potato", "Smart", "Loyal", "Gentle", "Cuddly", "Energetic",
  "Adventurous", "Curious", "Affectionate", "Independent", "Goofy", "Alert",
]

const ENERGY_LEVELS = [
  { value: "Low", emoji: "😴" },
  { value: "Low–Med", emoji: "🌿" },
  { value: "Medium", emoji: "🐕" },
  { value: "Med–High", emoji: "⚡" },
  { value: "High", emoji: "🚀" },
]

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-50">
        <h2 className="font-semibold text-[15px] text-gray-900">{title}</h2>
      </div>
      <div className="px-5 py-5 space-y-5">{children}</div>
    </div>
  )
}

function BtnOpt({ label, sub, selected, onClick }: { label: string; sub?: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`p-3 rounded-xl border-2 text-left transition-all ${
        selected
          ? "border-[#1a3a2a] bg-[#1a3a2a]/5 shadow-sm"
          : "border-gray-200 hover:border-[#1a3a2a]/40 bg-white"
      }`}
    >
      <p className={`font-semibold text-sm ${selected ? "text-[#1a3a2a]" : "text-gray-800"}`}>{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5 leading-snug">{sub}</p>}
    </button>
  )
}

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
    householdSize: "",
    hasChildren: false, childrenAges: "",
    householdType: "", rentOrOwn: "", landlordPermission: false,
    hasGarden: false, gardenFenced: false,
    someoneHomeDuringDay: "",
    hoursAlonePerDay: "",
    dogSleepLocation: "",
    dogDayLocation: "",
    workingHours: "",
    experienceLevel: "", previousPets: "",
    hasOtherPets: false, otherPetsDetails: "",
    howLongConsidering: "",
    householdAgreed: "",
    whyAdopt: "",
    hasAllergies: "",
    primaryCaregiver: "",
    exercisePlans: "",
    trainingPlans: "",
    vetName: "",
    vetAddress: "",
    petInsurance: "",
    dreamEnergyLevel: "",
    dreamTraits: [] as string[],
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

  function pick(field: string, value: string | boolean) {
    setForm(f => ({ ...f, [field]: value }))
  }

  function toggleTrait(trait: string) {
    setForm(f => ({
      ...f,
      dreamTraits: f.dreamTraits.includes(trait)
        ? f.dreamTraits.filter(t => t !== trait)
        : [...f.dreamTraits, trait],
    }))
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
        body: JSON.stringify({
          ...form,
          animalId: params.animalId,
          dreamTraits: form.dreamTraits.join(", "),
        }),
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

  if (submitted) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: "#fdf8f5" }}>
        <div
          className="relative overflow-hidden pt-14 pb-12 px-4 text-center"
          style={{ background: "linear-gradient(160deg, #1a3a2a 0%, #2d5a3d 60%, #1a3a2a 100%)" }}
        >
          <div className="relative z-10 inline-flex items-center justify-center mb-5">
            <div className="w-20 h-20 rounded-full bg-[#4ade80]/20 flex items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-[#4ade80] flex items-center justify-center shadow-lg shadow-green-900/30">
                <CheckCircle className="h-8 w-8 text-[#1a3a2a]" strokeWidth={2.5} />
              </div>
            </div>
          </div>
          <div className="relative z-10 flex items-center justify-center gap-2 mb-3">
            <PartyPopper className="h-5 w-5 text-[#4ade80]" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Your application is in!</h1>
            <PartyPopper className="h-5 w-5 text-[#4ade80] scale-x-[-1]" />
          </div>
          <p className="relative z-10 text-[#a7c4b5] text-base max-w-sm mx-auto leading-relaxed">
            {animal?.name && org?.name
              ? <>You&apos;ve taken the first step toward giving <strong className="text-white">{animal.name}</strong> a forever home. <strong className="text-[#4ade80]">{org.name}</strong> will be in touch soon.</>
              : "We'll review your application and be in touch soon."}
          </p>
          {form.applicantEmail && (
            <div className="relative z-10 mt-4 inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-[#a7c4b5] text-xs px-4 py-2 rounded-full">
              <Mail className="h-3.5 w-3.5 shrink-0" />
              Updates will be sent to <strong className="text-white">{form.applicantEmail}</strong>
            </div>
          )}
        </div>

        {org?.donationUrl && (
          <div className="max-w-lg mx-auto px-4 pt-6 pb-2">
            <div className="rounded-2xl p-6 sm:p-8 text-center" style={{ backgroundColor: "#1a3a2a" }}>
              <p className="text-xs font-semibold tracking-widest uppercase text-[#4ade80]/60 mb-3">While you wait</p>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white leading-tight mb-3">Help the animals still waiting</h2>
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

        <div className="max-w-lg mx-auto px-4 py-6">
          <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-3">What happens next</p>
          <div className="flex flex-col gap-0">
            {[
              { icon: <Clock className="h-4 w-4" />, text: `${org?.name ?? "The shelter"} reviews your application`, sub: "Usually within a few days" },
              { icon: <Home className="h-4 w-4" />, text: "Home check or meet-and-greet", sub: "If you're a great match" },
              { icon: <CheckCircle className="h-4 w-4" />, text: `${animal?.name ?? "Your new pet"} comes home!`, sub: "The best day of all" },
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-3 relative">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-[#1a3a2a] text-[#4ade80] flex items-center justify-center shrink-0 z-10">{step.icon}</div>
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

        {conversationToken && (
          <div className="max-w-lg mx-auto px-4 pb-2">
            <div className="rounded-2xl border bg-white p-5 flex flex-col sm:flex-row items-center gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">Have a question?</p>
                <p className="text-xs text-muted-foreground mt-0.5">Send a message directly to {org?.name ?? "the shelter"} about your application.</p>
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

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#faf9f7" }}>
      <header className="sticky top-0 z-30 border-b bg-white/95 backdrop-blur-sm">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href={`/portal/${params.orgSlug}/adopt/${params.animalId}`} className="text-muted-foreground hover:text-foreground shrink-0">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <span className="font-semibold text-sm truncate">
            {form.applicationType === "FOSTER" ? "Foster" : "Adopt"} {animal?.name}
          </span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {animal && (
          <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 shrink-0">
              {animal.photos?.[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={animal.photos[0].url} alt={animal.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl">🐾</div>
              )}
            </div>
            <div>
              <p className="font-bold text-gray-900">{animal.name}</p>
              <p className="text-sm text-gray-400">{animal.species}{animal.breed ? ` · ${animal.breed}` : ""}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="text-sm text-destructive bg-destructive/10 rounded-xl px-4 py-3">{error}</div>
          )}

          {/* 1 — Application type */}
          <Section title="I would like to…">
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: "ADOPT", label: "Adopt", sub: `Give ${animal?.name ?? "this animal"} a permanent home` },
                { value: "FOSTER", label: "Foster", sub: "Provide a temporary loving home" },
              ].map(opt => (
                <BtnOpt key={opt.value} label={opt.label} sub={opt.sub}
                  selected={form.applicationType === opt.value}
                  onClick={() => pick("applicationType", opt.value)} />
              ))}
            </div>
          </Section>

          {/* 2 — Personal details */}
          <Section title="Your details">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2 space-y-1.5">
                <Label>Full name <span className="text-red-500">*</span></Label>
                <Input placeholder="Jane Murphy" value={form.applicantName} onChange={set("applicantName")} required />
              </div>
              <div className="space-y-1.5">
                <Label>Email <span className="text-red-500">*</span></Label>
                <Input type="email" value={form.applicantEmail} onChange={set("applicantEmail")} required />
              </div>
              <div className="space-y-1.5">
                <Label>Phone</Label>
                <Input type="tel" value={form.applicantPhone} onChange={set("applicantPhone")} />
              </div>
              <div className="sm:col-span-2 space-y-1.5">
                <Label>Address</Label>
                <Input value={form.applicantAddress} onChange={set("applicantAddress")} />
              </div>
              <div className="space-y-1.5">
                <Label>County</Label>
                <Select value={form.applicantCounty} onValueChange={v => pick("applicantCounty", v)}>
                  <SelectTrigger><SelectValue placeholder="Select county" /></SelectTrigger>
                  <SelectContent>
                    {COUNTIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Section>

          {/* 3 — Household & home */}
          <Section title="Your household & home">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2.5">How many people live in your household?</p>
              <div className="grid grid-cols-6 gap-2">
                {["1", "2", "3", "4", "5", "6+"].map(n => (
                  <button key={n} type="button" onClick={() => pick("householdSize", n)}
                    className={`py-2.5 rounded-xl border-2 text-center font-semibold text-sm transition-all ${
                      form.householdSize === n
                        ? "border-[#1a3a2a] bg-[#1a3a2a]/5 text-[#1a3a2a]"
                        : "border-gray-200 text-gray-700 hover:border-[#1a3a2a]/40"
                    }`}>{n}</button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 mb-2.5">Are there children in the household?</p>
              <div className="grid grid-cols-2 gap-3">
                <BtnOpt label="Yes" selected={form.hasChildren} onClick={() => pick("hasChildren", true)} />
                <BtnOpt label="No" selected={!form.hasChildren} onClick={() => pick("hasChildren", false)} />
              </div>
              {form.hasChildren && (
                <div className="mt-3 space-y-1.5">
                  <Label>Children&apos;s ages</Label>
                  <Input placeholder="e.g. 3, 7, 12" value={form.childrenAges} onChange={set("childrenAges")} />
                </div>
              )}
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 mb-2.5">What type of home do you live in?</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {[
                  { value: "House", label: "House" },
                  { value: "Townhouse", label: "Townhouse" },
                  { value: "Apartment", label: "Apartment / flat" },
                  { value: "Farm", label: "Farm / rural" },
                  { value: "Other", label: "Other" },
                ].map(opt => (
                  <BtnOpt key={opt.value} label={opt.label}
                    selected={form.householdType === opt.value}
                    onClick={() => pick("householdType", opt.value)} />
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 mb-2.5">Do you own or rent your home?</p>
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { value: "own", label: "I own it" },
                  { value: "rent", label: "Renting" },
                  { value: "other", label: "Other" },
                ].map(opt => (
                  <BtnOpt key={opt.value} label={opt.label}
                    selected={form.rentOrOwn === opt.value}
                    onClick={() => pick("rentOrOwn", opt.value)} />
                ))}
              </div>
              {form.rentOrOwn === "rent" && (
                <label className="flex items-start gap-2.5 cursor-pointer mt-3 p-3 bg-amber-50 rounded-xl border border-amber-100">
                  <Checkbox
                    checked={form.landlordPermission}
                    onCheckedChange={v => setForm(f => ({ ...f, landlordPermission: v === true }))}
                    className="mt-0.5"
                  />
                  <span className="text-sm">My landlord has given permission for me to have a pet</span>
                </label>
              )}
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 mb-2.5">Do you have a garden or outdoor space?</p>
              <div className="grid grid-cols-2 gap-3">
                <BtnOpt label="Yes" selected={form.hasGarden} onClick={() => pick("hasGarden", true)} />
                <BtnOpt label="No" selected={!form.hasGarden} onClick={() => pick("hasGarden", false)} />
              </div>
              {form.hasGarden && (
                <div className="mt-3">
                  <p className="text-sm font-medium text-gray-700 mb-2.5">Is it fully fenced?</p>
                  <div className="grid grid-cols-2 gap-3">
                    <BtnOpt label="Yes, fully fenced" selected={form.gardenFenced} onClick={() => pick("gardenFenced", true)} />
                    <BtnOpt label="No / partially" selected={!form.gardenFenced} onClick={() => pick("gardenFenced", false)} />
                  </div>
                </div>
              )}
            </div>
          </Section>

          {/* 4 — Daily routine */}
          <Section title="Daily routine">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2.5">Is someone home during the day?</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {[
                  { value: "Yes, full-time", label: "Yes, full-time", sub: "Someone is always home" },
                  { value: "Mostly", label: "Mostly", sub: "Home most of the day" },
                  { value: "No, we work away", label: "No, we work away", sub: "Out for most of the day" },
                ].map(opt => (
                  <BtnOpt key={opt.value} label={opt.label} sub={opt.sub}
                    selected={form.someoneHomeDuringDay === opt.value}
                    onClick={() => pick("someoneHomeDuringDay", opt.value)} />
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 mb-2.5">How long would the dog be left alone each day?</p>
              <div className="grid grid-cols-5 gap-2">
                {["0–2 hrs", "2–4 hrs", "4–6 hrs", "6–8 hrs", "8+ hrs"].map(h => (
                  <button key={h} type="button" onClick={() => pick("hoursAlonePerDay", h)}
                    className={`py-2.5 px-1 rounded-xl border-2 text-center font-medium text-xs transition-all ${
                      form.hoursAlonePerDay === h
                        ? "border-[#1a3a2a] bg-[#1a3a2a]/5 text-[#1a3a2a]"
                        : "border-gray-200 text-gray-700 hover:border-[#1a3a2a]/40"
                    }`}>{h}</button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 mb-2.5">Where will the dog sleep?</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {[
                  "In our bedroom",
                  "Own bed in bedroom",
                  "Crate in bedroom",
                  "Crate elsewhere",
                  "Kitchen / utility",
                  "Outside",
                ].map(opt => (
                  <BtnOpt key={opt} label={opt}
                    selected={form.dogSleepLocation === opt}
                    onClick={() => pick("dogSleepLocation", opt)} />
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 mb-2.5">Where will the dog spend most of the day?</p>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { value: "With family indoors", label: "With family indoors" },
                  { value: "Indoor area / room", label: "Indoor area / room" },
                  { value: "Outdoor kennel / run", label: "Outdoor kennel / run" },
                  { value: "Varies / mix", label: "Varies / mix" },
                ].map(opt => (
                  <BtnOpt key={opt.value} label={opt.label}
                    selected={form.dogDayLocation === opt.value}
                    onClick={() => pick("dogDayLocation", opt.value)} />
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Typical working schedule</Label>
              <Input placeholder="e.g. 9–5 Mon–Fri, work from home on Fridays"
                value={form.workingHours} onChange={set("workingHours")} />
            </div>
          </Section>

          {/* 5 — Experience */}
          <Section title="Your experience with pets">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2.5">How would you describe your experience with dogs?</p>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { value: "First time owner", label: "First time", sub: "I've never owned a dog" },
                  { value: "Some experience", label: "Some experience", sub: "Had dogs growing up or briefly" },
                  { value: "Experienced owner", label: "Experienced", sub: "I've owned dogs as an adult" },
                  { value: "Expert / professional", label: "Expert", sub: "Dog trainer, vet, or similar" },
                ].map(opt => (
                  <BtnOpt key={opt.value} label={opt.label} sub={opt.sub}
                    selected={form.experienceLevel === opt.value}
                    onClick={() => pick("experienceLevel", opt.value)} />
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Tell us about any previous pets</Label>
              <Textarea placeholder="Breeds, how long you had them, what happened to them…"
                value={form.previousPets} onChange={set("previousPets")} rows={3} />
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 mb-2.5">Do you have other pets at home?</p>
              <div className="grid grid-cols-2 gap-3">
                <BtnOpt label="Yes" selected={form.hasOtherPets} onClick={() => pick("hasOtherPets", true)} />
                <BtnOpt label="No" selected={!form.hasOtherPets} onClick={() => pick("hasOtherPets", false)} />
              </div>
              {form.hasOtherPets && (
                <div className="mt-3 space-y-1.5">
                  <Label>Tell us about your other pets</Label>
                  <Textarea placeholder="Species, breed, age, temperament…"
                    value={form.otherPetsDetails} onChange={set("otherPetsDetails")} rows={2} />
                </div>
              )}
            </div>
          </Section>

          {/* 6 — About this adoption */}
          <Section title="About this adoption">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2.5">How long have you been thinking about getting a dog?</p>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { value: "Just started thinking", label: "Just starting out" },
                  { value: "A few weeks", label: "A few weeks" },
                  { value: "A few months", label: "A few months" },
                  { value: "Over a year", label: "Over a year" },
                ].map(opt => (
                  <BtnOpt key={opt.value} label={opt.label}
                    selected={form.howLongConsidering === opt.value}
                    onClick={() => pick("howLongConsidering", opt.value)} />
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 mb-2.5">Has everyone in the household discussed getting a dog?</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {[
                  { value: "Yes, everyone agrees", label: "Yes, everyone agrees" },
                  { value: "Mostly yes", label: "Mostly yes" },
                  { value: "Still discussing", label: "Still discussing" },
                ].map(opt => (
                  <BtnOpt key={opt.value} label={opt.label}
                    selected={form.householdAgreed === opt.value}
                    onClick={() => pick("householdAgreed", opt.value)} />
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>
                Why do you want to {form.applicationType === "FOSTER" ? "foster" : "adopt"}{" "}
                {animal?.name ?? "this dog"}? <span className="text-red-500">*</span>
              </Label>
              <Textarea placeholder="Tell us about your motivation and what you're hoping for…"
                value={form.whyAdopt} onChange={set("whyAdopt")} rows={4} required />
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 mb-2.5">Does anyone in the household have pet allergies?</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: "Yes", label: "Yes" },
                  { value: "No", label: "No" },
                ].map(opt => (
                  <BtnOpt key={opt.value} label={opt.label}
                    selected={form.hasAllergies === opt.value}
                    onClick={() => pick("hasAllergies", opt.value)} />
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Who will be the primary caregiver for the dog?</Label>
              <Input placeholder="e.g. Me, shared between the family…"
                value={form.primaryCaregiver} onChange={set("primaryCaregiver")} />
            </div>
          </Section>

          {/* 7 — Care & vet */}
          <Section title="Care, training & health">
            <div className="space-y-1.5">
              <Label>How do you plan to exercise the dog?</Label>
              <Textarea placeholder="Walks, runs, dog park, garden play…"
                value={form.exercisePlans} onChange={set("exercisePlans")} rows={3} />
            </div>

            <div className="space-y-1.5">
              <Label>What&apos;s your approach to training?</Label>
              <Textarea placeholder="Positive reinforcement, classes, professional trainer…"
                value={form.trainingPlans} onChange={set("trainingPlans")} rows={3} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Vet name / clinic</Label>
                <Input placeholder="e.g. Greenfield Vets" value={form.vetName} onChange={set("vetName")} />
              </div>
              <div className="space-y-1.5">
                <Label>Vet address / location</Label>
                <Input placeholder="e.g. Main St, Dublin 6" value={form.vetAddress} onChange={set("vetAddress")} />
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 mb-2.5">Are you planning to get pet insurance?</p>
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { value: "Yes", label: "Yes" },
                  { value: "Planning to", label: "Planning to" },
                  { value: "No", label: "No" },
                ].map(opt => (
                  <BtnOpt key={opt.value} label={opt.label}
                    selected={form.petInsurance === opt.value}
                    onClick={() => pick("petInsurance", opt.value)} />
                ))}
              </div>
            </div>
          </Section>

          {/* 8 — Dream dog */}
          <Section title="Your dream dog">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-3">What energy level are you looking for?</p>
              <div className="flex gap-2">
                {ENERGY_LEVELS.map(level => (
                  <button
                    key={level.value}
                    type="button"
                    onClick={() => pick("dreamEnergyLevel", level.value)}
                    className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 text-center transition-all ${
                      form.dreamEnergyLevel === level.value
                        ? "border-[#1a3a2a] bg-[#1a3a2a]/5"
                        : "border-gray-200 hover:border-[#1a3a2a]/40"
                    }`}
                  >
                    <span className="text-xl">{level.emoji}</span>
                    <span className={`text-[11px] font-semibold leading-tight ${
                      form.dreamEnergyLevel === level.value ? "text-[#1a3a2a]" : "text-gray-600"
                    }`}>{level.value}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">What personality traits matter most to you?</p>
              <p className="text-xs text-gray-400 mb-3">Select all that apply</p>
              <div className="flex flex-wrap gap-2">
                {PERSONALITY_TRAITS.map(trait => {
                  const selected = form.dreamTraits.includes(trait)
                  return (
                    <button
                      key={trait}
                      type="button"
                      onClick={() => toggleTrait(trait)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all border ${
                        selected
                          ? "bg-[#1a3a2a] text-white border-[#1a3a2a]"
                          : "bg-white text-gray-600 border-gray-200 hover:border-[#1a3a2a]/50"
                      }`}
                    >
                      {trait}
                    </button>
                  )
                })}
              </div>
            </div>
          </Section>

          {/* 9 — Consent */}
          <div className="space-y-3 p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Consent required</p>
            <label className="flex items-start gap-3 cursor-pointer">
              <Checkbox
                id="gdpr"
                checked={form.gdprConsent}
                onCheckedChange={v => setForm(f => ({ ...f, gdprConsent: v === true }))}
                className="mt-0.5"
              />
              <span className="text-sm text-muted-foreground">
                <span className="text-red-500 font-semibold">*</span>{" "}
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
                <span className="text-red-500 font-semibold">*</span>{" "}
                I confirm I have read and understood the{" "}
                <a href="/privacy" target="_blank" rel="noopener noreferrer"
                  className="underline text-foreground hover:text-primary">
                  Privacy Policy
                </a>.
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
