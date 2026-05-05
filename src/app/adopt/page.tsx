import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { PawPrint, Heart, MapPin } from "lucide-react"
import { SPECIES_LABELS, SPECIES_EMOJI } from "@/lib/constants"
import { Suspense } from "react"
import { AdoptFilters } from "./_components/adopt-filters"
import type { Species } from "@prisma/client"

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

export default async function AdoptPage({
  searchParams,
}: {
  searchParams: { species?: string; county?: string }
}) {
  const where: any = {
    status: "AVAILABLE",
    publicProfile: true,
    ...(searchParams.species && { species: searchParams.species as Species }),
    ...(searchParams.county && {
      organization: { county: searchParams.county },
    }),
  }

  const animals = await prisma.animal.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      photos: { take: 1, orderBy: { position: "asc" } },
      organization: { select: { name: true, slug: true, city: true, county: true } },
    },
  })

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f7f5f0" }}>
      {/* Header */}
      <header className="bg-[#1a3a2a] pt-10 pb-10 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <Link href="/" className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-full bg-[#4ade80]/20 flex items-center justify-center">
              <PawPrint className="w-4 h-4 text-[#4ade80]" />
            </div>
            <span className="text-white font-semibold">Cara</span>
          </Link>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight mb-3">
            Find your perfect companion
          </h1>
          <p className="text-[#a7c4b5] text-base sm:text-lg max-w-xl">
            Every one of these animals is waiting for a loving home. Could yours be the one?
          </p>
        </div>
      </header>

      {/* Filters + grid */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <Suspense>
          <AdoptFilters total={animals.length} />
        </Suspense>

        {animals.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm mt-6">
            <p className="text-5xl mb-4">🐾</p>
            <p className="font-bold text-lg mb-1 text-[#1a3a2a]">No animals found</p>
            <p className="text-sm text-gray-500">Try a different species or location.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 mt-6">
            {animals.map(animal => {
              const photo = animal.photos[0]
              const emoji = SPECIES_EMOJI[animal.species] ?? "🐾"
              const age = ageLabel(animal.dobApprox)
              const sexLabel = animal.sex === "MALE" ? "Male" : animal.sex === "FEMALE" ? "Female" : null
              const location = [animal.organization.city, animal.organization.county].filter(Boolean).join(", ")

              return (
                <Link
                  key={animal.id}
                  href={`/portal/${animal.organization.slug}/animals/${animal.id}`}
                  className="group relative rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-white"
                >
                  {/* Photo */}
                  <div className="aspect-[3/4] relative overflow-hidden bg-gradient-to-br from-stone-100 to-stone-200">
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

                    {/* Gradient + info overlay */}
                    <div className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-3">
                      <p className="text-white font-bold text-base leading-tight drop-shadow">
                        {animal.name}
                      </p>
                      <p className="text-white/70 text-xs mt-0.5">
                        {animal.breed ?? SPECIES_LABELS[animal.species]}
                      </p>
                    </div>
                  </div>

                  {/* Card footer */}
                  <div className="p-3 space-y-2">
                    {location && (
                      <div className="flex items-center gap-1 text-gray-400 text-xs">
                        <MapPin className="w-3 h-3 shrink-0" />
                        <span className="truncate">{location}</span>
                      </div>
                    )}
                    <p className="text-xs text-gray-500 truncate">{animal.organization.name}</p>
                    <div className="flex items-center gap-1.5 pt-0.5 text-[#1a3a2a] text-xs font-semibold group-hover:text-[#2d5a3d] transition-colors">
                      <Heart className="w-3.5 h-3.5 shrink-0" />
                      Apply to adopt
                    </div>
                  </div>
                </Link>
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
