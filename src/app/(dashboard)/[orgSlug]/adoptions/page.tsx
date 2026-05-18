import { prisma } from "@/lib/prisma"
import { notFound, redirect } from "next/navigation"
import { getSession, getOrgBySlug, getUserMembership } from "@/lib/data-access"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/utils"
import { MarkApplicationsRead } from "./_components/mark-read"

const PIPELINE_STAGES = [
  {
    key: "PENDING",
    label: "Pending",
    accentBar: "bg-amber-400",
    badge: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  },
  {
    key: "REVIEWING",
    label: "Reviewing",
    accentBar: "bg-sky-400",
    badge: "bg-sky-50 text-sky-700 ring-1 ring-sky-200",
  },
  {
    key: "HOME_CHECK",
    label: "Home check",
    accentBar: "bg-violet-400",
    badge: "bg-violet-50 text-violet-700 ring-1 ring-violet-200",
  },
  {
    key: "APPROVED",
    label: "Approved",
    accentBar: "bg-emerald-400",
    badge: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  },
  {
    key: "CONTRACT_SENT",
    label: "Contract sent",
    accentBar: "bg-teal-400",
    badge: "bg-teal-50 text-teal-700 ring-1 ring-teal-200",
  },
  {
    key: "COMPLETED",
    label: "Adopted",
    accentBar: "bg-slate-400",
    badge: "bg-slate-50 text-slate-600 ring-1 ring-slate-200",
  },
]

export const dynamic = "force-dynamic"

export default async function AdoptionsPage({ params }: { params: { orgSlug: string } }) {
  const [session, org] = await Promise.all([getSession(), getOrgBySlug(params.orgSlug)])
  if (!session?.user?.id) redirect("/login")
  if (!org) notFound()

  const [membership, applications] = await Promise.all([
    getUserMembership(session.user.id, org.id),
    prisma.adoptionApplication.findMany({
      where: {
        organizationId: org.id,
        status: { notIn: ["REJECTED", "WITHDRAWN", "UNDER_REVIEW", "HOME_CHECK_SCHEDULED", "HOME_CHECK_DONE"] },
      },
      orderBy: { updatedAt: "desc" },
      include: {
        animal: { select: { name: true, species: true } },
      },
    }).catch(() => []),
  ])
  if (!membership) notFound()

  const byStatus = Object.fromEntries(
    PIPELINE_STAGES.map(s => [s.key, applications.filter(a => a.status === s.key)])
  )

  const speciesEmoji = (s: string) => s === "DOG" ? "🐕" : s === "CAT" ? "🐈" : "🐾"
  const typeLabel = (t: string | null) => t === "FOSTER"
    ? { text: "Foster", cls: "bg-blue-50 text-blue-600 ring-1 ring-blue-100" }
    : { text: "Adopt",  cls: "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100" }

  return (
    <div className="px-4 sm:px-6 py-6 max-w-[1400px] mx-auto space-y-6">
      <MarkApplicationsRead orgSlug={params.orgSlug} />
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Adoptions</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {applications.length} active application{applications.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          asChild
          className="shrink-0 text-muted-foreground hover:text-foreground"
        >
          <Link href={`/${params.orgSlug}/adoptions/rejected`}>Rejected applications</Link>
        </Button>
      </div>

      {/* Pipeline grid — responsive, no horizontal scrolling */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {PIPELINE_STAGES.map(stage => {
          const cards = byStatus[stage.key] ?? []
          return (
            <div key={stage.key} className="flex flex-col">
              <div className="h-full rounded-xl border border-gray-200 bg-gray-50 shadow-sm overflow-hidden flex flex-col min-h-[180px]">
                {/* Colour accent bar */}
                <div className={`h-[3px] w-full ${stage.accentBar}`} />

                {/* Column header */}
                <div className="flex items-center justify-between px-3 py-2.5">
                  <h3 className="text-sm font-semibold text-gray-700">{stage.label}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium tabular-nums ${stage.badge}`}>
                    {cards.length}
                  </span>
                </div>

                {/* Cards area */}
                <div className="px-2 pb-2 flex flex-col gap-2 flex-1">
                  {cards.length === 0 ? (
                    <div className="flex flex-col items-center justify-center flex-1 text-center py-6 px-3">
                      <div className="w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center mb-2 shadow-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-gray-200" />
                      </div>
                      <p className="text-xs font-medium text-gray-400">No applications</p>
                    </div>
                  ) : (
                    cards.map(app => {
                      const type = typeLabel(app.applicationType)
                      return (
                        <Link
                          key={app.id}
                          href={`/${params.orgSlug}/adoptions/${app.id}`}
                          className="block"
                        >
                          <div className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 cursor-pointer">
                            <p className="font-semibold text-sm text-gray-900 leading-snug">
                              {app.applicantName}
                            </p>
                            <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                              <span aria-hidden>{speciesEmoji(app.animal.species)}</span>
                              <span>{app.animal.name}</span>
                            </p>
                            <div className="flex items-center justify-between mt-2">
                              <p className="text-[11px] text-gray-400">{formatDate(app.createdAt)}</p>
                              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${type.cls}`}>
                                {type.text}
                              </span>
                            </div>
                          </div>
                        </Link>
                      )
                    })
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
