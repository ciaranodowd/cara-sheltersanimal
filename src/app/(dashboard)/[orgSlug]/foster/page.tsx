import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Home, PawPrint, ExternalLink, Calendar, User } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { SPECIES_LABELS } from "@/lib/constants"

export const dynamic = "force-dynamic"

export default async function FosterPage({ params }: { params: { orgSlug: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect("/login")

  const org = await prisma.organization.findUnique({ where: { slug: params.orgSlug }, select: { id: true, name: true } })
  if (!org) notFound()

  const membership = await prisma.userOrganization.findUnique({
    where: { userId_organizationId: { userId: session.user.id, organizationId: org.id } },
  })
  if (!membership) notFound()

  const [activeAssignments, endedAssignments] = await Promise.all([
    prisma.fosterAssignment.findMany({
      where: { organizationId: org.id, status: "ACTIVE" },
      include: {
        animal: {
          select: {
            id: true, name: true, species: true, breed: true,
            photos: { take: 1, orderBy: { position: "asc" }, select: { url: true } },
            status: true,
          },
        },
        foster: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
      },
      orderBy: { startDate: "desc" },
    }),
    prisma.fosterAssignment.findMany({
      where: { organizationId: org.id, status: "ENDED" },
      include: {
        animal: { select: { id: true, name: true, species: true } },
        foster: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { endDate: "desc" },
      take: 10,
    }),
  ])

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Home className="h-6 w-6 text-primary" /> Foster
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {activeAssignments.length} active placement{activeAssignments.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Active placements */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Active placements</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {activeAssignments.length === 0 ? (
            <div className="py-12 text-center">
              <Home className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">No active foster placements</p>
              <p className="text-xs text-muted-foreground mt-1">
                Assign an animal to a foster carer from the animal&apos;s profile page.
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {activeAssignments.map(a => {
                const photo = a.animal.photos[0]
                const daysSince = Math.floor((Date.now() - a.startDate.getTime()) / 86_400_000)
                return (
                  <div key={a.id} className="flex items-center gap-4 px-6 py-4">
                    {/* Animal thumbnail */}
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                      {photo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={photo.url} alt={a.animal.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl">
                          {a.animal.species === "DOG" ? "🐕" : a.animal.species === "CAT" ? "🐈" : "🐾"}
                        </div>
                      )}
                    </div>

                    {/* Animal info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link href={`/${params.orgSlug}/animals/${a.animal.id}`} className="font-semibold text-sm hover:underline">
                          {a.animal.name}
                        </Link>
                        <span className="text-xs text-muted-foreground">
                          {SPECIES_LABELS[a.animal.species] ?? a.animal.species}
                          {a.animal.breed ? ` · ${a.animal.breed}` : ""}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <User className="h-3 w-3" />
                          {a.foster.firstName} {a.foster.lastName}
                          {a.foster.email && <span className="hidden sm:inline">· {a.foster.email}</span>}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          Since {formatDate(a.startDate)}
                          <Badge variant="outline" className="ml-1 text-[10px] py-0">
                            {daysSince}d
                          </Badge>
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      {a.fosterPortalToken && (
                        <Link href={`/foster/${a.fosterPortalToken}`} target="_blank">
                          <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
                            <ExternalLink className="h-3 w-3" /> Portal
                          </Button>
                        </Link>
                      )}
                      <Link href={`/${params.orgSlug}/animals/${a.animal.id}`}>
                        <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
                          <PawPrint className="h-3 w-3" /> Animal
                        </Button>
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent ended placements */}
      {endedAssignments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base text-muted-foreground">Recent ended placements</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {endedAssignments.map(a => (
                <div key={a.id} className="flex items-center gap-4 px-6 py-3">
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium">{a.animal.name}</span>
                    <span className="text-xs text-muted-foreground ml-2">
                      with {a.foster.firstName} {a.foster.lastName}
                    </span>
                  </div>
                  {a.endDate && (
                    <span className="text-xs text-muted-foreground">Ended {formatDate(a.endDate)}</span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
