import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AlertTriangle, Phone, Calendar, Info,
  Stethoscope, FileText, PawPrint
} from "lucide-react"
import { formatDate } from "@/lib/utils"
import { SPECIES_LABELS, SIZE_LABELS } from "@/lib/constants"
import { UpdatesPanel } from "./_components/updates-panel"

export const dynamic = "force-dynamic"

function formatAge(animal: { dobApprox: Date | null; ageYears: number | null; ageMonths: number | null }): string {
  if (animal.dobApprox) {
    const months = Math.floor((Date.now() - new Date(animal.dobApprox).getTime()) / (1000 * 60 * 60 * 24 * 30.44))
    if (months < 2) return "< 2 months"
    if (months < 12) return `${months} months`
    const years = Math.floor(months / 12)
    const rem = months % 12
    return rem > 0 ? `${years}yr ${rem}mo` : `${years} year${years !== 1 ? "s" : ""}`
  }
  if (animal.ageYears) return `${animal.ageYears} yr${animal.ageYears !== 1 ? "s" : ""}`
  if (animal.ageMonths) return `${animal.ageMonths} months`
  return "Unknown age"
}

export default async function FosterPortalPage({ params }: { params: { token: string } }) {
  const assignment = await prisma.fosterAssignment.findUnique({
    where: { fosterPortalToken: params.token },
    include: {
      foster: {
        select: { id: true, firstName: true, lastName: true, email: true, phone: true },
      },
      animal: {
        include: {
          photos: { orderBy: { position: "asc" } },
          medicalRecords: { orderBy: { date: "desc" }, take: 20 },
          adoptionApps: {
            where: { status: { notIn: ["COMPLETED", "REJECTED", "WITHDRAWN"] } },
            select: { id: true, status: true },
          },
        },
      },
      organization: {
        select: {
          id: true, name: true, email: true, phone: true,
          vetName: true, vetPhone: true, coordinatorPhone: true,
        },
      },
      fosterUpdates: { orderBy: { createdAt: "desc" } },
    },
  })

  if (!assignment) notFound()
  if (assignment.status === "ENDED") {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: "#f8faf8" }}>
        <div className="text-center max-w-sm">
          <PawPrint className="h-12 w-12 mx-auto mb-4 text-slate-300" />
          <h1 className="text-xl font-bold mb-2">Foster placement ended</h1>
          <p className="text-muted-foreground text-sm">
            This foster placement has been closed. Thank you for everything you did for {assignment.animal.name}!
          </p>
        </div>
      </div>
    )
  }

  const { animal, foster, organization: org, fosterUpdates } = assignment
  const mainPhoto = animal.photos[0]
  const hasPendingApp = animal.adoptionApps.length > 0

  const statusColors: Record<string, string> = {
    AVAILABLE: "bg-green-100 text-green-800",
    FOSTERED: "bg-blue-100 text-blue-800",
    ADOPTION_PENDING: "bg-orange-100 text-orange-800",
    ADOPTED: "bg-emerald-100 text-emerald-800",
    INTAKE: "bg-amber-100 text-amber-800",
    ON_HOLD: "bg-yellow-100 text-yellow-800",
    MEDICAL_HOLD: "bg-red-100 text-red-800",
  }

  const fosterName = `${foster.firstName} ${foster.lastName}`

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f0f7f0" }}>
      {/* Navbar */}
      <header style={{ backgroundColor: "#1a3a2a" }} className="sticky top-0 z-20 shadow-md">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div
              className="w-7 h-7 rounded-md flex items-center justify-center font-bold text-sm shrink-0"
              style={{ backgroundColor: "#4ade80", color: "#1a3a2a" }}
            >
              C
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-bold text-white text-base leading-none">cara</span>
              <span className="text-white/50 text-xs hidden sm:inline">/ Foster portal</span>
            </div>
          </div>
          <div className="text-right min-w-0">
            <p className="text-white text-sm font-medium truncate">{fosterName}</p>
            <p className="text-white/50 text-xs truncate hidden sm:block">{foster.email}</p>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-5">

        {/* Welcome */}
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#1a3a2a" }}>
            Hi {foster.firstName} 👋
          </h1>
          <p className="text-sm text-slate-600 mt-0.5">
            Foster portal — {org.name}
          </p>
        </div>

        {/* Pending adoption banner */}
        {hasPendingApp && (
          <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
            <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-800">Adoption application in progress</p>
              <p className="text-xs text-amber-700 mt-0.5">
                {animal.name} has a pending adoption application. The shelter team will be in touch with next steps.
              </p>
            </div>
          </div>
        )}

        {/* Animal card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          {mainPhoto && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={mainPhoto.url}
              alt={animal.name}
              className="w-full h-52 sm:h-64 object-cover"
            />
          )}
          {!mainPhoto && (
            <div className="w-full h-36 flex items-center justify-center text-6xl"
              style={{ backgroundColor: "#e8f5e9" }}>
              {animal.species === "DOG" ? "🐕" : animal.species === "CAT" ? "🐈" : animal.species === "RABBIT" ? "🐇" : "🐾"}
            </div>
          )}

          <div className="p-4 sm:p-5">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div>
                <h2 className="text-xl font-bold">{animal.name}</h2>
                <p className="text-sm text-slate-500">
                  {SPECIES_LABELS[animal.species] ?? animal.species}
                  {animal.breed ? ` · ${animal.breed}` : ""}
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColors[animal.status] ?? "bg-slate-100 text-slate-600"}`}>
                  {animal.status.replace(/_/g, " ")}
                </span>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-1.5 text-sm text-slate-600">
              <Calendar className="h-3.5 w-3.5 shrink-0" style={{ color: "#1a3a2a" }} />
              <span>In foster since <strong>{formatDate(assignment.startDate)}</strong></span>
            </div>

            {/* Quick stats */}
            <div className="mt-4 grid grid-cols-3 gap-2">
              {[
                ["Age", formatAge(animal as any)],
                ["Sex", animal.sex === "MALE" ? "Male" : animal.sex === "FEMALE" ? "Female" : "Unknown"],
                ["Size", animal.size ? (SIZE_LABELS[animal.size] ?? animal.size) : "—"],
              ].map(([label, value]) => (
                <div key={label} className="bg-slate-50 rounded-lg px-3 py-2 text-center">
                  <p className="text-[10px] uppercase tracking-wide text-slate-400 font-medium">{label}</p>
                  <p className="text-sm font-semibold mt-0.5">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="updates">
          <TabsList className="w-full grid grid-cols-4 h-10">
            <TabsTrigger value="updates" className="text-xs sm:text-sm">Updates</TabsTrigger>
            <TabsTrigger value="info" className="text-xs sm:text-sm">Animal info</TabsTrigger>
            <TabsTrigger value="medical" className="text-xs sm:text-sm">Medical</TabsTrigger>
            <TabsTrigger value="documents" className="text-xs sm:text-sm">Documents</TabsTrigger>
          </TabsList>

          {/* Updates */}
          <TabsContent value="updates" className="mt-4">
            <UpdatesPanel
              token={params.token}
              initialUpdates={fosterUpdates.map(u => ({
                ...u,
                createdAt: u.createdAt.toISOString(),
              }))}
              fosterName={fosterName}
              shelterName={org.name}
            />
          </TabsContent>

          {/* Animal info */}
          <TabsContent value="info" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Info className="h-4 w-4" style={{ color: "#1a3a2a" }} /> About {animal.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                  {[
                    ["Species", SPECIES_LABELS[animal.species] ?? animal.species],
                    ["Breed", animal.breed ?? "—"],
                    ["Sex", animal.sex === "MALE" ? "Male" : animal.sex === "FEMALE" ? "Female" : "Unknown"],
                    ["Age", formatAge(animal as any)],
                    ["Size", animal.size ? (SIZE_LABELS[animal.size] ?? animal.size) : "—"],
                    ["Neutered", animal.neutered ? "Yes" : "No"],
                    ["Vaccinated", animal.vaccinated ? "Yes" : "No"],
                    ["Microchip", animal.microchipNumber ?? "—"],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <dt className="text-xs text-slate-500 font-medium uppercase tracking-wide">{label}</dt>
                      <dd className="font-semibold mt-0.5">{value}</dd>
                    </div>
                  ))}
                </dl>

                {animal.description && (
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500 mb-1.5">About</p>
                    <p className="text-sm leading-relaxed text-slate-700">{animal.description}</p>
                  </div>
                )}

                {(assignment.notes) && (
                  <div className="rounded-lg border border-amber-100 bg-amber-50 p-3">
                    <p className="text-xs font-medium uppercase tracking-wide text-amber-700 mb-1">Handover notes</p>
                    <p className="text-sm text-amber-800 leading-relaxed">{assignment.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Medical */}
          <TabsContent value="medical" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Stethoscope className="h-4 w-4" style={{ color: "#1a3a2a" }} /> Medical records
                </CardTitle>
              </CardHeader>
              <CardContent>
                {animal.medicalRecords.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">No medical records</p>
                ) : (
                  <div className="divide-y">
                    {animal.medicalRecords.map(r => (
                      <div key={r.id} className="py-3">
                        <div className="flex items-start justify-between gap-2 flex-wrap">
                          <div>
                            <p className="font-medium text-sm">{r.type.replace(/_/g, " ")}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {formatDate(r.date)}
                              {r.vetName ? ` · ${r.vetName}` : ""}
                              {r.vetClinic ? ` · ${r.vetClinic}` : ""}
                            </p>
                          </div>
                          {r.nextDueDate && (
                            <Badge variant="outline" className="text-xs">
                              Next: {formatDate(r.nextDueDate)}
                            </Badge>
                          )}
                        </div>
                        {r.notes && <p className="text-xs text-slate-500 mt-1">{r.notes}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documents */}
          <TabsContent value="documents" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-4 w-4" style={{ color: "#1a3a2a" }} /> Documents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground py-6 text-center">
                  Documents shared by the shelter will appear here.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Emergency contacts */}
        <Card className="border-slate-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2" style={{ color: "#1a3a2a" }}>
              <Phone className="h-4 w-4" /> Emergency contacts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Shelter — {org.name}</p>
                <p className="text-sm font-medium mt-0.5">
                  {org.coordinatorPhone ?? org.phone ?? "—"}
                </p>
                {org.email && <p className="text-xs text-slate-500">{org.email}</p>}
              </div>
              {(org.coordinatorPhone ?? org.phone) && (
                <a href={`tel:${(org.coordinatorPhone ?? org.phone)?.replace(/\s/g, "")}`}>
                  <button className="h-8 px-3 rounded-lg text-xs font-medium text-white" style={{ backgroundColor: "#1a3a2a" }}>
                    Call
                  </button>
                </a>
              )}
            </div>

            {(org.vetName || org.vetPhone) && (
              <>
                <hr className="border-slate-100" />
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Vet{org.vetName ? ` — ${org.vetName}` : ""}
                    </p>
                    <p className="text-sm font-medium mt-0.5">{org.vetPhone ?? "—"}</p>
                  </div>
                  {org.vetPhone && (
                    <a href={`tel:${org.vetPhone.replace(/\s/g, "")}`}>
                      <button className="h-8 px-3 rounded-lg text-xs font-medium text-white" style={{ backgroundColor: "#1a3a2a" }}>
                        Call
                      </button>
                    </a>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-xs text-slate-400 pb-4">
          Powered by <span className="font-semibold" style={{ color: "#1a3a2a" }}>Cara</span>
        </p>
      </main>
    </div>
  )
}
