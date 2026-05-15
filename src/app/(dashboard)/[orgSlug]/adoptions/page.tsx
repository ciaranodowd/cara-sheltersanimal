import { prisma } from "@/lib/prisma"
import { notFound, redirect } from "next/navigation"
import { getSession, getOrgBySlug, getUserMembership } from "@/lib/data-access"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/utils"

const PIPELINE_STAGES = [
  { key: "PENDING",       label: "Pending",       color: "bg-yellow-50 border-yellow-200", badge: "bg-yellow-100 text-yellow-700" },
  { key: "REVIEWING",     label: "Reviewing",     color: "bg-blue-50 border-blue-200",     badge: "bg-blue-100 text-blue-700" },
  { key: "HOME_CHECK",    label: "Home check",    color: "bg-purple-50 border-purple-200", badge: "bg-purple-100 text-purple-700" },
  { key: "APPROVED",      label: "Approved",      color: "bg-green-50 border-green-200",   badge: "bg-green-100 text-green-700" },
  { key: "CONTRACT_SENT", label: "Contract sent", color: "bg-teal-50 border-teal-200",     badge: "bg-teal-100 text-teal-700" },
  { key: "COMPLETED",     label: "Adopted",       color: "bg-slate-50 border-slate-200",   badge: "bg-slate-100 text-slate-700" },
]

export const dynamic = 'force-dynamic'

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
    ? { text: "Foster", cls: "bg-blue-100 text-blue-700" }
    : { text: "Adopt",  cls: "bg-green-100 text-green-700" }

  return (
    <div className="p-4 sm:p-6 max-w-full space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Adoptions</h1>
          <p className="text-muted-foreground text-sm">{applications.length} active applications</p>
        </div>
        <Button variant="outline" asChild>
          <Link href={`/${params.orgSlug}/adoptions/rejected`}>Rejected</Link>
        </Button>
      </div>

      {/* ── Mobile: vertical grouped list ────────────────────────────── */}
      <div className="md:hidden space-y-6">
        {applications.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-10">No active applications</p>
        )}
        {PIPELINE_STAGES.map(stage => {
          const stageApps = byStatus[stage.key] ?? []
          if (stageApps.length === 0) return null
          const tl = typeLabel
          return (
            <div key={stage.key}>
              <div className="flex items-center gap-2 mb-2 px-1">
                <h3 className="font-semibold text-sm text-slate-700">{stage.label}</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${stage.badge}`}>
                  {stageApps.length}
                </span>
              </div>
              <div className="space-y-2">
                {stageApps.map(app => {
                  const type = tl(app.applicationType)
                  return (
                    <Link key={app.id} href={`/${params.orgSlug}/adoptions/${app.id}`}>
                      <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm active:bg-slate-50 transition-colors">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-semibold text-sm truncate">{app.applicantName}</p>
                          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 ${type.cls}`}>
                            {type.text}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {speciesEmoji(app.animal.species)} {app.animal.name}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">{formatDate(app.createdAt)}</p>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Desktop: horizontal kanban ────────────────────────────────── */}
      <div className="hidden md:flex gap-4 overflow-x-auto pb-4">
        {PIPELINE_STAGES.map(stage => (
          <div key={stage.key} className="shrink-0 w-64">
            <div className={`rounded-xl border-2 ${stage.color} p-3`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm">{stage.label}</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${stage.badge}`}>
                  {byStatus[stage.key]?.length ?? 0}
                </span>
              </div>
              <div className="space-y-2">
                {(byStatus[stage.key] ?? []).map(app => {
                  const type = typeLabel(app.applicationType)
                  return (
                    <Link key={app.id} href={`/${params.orgSlug}/adoptions/${app.id}`}>
                      <div className="bg-white rounded-lg p-3 shadow-sm border hover:shadow-md transition-shadow cursor-pointer">
                        <p className="font-medium text-sm">{app.applicantName}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {speciesEmoji(app.animal.species)} {app.animal.name}
                        </p>
                        <div className="flex items-center justify-between mt-1.5">
                          <p className="text-xs text-muted-foreground">{formatDate(app.createdAt)}</p>
                          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${type.cls}`}>
                            {type.text}
                          </span>
                        </div>
                      </div>
                    </Link>
                  )
                })}
                {(byStatus[stage.key] ?? []).length === 0 && (
                  <div className="text-xs text-muted-foreground text-center py-4 border-2 border-dashed rounded-lg">
                    Empty
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
