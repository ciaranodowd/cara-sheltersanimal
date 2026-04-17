import { prisma } from "@/lib/prisma"
import { stripe } from "@/lib/stripe"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Heart } from "lucide-react"
import { ShareButton } from "../_components/share-button"

export const dynamic = "force-dynamic"

function impactMessage(amount: number, orgName: string): string {
  if (amount >= 50) return `Your €${amount} donation covers a full month of care for an animal at ${orgName} — food, shelter, and vet visits.`
  if (amount >= 20) return `Your €${amount} donation pays for a vet health check for an animal at ${orgName}.`
  if (amount >= 10) return `Your €${amount} donation feeds a dog or cat at ${orgName} for an entire week.`
  return `Your €${amount} donation helps cover food and daily care for the animals at ${orgName}.`
}

function impactEmoji(amount: number): string {
  if (amount >= 50) return "🏡"
  if (amount >= 20) return "🩺"
  if (amount >= 10) return "🐕"
  return "🐾"
}

export default async function DonateThankYouPage({
  params,
  searchParams,
}: {
  params: { orgSlug: string }
  searchParams: { session_id?: string }
}) {
  const org = await prisma.organization.findUnique({
    where: { slug: params.orgSlug },
    select: { name: true, logo: true },
  })
  if (!org) notFound()

  // Retrieve donation amount from Stripe session
  let amount = 0
  if (searchParams.session_id) {
    try {
      const session = await stripe.checkout.sessions.retrieve(searchParams.session_id)
      amount = (session.amount_total ?? 0) / 100
    } catch {
      // session not found — show generic thank you
    }
  }

  const formattedAmount = amount > 0
    ? new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(amount)
    : null

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#fdf8f5" }}>
      {/* Celebration hero */}
      <div
        className="relative overflow-hidden pt-14 pb-10 px-4 text-center"
        style={{ background: "linear-gradient(160deg, #1a3a2a 0%, #2d5a3d 60%, #1a3a2a 100%)" }}
      >
        {/* Floating decorations */}
        {["🐾","❤️","✨","🐾","❤️","✨"].map((el, i) => (
          <span
            key={i}
            className="absolute text-lg pointer-events-none select-none opacity-60"
            style={{
              top:  ["10%","6%","14%","4%","8%","16%"][i],
              left: ["6%","20%","38%","58%","75%","88%"][i],
              animation: `bounce ${[2.8,3.1,2.5,3.3,2.7,2.9][i]}s ${[0,0.4,0.8,0.2,0.6,1.0][i]}s infinite`,
            }}
          >
            {el}
          </span>
        ))}

        {/* Icon */}
        <div className="relative z-10 inline-flex items-center justify-center mb-5">
          <div className="w-20 h-20 rounded-full bg-[#4ade80]/20 flex items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-[#4ade80] flex items-center justify-center shadow-lg shadow-green-900/30 text-3xl">
              {amount > 0 ? impactEmoji(amount) : "❤️"}
            </div>
          </div>
        </div>

        {/* Headline */}
        <h1 className="relative z-10 text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-3">
          You just made a difference!
        </h1>

        {formattedAmount ? (
          <div className="relative z-10 inline-flex items-center gap-2 bg-[#4ade80] text-[#1a3a2a] font-bold text-lg px-6 py-2.5 rounded-full shadow-lg shadow-green-900/20">
            <Heart className="h-5 w-5 fill-[#1a3a2a]" />
            {formattedAmount} donated to {org.name}
          </div>
        ) : (
          <p className="relative z-10 text-[#4ade80] font-bold text-lg">
            Thank you for your generous donation!
          </p>
        )}
      </div>

      <main className="max-w-lg mx-auto w-full px-4 py-8 space-y-5 flex-1">
        {/* Impact message */}
        {amount > 0 && (
          <div
            className="rounded-3xl p-5 text-center space-y-3"
            style={{ background: "linear-gradient(135deg, #fff7f5, #fff1ee)", border: "1px solid #fde8e4" }}
          >
            <p className="text-4xl">{impactEmoji(amount)}</p>
            <p className="text-sm font-medium text-stone-700 leading-relaxed max-w-xs mx-auto">
              {impactMessage(amount, org.name)}
            </p>
            <p className="text-xs text-rose-400 font-semibold">
              Every single euro goes directly to the animals ❤️
            </p>
          </div>
        )}

        {/* Thank you note */}
        <div className="bg-white rounded-3xl border border-stone-100 shadow-sm p-5 text-center space-y-2">
          <p className="text-sm font-semibold text-stone-800">
            From everyone at {org.name} — thank you. 🙏
          </p>
          <p className="text-xs text-stone-400 leading-relaxed">
            A receipt has been sent to your email. Your kindness directly helps us provide
            food, shelter, and care to every animal in our rescue.
          </p>
        </div>

        {/* Share */}
        <ShareButton orgName={org.name} orgSlug={params.orgSlug} amount={amount} />

        {/* CTAs */}
        <div className="flex flex-col gap-2.5 pt-1">
          <Link
            href={`/portal/${params.orgSlug}`}
            className="flex items-center justify-center gap-2 w-full bg-[#1a3a2a] hover:bg-[#2d5a3d] text-white font-bold py-4 rounded-2xl transition-colors text-sm"
          >
            🐾 Meet the animals at {org.name}
          </Link>
          <Link
            href={`/portal/${params.orgSlug}/donate`}
            className="flex items-center justify-center gap-2 w-full border border-stone-200 bg-white hover:bg-stone-50 text-stone-600 font-semibold py-3.5 rounded-2xl transition-colors text-sm"
          >
            Donate again
          </Link>
        </div>
      </main>
    </div>
  )
}
