import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import { SPECIES_LABELS, SPECIES_EMOJI, SIZE_LABELS } from "@/lib/constants"
import { formatDate } from "@/lib/utils"
import { Heart, MapPin, Mail, Phone, Calendar, Ruler, CheckCircle, XCircle, ArrowLeft } from "lucide-react"

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: { orgSlug: string; animalId: string }
}) {
  const animal = await prisma.animal.findFirst({
    where: { id: params.animalId, status: "AVAILABLE", publicProfile: true },
    select: { name: true, species: true, breed: true, description: true },
  })
  if (!animal) return { title: "Animal not found" }
  const label = SPECIES_LABELS[animal.species] ?? animal.species
  return {
    title: `${animal.name} — ${label}${animal.breed ? ` (${animal.breed})` : ""}`,
    description: animal.description ?? `Meet ${animal.name}, looking for a loving home.`,
    openGraph: {
      title: `${animal.name} is looking for a home!`,
      description: animal.description ?? `Meet ${animal.name}, a ${label.toLowerCase()}${animal.breed ? ` (${animal.breed})` : ""} looking for a loving home.`,
    },
  }
}

export default async function AdoptAnimalPage({
  params,
}: {
  params: { orgSlug: string; animalId: string }
}) {
  const org = await prisma.organization.findUnique({
    where: { slug: params.orgSlug },
    select: { id: true, name: true, email: true, phone: true, logo: true, city: true, county: true },
  })
  if (!org) notFound()

  const animal = await prisma.animal.findFirst({
    where: { id: params.animalId, organizationId: org.id, status: "AVAILABLE", publicProfile: true },
    include: { photos: { orderBy: { position: "asc" } } },
  })
  if (!animal) notFound()

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const a = animal!

  const mainPhoto = a.photos.find(p => p.isPrimary) ?? a.photos[0]
  const emoji = SPECIES_EMOJI[a.species] ?? "🐾"

  function ageLabel(): string | null {
    if (a.dobApprox) {
      const months = Math.floor(
        (Date.now() - new Date(a.dobApprox).getTime()) / (1000 * 60 * 60 * 24 * 30)
      )
      if (months < 12) return `${months} month${months !== 1 ? "s" : ""} old`
      const years = Math.floor(months / 12)
      const rem = months % 12
      return rem > 0 ? `${years} yr ${rem} mo` : `${years} year${years !== 1 ? "s" : ""} old`
    }
    if (a.ageYears !== null && a.ageYears !== undefined) {
      const m = a.ageMonths ?? 0
      return a.ageYears === 0
        ? `${m} month${m !== 1 ? "s" : ""} old`
        : m > 0
        ? `${a.ageYears} yr ${m} mo`
        : `${a.ageYears} year${a.ageYears !== 1 ? "s" : ""} old`
    }
    return null
  }

  const age = ageLabel()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-4">
          <Link
            href={`/portal/${params.orgSlug}`}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back to {org.name}</span>
            <span className="sm:hidden">Back</span>
          </Link>
          <div className="flex items-center gap-2 ml-auto">
            {org.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={org.logo} alt={org.name} className="h-7 w-7 rounded-full object-cover" />
            ) : (
              <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center text-white text-xs font-bold">
                {org.name[0]}
              </div>
            )}
            <span className="font-semibold text-sm">{org.name}</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Hero */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Photos */}
          <div className="space-y-3">
            <div className="w-full h-[220px] md:h-[260px] lg:h-[320px] rounded-2xl overflow-hidden bg-slate-100 shadow-sm">
              {mainPhoto ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={mainPhoto.url}
                  alt={a.name}
                  className="w-full h-full object-contain object-center block"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-slate-300">
                  <span className="text-8xl">{emoji}</span>
                  <span className="text-sm text-slate-400 font-medium">Photo coming soon</span>
                </div>
              )}
            </div>
            {/* Thumbnail strip */}
            {a.photos.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {a.photos.map(photo => (
                  <div
                    key={photo.id}
                    className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 ${
                      photo.id === mainPhoto?.id ? "border-primary" : "border-transparent"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={photo.url} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="space-y-5">
            <div>
              <div className="flex items-center gap-2 text-sm text-primary font-medium mb-1">
                <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                Available for adoption
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">{a.name}</h1>
              <p className="text-lg text-muted-foreground mt-1">
                {SPECIES_LABELS[a.species] ?? a.species}
                {a.breed ? ` · ${a.breed}` : ""}
                {a.colour ? ` · ${a.colour}` : ""}
              </p>
            </div>

            {/* Key stats */}
            <div className="grid grid-cols-2 gap-3">
              {age && (
                <div className="flex items-center gap-2.5 p-3 bg-secondary/50 rounded-xl">
                  <Calendar className="h-4 w-4 text-primary shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Age</p>
                    <p className="text-sm font-semibold">{age}{a.ageEstimated ? " (approx)" : ""}</p>
                  </div>
                </div>
              )}

              {a.sex !== "UNKNOWN" && (
                <div className="flex items-center gap-2.5 p-3 bg-secondary/50 rounded-xl">
                  <span className="text-lg shrink-0">{a.sex === "MALE" ? "♂" : "♀"}</span>
                  <div>
                    <p className="text-xs text-muted-foreground">Sex</p>
                    <p className="text-sm font-semibold capitalize">{a.sex.toLowerCase()}</p>
                  </div>
                </div>
              )}

              {a.size && (
                <div className="flex items-center gap-2.5 p-3 bg-secondary/50 rounded-xl">
                  <Ruler className="h-4 w-4 text-primary shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Size</p>
                    <p className="text-sm font-semibold">{SIZE_LABELS[a.size] ?? a.size}</p>
                  </div>
                </div>
              )}

              {a.intakeType && (
                <div className="flex items-center gap-2.5 p-3 bg-secondary/50 rounded-xl">
                  <MapPin className="h-4 w-4 text-primary shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Came to us</p>
                    <p className="text-sm font-semibold capitalize">
                      {a.intakeType.replace(/_/g, " ").toLowerCase()}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Health badges */}
            <div className="flex flex-wrap gap-2">
              <div className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full font-medium ${
                a.neutered ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-500"
              }`}>
                {a.neutered
                  ? <CheckCircle className="h-3.5 w-3.5" />
                  : <XCircle className="h-3.5 w-3.5" />}
                {a.neutered ? "Neutered / spayed" : "Not yet neutered"}
              </div>
              <div className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full font-medium ${
                a.vaccinated ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-500"
              }`}>
                {a.vaccinated
                  ? <CheckCircle className="h-3.5 w-3.5" />
                  : <XCircle className="h-3.5 w-3.5" />}
                {a.vaccinated ? "Vaccinated" : "Not yet vaccinated"}
              </div>
              {a.microchipNumber && (
                <div className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full font-medium bg-green-50 text-green-700">
                  <CheckCircle className="h-3.5 w-3.5" />
                  Microchipped
                </div>
              )}
            </div>

            {a.intakeDate && (
              <p className="text-xs text-muted-foreground">
                In our care since {formatDate(a.intakeDate)}
              </p>
            )}

            {/* CTA */}
            <Link
              href={`/portal/${params.orgSlug}/adopt/${a.id}/apply`}
              className="flex items-center justify-center gap-2 w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3.5 px-6 rounded-xl transition-colors text-base shadow-sm"
            >
              <Heart className="h-4 w-4" />
              Apply to adopt {a.name}
            </Link>
          </div>
        </div>

        {/* About / Description */}
        {a.description && (
          <section className="bg-white rounded-2xl border p-6">
            <h2 className="text-lg font-bold mb-3">About {a.name}</h2>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{a.description}</p>
          </section>
        )}

        {/* Personality / Traits */}
        {a.publicBio && a.publicBio !== a.description && (
          <section className="bg-white rounded-2xl border p-6">
            <h2 className="text-lg font-bold mb-3">Personality &amp; traits</h2>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{a.publicBio}</p>
          </section>
        )}

        {/* What happens next */}
        <section className="bg-secondary/40 rounded-2xl p-6">
          <h2 className="text-lg font-bold mb-4">What happens when I apply?</h2>
          <ol className="space-y-3">
            {[
              "Fill in the short application form — it takes about 5 minutes.",
              `${org.name} will review your application and be in touch within a few days.`,
              "If you're a good match, you'll be invited for a meet-and-greet or home visit.",
              `If all goes well, ${a.name} comes home with you!`,
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                <span className="shrink-0 w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
          <Link
            href={`/portal/${params.orgSlug}/adopt/${a.id}/apply`}
            className="mt-5 flex items-center justify-center gap-2 w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 px-6 rounded-xl transition-colors text-sm shadow-sm"
          >
            <Heart className="h-4 w-4" />
            Apply to adopt {a.name}
          </Link>
        </section>

        {/* Contact */}
        {(org.email || org.phone) && (
          <section className="border rounded-2xl p-6 text-center">
            <p className="text-sm font-medium mb-1">Questions about {a.name}?</p>
            <p className="text-sm text-muted-foreground mb-3">
              Get in touch with {org.name} directly.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              {org.email && (
                <a href={`mailto:${org.email}`} className="text-sm text-primary hover:underline font-medium">
                  {org.email}
                </a>
              )}
              {org.phone && (
                <a href={`tel:${org.phone}`} className="text-sm text-primary hover:underline font-medium">
                  {org.phone}
                </a>
              )}
            </div>
          </section>
        )}
      </main>

      <footer className="bg-white border-t mt-12">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <Link href={`/portal/${params.orgSlug}`} className="font-semibold text-sm hover:underline">
                {org.name}
              </Link>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                {(org.city || org.county) && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    {[org.city, org.county].filter(Boolean).join(", ")}
                  </span>
                )}
                {org.email && (
                  <a href={`mailto:${org.email}`} className="flex items-center gap-1.5 hover:text-foreground transition-colors">
                    <Mail className="h-3.5 w-3.5 shrink-0" />
                    {org.email}
                  </a>
                )}
                {org.phone && (
                  <a href={`tel:${org.phone}`} className="flex items-center gap-1.5 hover:text-foreground transition-colors">
                    <Phone className="h-3.5 w-3.5 shrink-0" />
                    {org.phone}
                  </a>
                )}
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <p className="text-sm text-muted-foreground">
                Powered by <span className="text-green-600 font-semibold">Cara</span>
              </p>
              <div className="flex items-center gap-4 flex-wrap justify-end">
                <a href="/legal/cara-privacy-policy.docx" download className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                  Privacy Policy
                </a>
                <a href="/legal/cara-terms-of-service.docx" download className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                  Terms of Service
                </a>
                <a href="/legal/cara-data-processing-agreement.docx" download className="text-xs text-muted-foreground hover:text-foreground transition-colors">
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
