import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import { MapPin, Mail, Phone, Heart, ChevronRight } from "lucide-react"
import { SPECIES_LABELS, SPECIES_EMOJI } from "@/lib/constants"

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: { orgSlug: string } }) {
  const org = await prisma.organization.findUnique({ where: { slug: params.orgSlug }, select: { name: true } })
  return { title: org ? `${org.name} — Adopt` : "Adopt" }
}

function ageLabel(dobApprox: Date | null): string | null {
  if (!dobApprox) return null
  const months = Math.floor((Date.now() - new Date(dobApprox).getTime()) / (1000 * 60 * 60 * 24 * 30))
  if (months < 1) return "< 1 mo"
  if (months < 12) return `${months} mo`
  const years = Math.floor(months / 12)
  const rem = months % 12
  return rem > 0 ? `${years} yr ${rem} mo` : `${years} yr`
}

export default async function PublicPortalPage({ params }: { params: { orgSlug: string } }) {
  const org = await prisma.organization.findUnique({
    where: { slug: params.orgSlug },
    select: { id: true, name: true, description: true, email: true, phone: true, website: true, city: true, county: true, logo: true },
  })
  if (!org) notFound()

  const animals = await prisma.animal.findMany({
    where: { organizationId: org.id, status: "AVAILABLE", publicProfile: true },
    orderBy: { createdAt: "desc" },
    include: { photos: { take: 1, orderBy: { position: "asc" } } },
  })

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── HEADER ─────────────────────────────────────────────────── */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">

          {/* Logo + name */}
          <div className="flex items-center gap-3 min-w-0">
            {org.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={org.logo} alt={org.name} className="h-9 w-9 rounded-full object-cover shrink-0" />
            ) : (
              <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-base shrink-0">
                {org.name[0]}
              </div>
            )}
            <span className="font-bold text-lg truncate">{org.name}</span>
          </div>

          {/* Contact + CTA */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            {org.phone && (
              <a
                href={`tel:${org.phone}`}
                className="hidden md:flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Phone className="h-3.5 w-3.5" />
                {org.phone}
              </a>
            )}
            {org.email && (
              <a
                href={`mailto:${org.email}`}
                className="hidden sm:flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Mail className="h-3.5 w-3.5" />
                <span className="hidden lg:inline">{org.email}</span>
                <span className="lg:hidden">Email us</span>
              </a>
            )}
            <a
              href="#animals"
              className="bg-primary text-primary-foreground text-sm font-semibold px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors whitespace-nowrap"
            >
              Adopt an animal
            </a>
          </div>
        </div>
      </header>

      {/* ── HERO ───────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-primary/10 via-primary/5 to-slate-50 border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <div className="max-w-2xl">
            {(org.city || org.county) && (
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4">
                <MapPin className="h-3.5 w-3.5 text-primary" />
                {[org.city, org.county].filter(Boolean).join(", ")}
              </div>
            )}
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4 text-foreground">
              Find your perfect<br className="hidden sm:block" /> companion
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              {org.description ??
                `${org.name} rescues and rehomes animals in need. Browse the animals below and apply to adopt or foster.`}
            </p>
            <a
              href="#animals"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-6 py-3 rounded-xl hover:bg-primary/90 transition-colors text-base shadow-sm"
            >
              <Heart className="h-4 w-4" />
              Meet the animals
            </a>
          </div>
        </div>
      </section>

      {/* ── ANIMAL GRID ────────────────────────────────────────────── */}
      <main id="animals" className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="mb-8">
          <h2 className="text-2xl font-bold">Animals looking for homes</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {animals.length === 0
              ? "No animals available right now"
              : `${animals.length} animal${animals.length !== 1 ? "s" : ""} available for adoption`}
          </p>
        </div>

        {animals.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border">
            <p className="text-5xl mb-4">🐾</p>
            <p className="font-semibold text-lg mb-1">No animals available right now</p>
            <p className="text-sm text-muted-foreground mb-5">
              Check back soon — animals are added regularly.
            </p>
            {org.email && (
              <a
                href={`mailto:${org.email}`}
                className="text-primary text-sm font-medium hover:underline"
              >
                Email us to find out more
              </a>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {animals.map(animal => {
              const photo = animal.photos[0]
              const emoji = SPECIES_EMOJI[animal.species] ?? "🐾"
              const age = ageLabel(animal.dobApprox)

              return (
                <Link
                  key={animal.id}
                  href={`/portal/${params.orgSlug}/animals/${animal.id}`}
                  className="group bg-white rounded-2xl border overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                >
                  {/* Photo */}
                  <div className="aspect-square bg-slate-100 overflow-hidden relative">
                    {photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={photo.url}
                        alt={animal.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-5xl">
                        {emoji}
                      </div>
                    )}
                    <div className="absolute top-2 left-2">
                      <span className="bg-green-500 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full shadow-sm">
                        Available
                      </span>
                    </div>
                  </div>

                  {/* Card body */}
                  <div className="p-3 sm:p-4">
                    <p className="font-bold text-base leading-snug">{animal.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {SPECIES_LABELS[animal.species] ?? animal.species}
                      {animal.breed ? ` · ${animal.breed}` : ""}
                    </p>
                    {(age || (animal.sex && animal.sex !== "UNKNOWN")) && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {[
                          age,
                          animal.sex && animal.sex !== "UNKNOWN" ? animal.sex.toLowerCase() : null,
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    )}
                    <div className="mt-3 flex items-center gap-1 text-primary text-sm font-semibold group-hover:gap-2 transition-all duration-150">
                      Apply to adopt
                      <ChevronRight className="h-3.5 w-3.5 shrink-0" />
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </main>

      {/* ── FOOTER ─────────────────────────────────────────────────── */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">

            {/* Org contact info */}
            <div className="space-y-1.5">
              <p className="font-semibold text-sm">{org.name}</p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                {(org.city || org.county) && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    {[org.city, org.county].filter(Boolean).join(", ")}
                  </span>
                )}
                {org.email && (
                  <a
                    href={`mailto:${org.email}`}
                    className="flex items-center gap-1.5 hover:text-foreground transition-colors"
                  >
                    <Mail className="h-3.5 w-3.5 shrink-0" />
                    {org.email}
                  </a>
                )}
                {org.phone && (
                  <a
                    href={`tel:${org.phone}`}
                    className="flex items-center gap-1.5 hover:text-foreground transition-colors"
                  >
                    <Phone className="h-3.5 w-3.5 shrink-0" />
                    {org.phone}
                  </a>
                )}
              </div>
            </div>

            {/* Powered by Cara */}
            <p className="text-sm text-muted-foreground">
              Powered by <span className="text-green-600 font-semibold">Cara</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
