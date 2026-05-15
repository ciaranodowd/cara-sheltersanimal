import { prisma } from "@/lib/prisma"
import { notFound, redirect } from "next/navigation"
import { getSession, getOrgBySlug, getUserMembership } from "@/lib/data-access"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus } from "lucide-react"
import { formatDate } from "@/lib/utils"

export const dynamic = 'force-dynamic'

export default async function PeoplePage({
  params,
  searchParams,
}: {
  params: { orgSlug: string }
  searchParams: { tab?: string }
}) {
  const [session, org] = await Promise.all([getSession(), getOrgBySlug(params.orgSlug)])
  if (!session?.user?.id) redirect("/login")
  if (!org) notFound()

  let adopters: any[] = [], volunteers: any[] = [], donors: any[] = []
  const [membership, peopleResult] = await Promise.all([
    getUserMembership(session.user.id, org.id),
    Promise.all([
      prisma.adopter.findMany({ where: { organizationId: org.id }, orderBy: { createdAt: "desc" }, take: 50 }),
      prisma.volunteer.findMany({ where: { organizationId: org.id }, orderBy: { createdAt: "desc" }, take: 50 }),
      prisma.donor.findMany({ where: { organizationId: org.id }, orderBy: { createdAt: "desc" }, take: 50 }),
    ]).catch(() => null),
  ])
  if (!membership) notFound()
  if (peopleResult) [adopters, volunteers, donors] = peopleResult

  const tab = searchParams.tab ?? "adopters"

  const personRow = (person: { id: string; firstName: string; lastName: string; email: string; createdAt: Date }, type: string) => (
    <Link key={person.id} href={`/${params.orgSlug}/people/${type}/${person.id}`}
      className="flex items-center justify-between p-4 rounded-lg hover:bg-slate-50 active:bg-slate-100 transition-colors border-b last:border-0 min-h-[64px]">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm shrink-0">
          {person.firstName[0]}{person.lastName[0]}
        </div>
        <div className="min-w-0">
          <p className="font-medium text-sm truncate">{person.firstName} {person.lastName}</p>
          <p className="text-xs text-muted-foreground truncate">{person.email}</p>
        </div>
      </div>
      <p className="text-xs text-muted-foreground shrink-0 hidden sm:block ml-3">{formatDate(person.createdAt)}</p>
    </Link>
  )

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">People</h1>
        <Button asChild className="h-10 sm:h-9">
          <Link href={`/${params.orgSlug}/people/new?type=${tab.slice(0, -1)}`}>
            <Plus className="h-4 w-4 mr-1.5" /> Add person
          </Link>
        </Button>
      </div>

      <Tabs defaultValue={tab}>
        {/* Full-width tabs on mobile, auto-width on sm+ */}
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="adopters" className="flex-1 sm:flex-none">
            Adopters <Badge variant="secondary" className="ml-1.5 text-xs">{adopters.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="volunteers" className="flex-1 sm:flex-none">
            Volunteers <Badge variant="secondary" className="ml-1.5 text-xs">{volunteers.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="donors" className="flex-1 sm:flex-none">
            Donors <Badge variant="secondary" className="ml-1.5 text-xs">{donors.length}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="adopters" className="mt-4">
          <div className="rounded-xl border bg-card">
            {adopters.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-10">No adopters yet</p>
            ) : adopters.map(p => personRow(p, "adopters"))}
          </div>
        </TabsContent>

        <TabsContent value="volunteers" className="mt-4">
          <div className="rounded-xl border bg-card">
            {volunteers.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-10">No volunteers yet</p>
            ) : volunteers.map(p => (
              <Link key={p.id} href={`/${params.orgSlug}/people/volunteers/${p.id}`}
                className="flex items-center justify-between p-4 rounded-lg hover:bg-slate-50 active:bg-slate-100 transition-colors border-b last:border-0 min-h-[64px]">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm shrink-0">
                    {p.firstName[0]}{p.lastName[0]}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{p.firstName} {p.lastName}</p>
                    {/* Show hours inline on mobile; date visible on sm+ */}
                    <p className="text-xs text-muted-foreground truncate">
                      {p.email}
                      <span className="sm:hidden"> · {Number(p.hoursLogged)}h</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-3">
                  <p className="text-xs text-muted-foreground hidden sm:block">{Number(p.hoursLogged)}h logged</p>
                  <p className="text-xs text-muted-foreground hidden sm:block">{formatDate(p.createdAt)}</p>
                </div>
              </Link>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="donors" className="mt-4">
          <div className="rounded-xl border bg-card">
            {donors.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-10">No donors yet</p>
            ) : donors.map(p => personRow(p, "donors"))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
