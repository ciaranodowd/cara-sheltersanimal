import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { DonatePanelClient } from "./_components/donate-panel-client"
import { SPECIES_LABELS } from "@/lib/constants"

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }: { params: { orgSlug: string } }) {
  const org = await prisma.organization.findUnique({ where: { slug: params.orgSlug }, select: { name: true } })
  return { title: org ? `Donate to ${org.name}` : "Donate" }
}

function generateStory(animal: { name: string; intakeDate: Date | null; description: string | null }): string {
  if (animal.description && animal.description.length > 20) {
    return animal.description.length > 150
      ? animal.description.slice(0, 147) + "…"
      : animal.description
  }
  if (animal.intakeDate) {
    const weeks = Math.floor((Date.now() - new Date(animal.intakeDate).getTime()) / (7 * 24 * 3600 * 1000))
    const timeStr = weeks < 1 ? "just this week" : weeks === 1 ? "1 week ago" : `${weeks} weeks ago`
    return `Arrived ${timeStr}. Eating well, learning to trust again. Needs your support this week.`
  }
  return `In our care and waiting for a loving home. Your donation helps cover their food and vet care every single day.`
}

export default async function DonatePage({ params }: { params: { orgSlug: string } }) {
  const org = await prisma.organization.findUnique({
    where: { slug: params.orgSlug },
    select: { id: true, name: true, logo: true, city: true, county: true, email: true, stripeAccountId: true, stripeOnboarded: true },
  })
  if (!org) notFound()

  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  // Spotlight animal: longest-waiting available animal first
  const spotlightAnimal = await prisma.animal.findFirst({
    where: { organizationId: org.id, status: "AVAILABLE", publicProfile: true },
    orderBy: { intakeDate: "asc" },
    include: { photos: { take: 1, orderBy: { position: "asc" } } },
  }) ?? await prisma.animal.findFirst({
    where: { organizationId: org.id, status: { in: ["INTAKE", "ASSESSMENT", "IN_FOSTER", "FOSTERED"] } },
    orderBy: { intakeDate: "asc" },
    include: { photos: { take: 1, orderBy: { position: "asc" } } },
  })

  const [animalCount, monthDonationCount] = await Promise.all([
    prisma.animal.count({
      where: {
        organizationId: org.id,
        status: { in: ["AVAILABLE", "IN_FOSTER", "FOSTERED", "INTAKE", "ASSESSMENT"] },
      },
    }),
    prisma.donation.count({
      where: { organizationId: org.id, status: "COMPLETED", createdAt: { gte: startOfMonth } },
    }),
  ])

  const photo = spotlightAnimal?.photos[0] ?? null
  const story = spotlightAnimal ? generateStory(spotlightAnimal) : null
  const speciesLabel = spotlightAnimal ? (SPECIES_LABELS[spotlightAnimal.species] ?? spotlightAnimal.species) : null

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#fdf8f5" }}>

      {/* ── STICKY HEADER ── */}
      <header className="bg-white/90 backdrop-blur-sm border-b sticky top-0 z-20">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <Link href={`/portal/${params.orgSlug}`} className="text-stone-400 hover:text-stone-700 transition-colors">
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

      {/* ── HERO ── */}
      <section style={{ backgroundColor: "#1a3a2a" }} className="pt-10 pb-14 px-4 text-center">
        {/* Animal photo — portrait card */}
        {photo ? (
          <div className="mx-auto w-44 h-56 rounded-2xl overflow-hidden shadow-2xl shadow-black/40 ring-4 ring-white/10 mb-7">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photo.url} alt={spotlightAnimal?.name ?? "Animal in care"} className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="mx-auto w-44 h-56 rounded-2xl bg-[#2d5a3d] flex items-center justify-center text-7xl shadow-2xl mb-7">
            🐾
          </div>
        )}

        <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight tracking-tight mb-2">
          They can&apos;t ask.
          <br />
          <span style={{ color: "#4ade80" }}>But you can give.</span>
        </h1>

        {animalCount > 0 && (
          <div className="inline-flex items-center gap-2 mt-4 bg-white/10 backdrop-blur-sm text-white text-sm font-medium px-4 py-2 rounded-full">
            <span className="w-2 h-2 rounded-full bg-[#4ade80] animate-pulse shrink-0" />
            {animalCount} animal{animalCount !== 1 ? "s" : ""} in our care right now
          </div>
        )}
      </section>

      <main className="max-w-lg mx-auto px-4 -mt-6 pb-12 space-y-5">

        {/* ── ANIMAL SPOTLIGHT CARD ── */}
        {spotlightAnimal && (
          <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-4 flex items-start gap-4">
            {photo ? (
              <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo.url} alt={spotlightAnimal.name} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-14 h-14 rounded-xl bg-stone-100 flex items-center justify-center text-2xl shrink-0">🐾</div>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <p className="font-bold text-stone-900">{spotlightAnimal.name}</p>
                {speciesLabel && (
                  <span className="text-xs bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full font-medium">
                    {speciesLabel}
                  </span>
                )}
              </div>
              <p className="text-sm text-stone-500 leading-relaxed">{story}</p>
            </div>
          </div>
        )}

        {/* ── DONATE PANEL ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-5 sm:p-6">
          {org.stripeOnboarded ? (
            <>
              <p className="text-xs font-semibold tracking-widest uppercase text-stone-400 mb-5 text-center">
                Choose how you&apos;d like to help
              </p>
              <DonatePanelClient
                orgSlug={params.orgSlug}
                orgName={org.name}
                animalName={spotlightAnimal?.name ?? null}
                monthDonationCount={monthDonationCount}
              />
            </>
          ) : (
            <div className="text-center py-6 space-y-2">
              <p className="text-stone-500 font-medium">Donations not available yet</p>
              <p className="text-sm text-stone-400">
                {org.name} is still setting up their donation account. Check back soon.
              </p>
            </div>
          )}
        </div>

        {/* ── FOOTER NOTE ── */}
        <p className="text-center text-xs text-stone-400 pb-4">
          All donations go directly to {org.name} · No platform fees taken by Cara
          {org.email && (
            <>
              {" · "}
              <a href={`mailto:${org.email}`} className="hover:text-stone-600 transition-colors">
                {org.email}
              </a>
            </>
          )}
        </p>
      </main>
    </div>
  )
}
