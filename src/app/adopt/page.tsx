import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Heart, MapPin } from "lucide-react"
import { SPECIES_LABELS, SPECIES_EMOJI } from "@/lib/constants"
import { Suspense } from "react"
import { AdoptFilters } from "./_components/adopt-filters"
import { PublicNav } from "@/components/layout/public-nav"
import type { Species, AnimalStatus } from "@prisma/client"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Adopt a Pet in Ireland | Dogs, Cats & More",
  description:
    "Find dogs, cats, rabbits and more available for adoption from rescue shelters across Ireland. Browse animals near you and apply today.",
  keywords: [
    "adopt a dog ireland",
    "adopt a cat ireland",
    "rescue animals ireland",
    "animal adoption ireland",
    "dogs for adoption ireland",
    "cats for adoption ireland",
    "rescue dog ireland",
    "shelter animals ireland",
  ],
  openGraph: {
    url: "https://carashelters.ie/adopt",
    title: "Adopt a Pet in Ireland | Dogs, Cats & More",
    description:
      "Find dogs, cats, rabbits and more available for adoption from rescue shelters across Ireland.",
  },
  alternates: { canonical: "https://carashelters.ie/adopt" },
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

function heroImageUrl(): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!base) return ""
  const filename = "publicportaldog.png"
  const encoded = filename.split("/").map(encodeURIComponent).join("/")
  return `${base}/storage/v1/object/public/marketinganimals/${encoded}`
}

export default async function AdoptPage({
  searchParams,
}: {
  searchParams: { species?: string; county?: string }
}) {
  const baseWhere = { status: "AVAILABLE" as AnimalStatus, publicProfile: true }

  const where: any = {
    ...baseWhere,
    ...(searchParams.species && { species: searchParams.species as Species }),
    ...(searchParams.county && {
      organization: { county: searchParams.county },
    }),
  }

  const [animals, totalCount] = await Promise.all([
    prisma.animal.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        photos: { take: 1, orderBy: { position: "asc" } },
        organization: { select: { name: true, slug: true, city: true, county: true } },
      },
    }),
    prisma.animal.count({ where: baseWhere }),
  ])

  const heroImg = heroImageUrl()

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Animals available for adoption in Ireland",
    description: "Dogs, cats, rabbits and more available for adoption from rescue shelters across Ireland.",
    url: "https://carashelters.ie/adopt",
    numberOfItems: animals.length,
    itemListElement: animals.slice(0, 50).map((animal, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: `${animal.name} — ${SPECIES_LABELS[animal.species] ?? animal.species}${animal.breed ? ` (${animal.breed})` : ""}`,
      url: `https://carashelters.ie/portal/${animal.organization.slug}/animals/${animal.id}`,
      description: `${animal.name} is a ${SPECIES_LABELS[animal.species]?.toLowerCase() ?? "animal"}${animal.breed ? ` (${animal.breed})` : ""} available for adoption from ${animal.organization.name}${animal.organization.county ? ` in ${animal.organization.county}` : ""}, Ireland.`,
    })),
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f7f5f0" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />

      <PublicNav navLinks={[{ label: "For shelters", href: "/" }]} />

      {/* Hero */}
      <section
        className="relative overflow-hidden"
        style={
          heroImg
            ? { backgroundImage: `url(${heroImg})`, backgroundSize: "cover", backgroundPosition: "center 30%" }
            : { backgroundColor: "#1a3a2a" }
        }
      >
        {heroImg && <div className="absolute inset-0 bg-black/60" />}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight mb-3">
            Find your perfect companion
          </h1>
          <p className="text-white/80 text-base sm:text-lg max-w-xl">
            Every one of these animals is waiting for a loving home. Could yours be the one?
          </p>
        </div>
      </section>

      {/* Filters + grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Suspense>
          <AdoptFilters total={totalCount} filtered={animals.length} />
        </Suspense>

        {animals.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm mt-6">
            <p className="text-5xl mb-4">🐾</p>
            <p className="font-bold text-lg mb-1 text-[#1a3a2a]">No animals found</p>
            <p className="text-sm text-gray-500">Try a different species or location.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            {animals.map(animal => {
              const photo = animal.photos[0]
              const emoji = SPECIES_EMOJI[animal.species] ?? "🐾"
              const age = ageLabel(animal.dobApprox)
              const sexLabel = animal.sex === "MALE" ? "Male" : animal.sex === "FEMALE" ? "Female" : null
              const city = animal.organization.city
              const county = animal.organization.county
              const location = city && county && city === county
                ? county
                : [city, county].filter(Boolean).join(", ")

              return (
                <div
                  key={animal.id}
                  className="group rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 bg-white flex flex-col"
                >
                  {/* Photo — links to animal profile */}
                  <Link
                    href={`/portal/${animal.organization.slug}/animals/${animal.id}`}
                    className="block relative overflow-hidden bg-gradient-to-br from-stone-100 to-stone-200 aspect-[3/4]"
                  >
                    {photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={photo.url}
                        alt={animal.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-6xl">
                        {emoji}
                      </div>
                    )}

                    {/* Age / sex badges */}
                    {(age || sexLabel) && (
                      <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
                        {age && (
                          <span className="bg-black/55 backdrop-blur-sm text-white text-[10px] font-medium px-2 py-0.5 rounded-full">
                            {age}
                          </span>
                        )}
                        {sexLabel && (
                          <span className="bg-black/55 backdrop-blur-sm text-white text-[10px] font-medium px-2 py-0.5 rounded-full">
                            {sexLabel}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Gradient + name overlay */}
                    <div className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-3">
                      <p className="text-white font-bold text-base leading-tight drop-shadow">
                        {animal.name}
                      </p>
                      <p className="text-white/70 text-xs mt-0.5">
                        {animal.breed ?? SPECIES_LABELS[animal.species]}
                      </p>
                    </div>
                  </Link>

                  {/* Card footer */}
                  <div className="p-3 flex flex-col gap-1.5 flex-1">
                    {location && (
                      <div className="flex items-center gap-1 text-gray-400 text-xs">
                        <MapPin className="w-3 h-3 shrink-0" />
                        <span className="truncate">{location}</span>
                      </div>
                    )}
                    <p className="text-xs text-gray-500 truncate">{animal.organization.name}</p>

                    <Link
                      href={`/portal/${animal.organization.slug}/adopt/${animal.id}/apply`}
                      className="mt-auto flex items-center justify-center gap-1.5 w-full bg-[#1a3a2a] hover:bg-[#2d5a3d] text-white text-xs font-semibold py-2 px-3 rounded-lg transition-colors"
                    >
                      <Heart className="w-3.5 h-3.5 shrink-0" />
                      Apply to adopt
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      <footer className="text-center py-8 text-xs text-gray-400">
        Powered by <span className="font-semibold text-[#1a3a2a]">Cara</span>
      </footer>
    </div>
  )
}
