import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, MapPin } from "lucide-react"
import { DonateWidget } from "@/components/portal/donate-widget"

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }: { params: { orgSlug: string } }) {
  const org = await prisma.organization.findUnique({ where: { slug: params.orgSlug }, select: { name: true } })
  return { title: org ? `Donate to ${org.name}` : "Donate" }
}

export default async function DonatePage({ params }: { params: { orgSlug: string } }) {
  const org = await prisma.organization.findUnique({
    where: { slug: params.orgSlug },
    select: { id: true, name: true, logo: true, description: true, city: true, county: true, email: true },
  })
  if (!org) notFound()

  const animalCount = await prisma.animal.count({
    where: { organizationId: org.id, status: { in: ["AVAILABLE", "IN_FOSTER", "FOSTERED", "INTAKE", "ASSESSMENT"] } },
  })

  const location = [org.city, org.county].filter(Boolean).join(", ")

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#fdf8f5" }}>
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b sticky top-0 z-20">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <Link
            href={`/portal/${params.orgSlug}`}
            className="text-stone-400 hover:text-stone-700 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex items-center gap-2 mx-auto">
            {org.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={org.logo} alt={org.name} className="h-7 w-7 rounded-full object-cover" />
            ) : (
              <div className="w-7 h-7 bg-[#1a3a2a] rounded-lg flex items-center justify-center text-white text-xs font-bold">
                {org.name[0]}
              </div>
            )}
            <span className="font-semibold text-sm text-stone-800">{org.name}</span>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-8 space-y-6">
        {/* Emotional hero */}
        <div className="text-center space-y-4">
          {/* Paw + heart stacked icon */}
          <div className="relative inline-flex items-center justify-center mx-auto">
            <div className="w-20 h-20 rounded-full flex items-center justify-center text-5xl"
              style={{ background: "linear-gradient(135deg, #fff1ee, #fde8e4)" }}>
              🐾
            </div>
            <span className="absolute -bottom-1 -right-1 text-2xl">❤️</span>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 leading-tight">
              Support {org.name}
            </h1>
            {location && (
              <p className="flex items-center justify-center gap-1 text-xs text-stone-400 mt-1">
                <MapPin className="h-3 w-3" />
                {location}
              </p>
            )}
          </div>

          <p className="text-stone-500 text-sm leading-relaxed max-w-sm mx-auto">
            {org.description
              ? <>{org.description.slice(0, 120)}{org.description.length > 120 ? "…" : ""}</>
              : <>Every animal deserves a safe place to heal and find love.</>}
          </p>

          {/* Stats pill */}
          {animalCount > 0 && (
            <div className="inline-flex items-center gap-2 bg-white border border-stone-100 rounded-full px-4 py-2 text-sm shadow-sm">
              <span className="text-lg">🏠</span>
              <span className="text-stone-600">
                Caring for <strong className="text-stone-900">{animalCount}</strong> animal{animalCount !== 1 ? "s" : ""} right now
              </span>
            </div>
          )}
        </div>

        {/* Impact cards — visual proof */}
        <div className="grid grid-cols-3 gap-2 text-center">
          {[
            { icon: "🍽️", value: "€5",  sub: "Feeds an animal for a week" },
            { icon: "💉", value: "€20", sub: "Covers a vet checkup" },
            { icon: "🏡", value: "€50", sub: "One month of full care" },
          ].map(c => (
            <div key={c.value} className="rounded-2xl p-3 space-y-1 bg-white border border-stone-100 shadow-sm">
              <p className="text-2xl">{c.icon}</p>
              <p className="font-extrabold text-stone-800 text-sm">{c.value}</p>
              <p className="text-[10px] text-stone-400 leading-snug">{c.sub}</p>
            </div>
          ))}
        </div>

        {/* The widget */}
        <div className="rounded-2xl p-5 sm:p-7" style={{ backgroundColor: "#1a3a2a" }}>
          <p className="text-center text-xs font-semibold tracking-widest uppercase text-[#4ade80]/60 mb-5">
            Choose an amount
          </p>
          <DonateWidget orgSlug={params.orgSlug} orgName={org.name} defaultAmount={10} />
        </div>

        {/* Trust signals */}
        <div className="flex flex-col gap-2 text-center text-xs text-stone-400">
          <p>All donations go directly to {org.name} · No platform fees taken</p>
          {org.email && (
            <p>
              Questions?{" "}
              <a href={`mailto:${org.email}`} className="text-rose-400 hover:underline">
                {org.email}
              </a>
            </p>
          )}
        </div>
      </main>
    </div>
  )
}
