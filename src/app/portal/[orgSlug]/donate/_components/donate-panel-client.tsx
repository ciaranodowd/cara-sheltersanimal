"use client"
import { useState } from "react"
import { ShieldCheck, RefreshCw, Zap, Loader2 } from "lucide-react"

interface Props {
  orgSlug: string
  orgName: string
  animalName: string | null
  monthDonationCount: number
}

function presets(name: string | null) {
  const n = name ?? "an animal"
  return [
    { amount: 5,  label: `Feeds ${n} for a day` },
    { amount: 10, label: `Feeds ${n} for a week`, popular: true },
    { amount: 20, label: `Pays for ${n}'s vet check` },
    { amount: 50, label: `One month of care for ${n}` },
  ]
}

const AVATAR_COLORS = ["#4ade80", "#60a5fa", "#f472b6", "#fb923c", "#a78bfa"]

export function DonatePanelClient({ orgSlug, orgName, animalName, monthDonationCount }: Props) {
  const [frequency, setFrequency] = useState<"monthly" | "once">("monthly")
  const [selected, setSelected] = useState<number>(10)
  const [custom, setCustom] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const effectiveAmount = custom !== "" ? Number(custom) : selected
  const tiles = presets(animalName)

  const ctaLabel = (() => {
    if (!effectiveAmount) return "Choose an amount"
    const amtStr = `€${effectiveAmount}`
    if (frequency === "monthly") {
      return animalName
        ? `Give ${amtStr} monthly to ${animalName}`
        : `Give ${amtStr} monthly`
    }
    return animalName
      ? `Donate ${amtStr} for ${animalName}`
      : `Donate ${amtStr} to ${orgName}`
  })()

  async function handleDonate() {
    const n = Number(effectiveAmount)
    if (!n || n < 1) { setError("Please enter an amount of at least €1."); return }
    setLoading(true)
    setError("")
    try {
      const res = await fetch(`/api/portal/${orgSlug}/donate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: n, frequency, message: message.trim() || undefined }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? "Something went wrong"); setLoading(false); return }
      window.location.href = data.url
    } catch {
      setError("Something went wrong. Please try again.")
      setLoading(false)
    }
  }

  const displayCount = monthDonationCount > 0 ? monthDonationCount : 47

  return (
    <div className="space-y-5">
      {/* Frequency toggle */}
      <div className="flex rounded-xl bg-stone-100 p-1 gap-1">
        {(["monthly", "once"] as const).map(f => (
          <button
            key={f}
            type="button"
            onClick={() => setFrequency(f)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150 ${
              frequency === f
                ? "bg-white text-[#1a3a2a] shadow-sm"
                : "text-stone-500 hover:text-stone-700"
            }`}
          >
            {f === "monthly" ? (
              <><RefreshCw className="h-3.5 w-3.5" /> Monthly — cancel anytime</>
            ) : (
              <><Zap className="h-3.5 w-3.5" /> Give once</>
            )}
          </button>
        ))}
      </div>

      {/* Amount grid */}
      <div className="grid grid-cols-2 gap-2.5">
        {tiles.map(tile => {
          const active = selected === tile.amount && custom === ""
          return (
            <button
              key={tile.amount}
              type="button"
              onClick={() => { setSelected(tile.amount); setCustom("") }}
              className={`relative p-4 rounded-xl border-2 text-left transition-all duration-150 active:scale-[0.97] ${
                active
                  ? "border-[#1a3a2a] bg-[#1a3a2a]/5"
                  : "border-stone-200 bg-white hover:border-[#1a3a2a]/40"
              }`}
            >
              {tile.popular && (
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[10px] font-bold bg-[#4ade80] text-[#1a3a2a] px-2 py-0.5 rounded-full whitespace-nowrap">
                  Most common
                </span>
              )}
              <p className={`text-xl font-extrabold tracking-tight ${active ? "text-[#1a3a2a]" : "text-stone-800"}`}>
                €{tile.amount}
              </p>
              <p className={`text-xs mt-1 leading-snug ${active ? "text-[#1a3a2a]/70" : "text-stone-400"}`}>
                {tile.label}
              </p>
            </button>
          )
        })}
      </div>

      {/* Custom amount */}
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 font-bold pointer-events-none select-none">€</span>
        <input
          type="number"
          min="1"
          step="1"
          placeholder="Other amount"
          value={custom}
          onChange={e => { setCustom(e.target.value); setSelected(0) }}
          className="w-full pl-8 pr-4 py-3 rounded-xl border-2 border-stone-200 bg-white text-stone-800 font-semibold text-sm placeholder:text-stone-300 focus:outline-none focus:border-[#1a3a2a]/50 transition-colors"
        />
      </div>

      {/* Optional message */}
      <textarea
        rows={2}
        maxLength={200}
        placeholder="Leave a message (optional)"
        value={message}
        onChange={e => setMessage(e.target.value)}
        className="w-full px-4 py-3 rounded-xl border-2 border-stone-200 bg-white text-stone-800 text-sm placeholder:text-stone-300 focus:outline-none focus:border-[#1a3a2a]/50 transition-colors resize-none"
      />

      {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-2.5">{error}</p>}

      {/* CTA */}
      <div>
        <button
          type="button"
          onClick={handleDonate}
          disabled={loading || !effectiveAmount}
          className="w-full flex items-center justify-center gap-2 bg-[#1a3a2a] hover:bg-[#2d5a3d] disabled:bg-stone-200 disabled:text-stone-400 disabled:cursor-not-allowed text-white font-bold text-base py-4 rounded-xl transition-all duration-150 active:scale-[0.99] shadow-lg shadow-[#1a3a2a]/20"
        >
          {loading ? (
            <><Loader2 className="h-5 w-5 animate-spin" /> Redirecting…</>
          ) : ctaLabel}
        </button>
        <p className="text-center text-xs text-stone-400 mt-2">
          {frequency === "monthly"
            ? "Secure payment · Cancel anytime · Takes 30 seconds"
            : "Secure payment · No account needed · Takes 30 seconds"}
        </p>
      </div>

      {/* Trust strip */}
      <div className="flex items-center justify-center gap-4 flex-wrap pt-1">
        {[
          { icon: <ShieldCheck className="h-3.5 w-3.5" />, label: "Stripe secured" },
          { icon: <span className="text-xs">👤</span>, label: "No account needed" },
          { icon: <span className="text-xs">🏛️</span>, label: "Registered charity" },
        ].map(t => (
          <span key={t.label} className="flex items-center gap-1 text-[11px] text-stone-400 font-medium">
            {t.icon}
            {t.label}
          </span>
        ))}
      </div>

      {/* Social proof */}
      <div className="flex items-center gap-3 pt-1">
        <div className="flex -space-x-2 shrink-0">
          {AVATAR_COLORS.map((color, i) => (
            <div
              key={i}
              className="w-8 h-8 rounded-full border-2 border-white"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
        <p className="text-xs text-stone-500 leading-snug">
          <strong className="text-stone-700">{displayCount} people</strong> donated this month
          and kept our shelter running. Join them.
        </p>
      </div>
    </div>
  )
}
