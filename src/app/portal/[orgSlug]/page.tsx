import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import { MapPin, Mail, Phone, Heart, HandHeart } from "lucide-react"
import { SPECIES_LABELS, SPECIES_EMOJI } from "@/lib/constants"

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }: { params: { orgSlug: string } }) {
  const org = await prisma.organization.findUnique({ where: { slug: params.orgSlug }, select: { name: true } })
  return { title: org ? `${org.name} — Adopt` : "Adopt" }
}

function ageLabel(dob: Date | null): string | null {
  if (!dob) return null
  const months = Math.floor((Date.now() - new Date(dob).getTime()) / (30 * 24 * 3600 * 1000))
  if (months < 1) return "< 1 mo"
  if (months < 12) return `${months} mo`
  const y = Math.floor(months / 12)
  const m = months % 12
  return m ? `${y}y ${m}m` : `${y}y`
}

export default async function PublicPortalPage({ params }: { params: { orgSlug: string } }) {
  const org = await prisma.organization.findUnique({
    where: { slug: params.orgSlug },
    select: {
      id: true, name: true, description: true,
      email: true, phone: true, website: true,
      city: true, county: true, logo: true,
      donationUrl: true,
    },
  })
  if (!org) notFound()

  const animals = await prisma.animal.findMany({
    where: { organizationId: org.id, status: "AVAILABLE", publicProfile: true },
    orderBy: { createdAt: "desc" },
    include: { photos: { take: 1, orderBy: { position: "asc" } } },
  })

  const location = [org.city, org.county].filter(Boolean).join(", ")

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ backgroundColor: "#f7f5f0" }}>

      {/* ── HEADER ── */}
      <header className="bg-white/95 backdrop-blur-sm border-b sticky top-0 z-20 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            {org.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={org.logo} alt={org.name} className="h-9 w-9 rounded-full object-cover shrink-0" />
            ) : (
              <div className="w-9 h-9 bg-[#1a3a2a] rounded-xl flex items-center justify-center text-white font-bold text-base shrink-0">
                {org.name[0]}
              </div>
            )}
            <span className="font-bold text-lg truncate text-[#1a3a2a]">{org.name}</span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {org.phone && (
              <a href={`tel:${org.phone}`} className="hidden md:flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#1a3a2a] transition-colors">
                <Phone className="h-3.5 w-3.5" />
                {org.phone}
              </a>
            )}
            <a
              href="#animals"
              className="flex items-center gap-1.5 bg-[#1a3a2a] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[#2d5a3d] transition-colors whitespace-nowrap"
            >
              <Heart className="h-3.5 w-3.5" />
              Adopt today
            </a>
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section style={{ background: "linear-gradient(135deg, #1a3a2a 0%, #2d5a3d 55%, #1a3a2a 100%)" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <div className="max-w-2xl">
            {location && (
              <div className="flex items-center gap-1.5 text-sm text-[#a7c4b5] mb-5">
                <MapPin className="h-3.5 w-3.5 text-[#4ade80]" />
                {location}
              </div>
            )}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] mb-5 text-white">
              Every animal<br />deserves a{" "}
              <span style={{ color: "#4ade80" }}>loving home.</span>
            </h1>
            <p className="text-lg text-[#a7c4b5] leading-relaxed mb-8 max-w-xl">
              {org.description ??
                `${org.name} rescues and rehomes animals in need. Browse our animals below and find your perfect companion.`}
            </p>
            <div className="flex items-center gap-3 sm:gap-5 flex-wrap">
              <a
                href="#animals"
                className="inline-flex items-center gap-2 bg-[#4ade80] text-[#1a3a2a] font-bold px-7 py-3.5 rounded-xl hover:bg-[#22c55e] transition-colors text-base shadow-lg shadow-black/20"
              >
                <Heart className="h-4 w-4" />
                Meet the animals
              </a>
              {org.donationUrl && (
                <a
                  href={org.donationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 border border-white/30 text-white font-semibold px-5 py-3 rounded-xl hover:bg-white/10 transition-colors text-sm"
                >
                  <HandHeart className="h-4 w-4" />
                  Donate
                </a>
              )}
              {animals.length > 0 && (
                <p className="text-[#a7c4b5] text-sm">
                  <span className="text-white font-bold text-2xl mr-1.5">{animals.length}</span>
                  {animals.length === 1 ? "animal" : "animals"} looking for homes
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── ANIMAL GRID ── */}
      <main id="animals" className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-[#1a3a2a]">Animals looking for homes</h2>
          <p className="text-sm text-gray-500 mt-1">
            {animals.length === 0
              ? "No animals available right now"
              : `${animals.length} animal${animals.length !== 1 ? "s" : ""} available for adoption`}
          </p>
        </div>

        {animals.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <p className="text-5xl mb-4">🐾</p>
            <p className="font-bold text-lg mb-1 text-[#1a3a2a]">No animals available right now</p>
            <p className="text-sm text-gray-500 mb-5">
              Check back soon — animals are added regularly.
            </p>
            {org.email && (
              <a href={`mailto:${org.email}`} className="text-[#1a3a2a] text-sm font-semibold hover:underline">
                Email us to find out more
              </a>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {animals.map(animal => {
              const photo = animal.photos[0]
              const emoji = SPECIES_EMOJI[animal.species] ?? "🐾"
              const age = ageLabel(animal.dobApprox)
              const sexLabel = animal.sex === "MALE" ? "Male" : animal.sex === "FEMALE" ? "Female" : null
              const speciesLabel = SPECIES_LABELS[animal.species] ?? animal.species

              return (
                <Link
                  key={animal.id}
                  href={`/portal/${params.orgSlug}/animals/${animal.id}`}
                  className="group relative rounded-2xl overflow-hidden shadow-md hover:shadow-xl sm:hover:shadow-2xl transition-all duration-300 sm:hover:-translate-y-2 bg-white"
                >
                  {/* Photo — fixed 160px on mobile, portrait ratio on desktop */}
                  <div className="h-40 sm:h-auto sm:aspect-[3/4] relative overflow-hidden bg-gradient-to-br from-stone-100 to-stone-200">
                    {photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={photo.url}
                        alt={animal.name}
                        className="w-full h-full object-cover sm:group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-5xl sm:text-7xl">
                        {emoji}
                      </div>
                    )}

                    {/* Available badge */}
                    <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
                      <span className="flex items-center gap-1 sm:gap-1.5 bg-emerald-500 text-white text-[10px] sm:text-[11px] font-bold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full shadow-md">
                        <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                        Available
                      </span>
                    </div>

                    {/* Age / sex floating badges */}
                    {(age || sexLabel) && (
                      <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex flex-col gap-1">
                        {age && (
                          <span className="bg-black/55 backdrop-blur-sm text-white text-[10px] sm:text-[11px] font-medium px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full">
                            {age}
                          </span>
                        )}
                        {sexLabel && (
                          <span className="bg-black/55 backdrop-blur-sm text-white text-[10px] sm:text-[11px] font-medium px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full">
                            {sexLabel}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Bottom gradient + text overlay — desktop only */}
                    <div className="hidden sm:block absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                    <div className="hidden sm:block absolute inset-x-0 bottom-0 p-4">
                      <p className="text-white font-bold text-xl leading-tight drop-shadow">{animal.name}</p>
                      {(animal.breed || speciesLabel) && (
                        <p className="text-white/70 text-sm mt-0.5">
                          {animal.breed ?? speciesLabel}
                        </p>
                      )}
                      <div className="mt-2.5 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-200">
                        <span className="text-[#4ade80] text-sm font-bold">Give {animal.name} a home</span>
                        <Heart className="h-3.5 w-3.5 text-[#4ade80] shrink-0" />
                      </div>
                    </div>
                  </div>

                  {/* Mobile info panel — hidden on desktop */}
                  <div className="sm:hidden p-2.5">
                    <p className="font-bold text-sm text-[#1a3a2a] leading-tight truncate">{animal.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5 truncate">{animal.breed ?? speciesLabel}</p>
                    {location && (
                      <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                        <MapPin className="h-3 w-3 shrink-0" />
                        <span className="truncate">{location}</span>
                      </p>
                    )}
                    <div className="mt-2 w-full bg-[#1a3a2a] text-white text-xs font-semibold py-1.5 rounded-lg text-center">
                      Apply to adopt
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </main>

      {/* ── DONATION SECTION ── */}
      {org.donationUrl && (
        <section style={{ backgroundColor: "#1a3a2a" }} className="py-16 sm:py-20">
          <div className="max-w-lg mx-auto px-4 sm:px-6 text-center">
            <p className="text-xs font-semibold tracking-widest uppercase text-[#4ade80]/60 mb-4">
              Support our work
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight tracking-tight mb-3">
              {animals.length > 0
                ? "Every animal you just met needs you."
                : "They're waiting. You can help."}
            </h2>
            <p className="text-[#a7c4b5] text-base leading-relaxed max-w-sm mx-auto mb-8">
              100% of donations go directly to the animals in our care.
            </p>
            <a
              href={org.donationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#4ade80] text-[#1a3a2a] font-bold px-8 py-4 rounded-xl hover:bg-[#22c55e] transition-colors text-base shadow-lg shadow-black/20"
            >
              <HandHeart className="h-5 w-5" />
              Donate to {org.name}
            </a>
          </div>
        </section>
      )}

      {/* ── FOOTER ── */}
      <footer className="bg-[#1a3a2a] mt-0">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 min-w-0">
            <div className="space-y-1.5 min-w-0 max-w-full">
              <p className="font-semibold text-sm text-white truncate">{org.name}</p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-[#a7c4b5]">
                {location && (
                  <span className="flex items-center gap-1.5 min-w-0">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{location}</span>
                  </span>
                )}
                {org.email && (
                  <a href={`mailto:${org.email}`} className="flex items-center gap-1.5 hover:text-white transition-colors min-w-0 max-w-full">
                    <Mail className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{org.email}</span>
                  </a>
                )}
                {org.phone && (
                  <a href={`tel:${org.phone}`} className="flex items-center gap-1.5 hover:text-white transition-colors">
                    <Phone className="h-3.5 w-3.5 shrink-0" />
                    {org.phone}
                  </a>
                )}
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <p className="text-sm text-[#a7c4b5]">
                Powered by <span className="text-[#4ade80] font-semibold">Cara</span>
              </p>
              <div className="flex items-center gap-4 flex-wrap justify-end">
                <a href="/legal/cara-privacy-policy.docx" download className="text-xs text-[#a7c4b5] hover:text-white transition-colors">
                  Privacy Policy
                </a>
                <a href="/legal/cara-terms-of-service.docx" download className="text-xs text-[#a7c4b5] hover:text-white transition-colors">
                  Terms of Service
                </a>
                <a href="/legal/cara-data-processing-agreement.docx" download className="text-xs text-[#a7c4b5] hover:text-white transition-colors">
                  DPA
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
