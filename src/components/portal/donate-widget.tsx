"use client"
import { useState } from "react"
import { Heart, Loader2, ArrowRight } from "lucide-react"

const PRESETS = [
  { amount: 5,  label: "Buys a week of food",          emoji: "🐾" },
  { amount: 10, label: "Feeds a dog for a week",        emoji: "🐕" },
  { amount: 20, label: "Covers a vet checkup",          emoji: "🩺" },
  { amount: 50, label: "Sponsors an animal for a month",emoji: "❤️" },
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
      <div className="grid grid-cols-2 gap-2.5">
        {PRESETS.map(p => {
          const active = selected === p.amount && custom === ""
          return (
            <button
              key={p.amount}
              type="button"
              onClick={() => { setSelected(p.amount); setCustom("") }}
              className={`relative flex flex-col gap-1 p-3.5 sm:p-4 rounded-2xl border-2 text-left transition-all duration-150 active:scale-[0.97] ${
                active
                  ? "border-rose-400 bg-rose-50 shadow-sm shadow-rose-100"
                  : "border-stone-200 bg-white hover:border-rose-200 hover:bg-rose-50/40"
              }`}
            >
              {active && (
                <span className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-rose-400 flex items-center justify-center">
                  <span className="w-2 h-2 rounded-full bg-white" />
                </span>
              )}
              <div className="flex items-center gap-2">
                <span className="text-xl leading-none">{p.emoji}</span>
                <span className={`text-xl font-extrabold ${active ? "text-rose-600" : "text-stone-800"}`}>
                  €{p.amount}
                </span>
              </div>
              <p className={`text-xs leading-snug ${active ? "text-rose-500" : "text-stone-500"}`}>
                {p.label}
              </p>
            </button>
          )
        })}
      </div>

      {/* Custom amount */}
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 font-bold text-base pointer-events-none select-none">
          €
        </span>
        <input
          type="number"
          min="1"
          step="1"
          placeholder="Enter a different amount…"
          value={custom}
          onChange={e => { setCustom(e.target.value); setSelected("") }}
          className="w-full pl-8 pr-4 py-3 rounded-2xl border-2 border-stone-200 bg-white text-stone-800 font-semibold text-sm placeholder:text-stone-400 focus:outline-none focus:border-rose-400 transition-colors"
        />
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2.5">{error}</p>
      )}

      {/* Donate CTA */}
      <button
        type="button"
        onClick={handleDonate}
        disabled={loading || !effectiveAmount}
        className="w-full flex items-center justify-center gap-2.5 bg-rose-500 hover:bg-rose-600 disabled:bg-stone-200 disabled:text-stone-400 disabled:shadow-none text-white font-bold text-base py-4 rounded-2xl transition-all duration-150 active:scale-[0.99] shadow-lg shadow-rose-200"
      >
        {loading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Redirecting to payment…
          </>
        ) : (
          <>
            <Heart className="h-5 w-5 fill-white shrink-0" />
            {buttonLabel ?? (effectiveAmount
              ? `Donate €${effectiveAmount} to ${orgName}`
              : "Donate now")}
            <ArrowRight className="h-4 w-4 ml-auto shrink-0" />
          </>
        )}
      </button>

      <p className="text-xs text-center text-stone-400">
        🔒 Processed securely by Stripe · 100% goes directly to the animals
      </p>
    </div>
  )
}
