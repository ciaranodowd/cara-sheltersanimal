"use client"
import { useState } from "react"
import { Loader2, ShieldCheck } from "lucide-react"

const PRESETS = [
  { amount: 5,  label: "Feeds an animal for a week" },
  { amount: 10, label: "Covers essential supplies" },
  { amount: 20, label: "Pays for a vet checkup" },
  { amount: 50, label: "Sponsors a month of care" },
]

interface Props {
  orgSlug: string
  orgName: string
  defaultAmount?: number
  buttonLabel?: string
}

export function DonateWidget({ orgSlug, orgName, defaultAmount = 10, buttonLabel }: Props) {
  const [selected, setSelected] = useState<number | "">(defaultAmount)
  const [custom, setCustom] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const effectiveAmount = custom !== "" ? Number(custom) : selected

  async function handleDonate() {
    const n = Number(effectiveAmount)
    if (!n || n < 1) { setError("Please enter an amount of at least €1."); return }
    setLoading(true)
    setError("")
    try {
      const res = await fetch(`/api/portal/${orgSlug}/donate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: n }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? "Something went wrong"); setLoading(false); return }
      window.location.href = data.url
    } catch {
      setError("Something went wrong. Please try again.")
      setLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      {/* 2×2 preset grid */}
      <div className="grid grid-cols-2 gap-3">
        {PRESETS.map(p => {
          const active = selected === p.amount && custom === ""
          return (
            <button
              key={p.amount}
              type="button"
              onClick={() => { setSelected(p.amount); setCustom("") }}
              className={`relative flex flex-col gap-1.5 p-4 rounded-xl border-2 text-left transition-all duration-150 active:scale-[0.97] ${
                active
                  ? "border-white/70 bg-white/15"
                  : "border-white/15 bg-transparent hover:border-white/35 hover:bg-white/10"
              }`}
            >
              {active && (
                <span className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-white flex items-center justify-center">
                  <span className="w-2 h-2 rounded-full bg-[#1a3a2a]" />
                </span>
              )}
              <span className={`text-xl font-extrabold tracking-tight ${active ? "text-white" : "text-white/70"}`}>
                €{p.amount}
              </span>
              <p className={`text-xs leading-snug ${active ? "text-white/80" : "text-white/40"}`}>
                {p.label}
              </p>
            </button>
          )
        })}
      </div>

      {/* Custom amount */}
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 font-bold text-base pointer-events-none select-none">
          €
        </span>
        <input
          type="number"
          min="1"
          step="1"
          placeholder="Enter a different amount"
          value={custom}
          onChange={e => { setCustom(e.target.value); setSelected("") }}
          className="w-full pl-8 pr-4 py-3 rounded-xl border-2 border-white/15 bg-transparent text-white font-semibold text-sm placeholder:text-white/30 focus:outline-none focus:border-white/40 transition-colors"
        />
      </div>

      {error && (
        <p className="text-sm text-red-200 bg-red-900/40 rounded-lg px-4 py-2.5">{error}</p>
      )}

      {/* Donate CTA */}
      <button
        type="button"
        onClick={handleDonate}
        disabled={loading || !effectiveAmount}
        className="w-full flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 disabled:bg-white/10 disabled:text-white/30 disabled:cursor-not-allowed text-[#1a3a2a] font-bold text-base py-4 rounded-xl transition-all duration-150 active:scale-[0.99] shadow-lg shadow-black/20"
      >
        {loading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Redirecting to payment…
          </>
        ) : (
          buttonLabel ?? (effectiveAmount
            ? `Donate €${effectiveAmount} to ${orgName}`
            : "Donate now")
        )}
      </button>

      {/* Trust line */}
      <div className="flex items-center justify-center gap-1.5 pt-1 text-xs text-white/40">
        <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
        <span>100% of your donation goes directly to the animals</span>
      </div>
    </div>
  )
}
