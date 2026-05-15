import { prisma } from "@/lib/prisma"
import { notFound, redirect } from "next/navigation"
import { getSession, getOrgBySlug, getUserMembership } from "@/lib/data-access"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search } from "lucide-react"
import { SPECIES_LABELS, STATUS_LABELS, STATUS_COLORS } from "@/lib/constants"
import { AnimalStatus, Species } from "@prisma/client"

export const dynamic = 'force-dynamic'

export default async function AnimalsPage({
  params,
  searchParams,
}: {
  params: { orgSlug: string }
  searchParams: { search?: string; status?: string; species?: string }
}) {
  const [session, org] = await Promise.all([getSession(), getOrgBySlug(params.orgSlug)])
  if (!session?.user?.id) redirect("/login")
  if (!org) notFound()

  const where: any = { organizationId: org.id }
  if (searchParams.search) {
    where.OR = [
      { name: { contains: searchParams.search, mode: "insensitive" } },
      { breed: { contains: searchParams.search, mode: "insensitive" } },
      { microchipNumber: { contains: searchParams.search, mode: "insensitive" } },
    ]
  }
  if (searchParams.status && searchParams.status !== "all") where.status = searchParams.status as AnimalStatus
  if (searchParams.species && searchParams.species !== "all") where.species = searchParams.species as Species

  const [membership, animals] = await Promise.all([
    getUserMembership(session.user.id, org.id),
    prisma.animal.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 200,
      include: {
        photos: { take: 1, orderBy: { position: "asc" } },
        _count: { select: { adoptionApps: true } },
      },
    }).catch(() => []),
  ])
  if (!membership) notFound()

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Animals</h1>
          <p className="text-muted-foreground text-sm">{animals.length} total</p>
        </div>
        {/* Desktop button — hidden on mobile (FAB used instead) */}
        <Button asChild className="hidden sm:flex">
          <Link href={`/${params.orgSlug}/animals/new`}>
            <Plus className="h-4 w-4 mr-1.5" /> Add animal
          </Link>
        </Button>
      </div>

      {/* Filters — stack to 2 rows on mobile */}
      <form className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            name="search"
            placeholder="Search name, breed, microchip…"
            defaultValue={searchParams.search}
            className="pl-9 h-11 sm:h-10"
          />
        </div>
        <div className="flex gap-2">
          <Select name="species" defaultValue={searchParams.species ?? "all"}>
            <SelectTrigger className="flex-1 sm:w-36 h-11 sm:h-10">
              <SelectValue placeholder="Species" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All species</SelectItem>
              {Object.entries(SPECIES_LABELS).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select name="status" defaultValue={searchParams.status ?? "all"}>
            <SelectTrigger className="flex-1 sm:w-40 h-11 sm:h-10">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {Object.entries(STATUS_LABELS)
                .filter(([k]) => k !== "IN_FOSTER")
                .map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
            </SelectContent>
          </Select>
          <Button type="submit" variant="outline" className="shrink-0 h-11 sm:h-10">Filter</Button>
        </div>
      </form>

      {/* Grid */}
      {animals.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground mb-3">No animals found</p>
          <Button asChild>
            <Link href={`/${params.orgSlug}/animals/new`}>Add your first animal</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
          {animals.map(animal => (
            <Link key={animal.id} href={`/${params.orgSlug}/animals/${animal.id}`}
              className="group rounded-2xl border bg-card overflow-hidden hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200">
              <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden">
                {animal.photos[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={animal.photos[0].url} alt={animal.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl bg-gradient-to-br from-slate-50 to-slate-100">
                    {animal.species === "DOG" ? "🐕" : animal.species === "CAT" ? "🐈" : "🐾"}
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold shadow-sm ${STATUS_COLORS[animal.status] ?? "bg-slate-100 text-slate-600"}`}>
                    {STATUS_LABELS[animal.status] ?? animal.status}
                  </span>
                </div>
                {animal._count.adoptionApps > 0 && (
                  <div className="absolute bottom-2 left-2">
                    <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold bg-primary text-primary-foreground shadow-sm">
                      {animal._count.adoptionApps} app{animal._count.adoptionApps !== 1 ? "s" : ""}
                    </span>
                  </div>
                )}
              </div>
              <div className="p-3">
                <p className="font-bold text-sm truncate">{animal.name}</p>
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                  {SPECIES_LABELS[animal.species] ?? animal.species}{animal.breed ? ` · ${animal.breed}` : ""}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Mobile FAB — fixed above bottom nav bar */}
      <Link
        href={`/${params.orgSlug}/animals/new`}
        aria-label="Add animal"
        className="sm:hidden fixed bottom-[72px] right-4 z-30 h-14 w-14 rounded-full shadow-lg flex items-center justify-center active:scale-95 transition-transform"
        style={{ backgroundColor: "#1a3a2a" }}
      >
        <Plus className="h-6 w-6 text-white" />
      </Link>
    </div>
  )
}
