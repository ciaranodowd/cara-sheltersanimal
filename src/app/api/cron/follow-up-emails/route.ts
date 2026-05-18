// Daily cron job that sends post-adoption follow-up emails at 3 days, 2 weeks, and 3 months.
//
// Scheduling: configured in vercel.json — runs at 08:00 UTC every day.
//
// Authentication: Vercel sends "Authorization: Bearer <CRON_SECRET>" automatically.
// For local testing: GET /api/cron/follow-up-emails?secret=<CRON_SECRET>
//
// Idempotency: each email is guarded by a unique key in SentEmailLog so retries and
// overlapping cron runs never double-send.

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendAdoptionFollowUpEmail } from "@/lib/email-workflows"

export const dynamic = "force-dynamic"

const MS_PER_DAY = 24 * 60 * 60 * 1000

const STAGES = [
  { type: "3days"   as const, days: 3  },
  { type: "2weeks"  as const, days: 14 },
  { type: "3months" as const, days: 90 },
]

export async function GET(req: NextRequest) {
  const authHeader  = req.headers.get("authorization")
  const querySecret = req.nextUrl.searchParams.get("secret")
  const expected    = process.env.CRON_SECRET

  if (!expected || (authHeader !== `Bearer ${expected}` && querySecret !== expected)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const now = new Date()
  // Only fetch applications old enough for the earliest stage (3 days)
  const earliestCutoff = new Date(now.getTime() - 3 * MS_PER_DAY)

  const applications = await prisma.adoptionApplication.findMany({
    where: {
      status: "COMPLETED",
      completedAt: { not: null, lte: earliestCutoff },
      // Foster applications are not included — follow-ups are adoption-only
      OR: [{ applicationType: "ADOPT" }, { applicationType: null }],
    },
    select: {
      id:             true,
      applicantEmail: true,
      applicantName:  true,
      completedAt:    true,
      animal:         { select: { name: true } },
      organization:   { select: { name: true, email: true } },
    },
  })

  let sent    = 0
  let skipped = 0
  const errors: string[] = []

  for (const app of applications) {
    if (!app.completedAt) continue

    for (const stage of STAGES) {
      const stageCutoff = new Date(now.getTime() - stage.days * MS_PER_DAY)
      if (app.completedAt > stageCutoff) continue  // not yet time for this stage

      const key        = `followup:${app.id}:${stage.type}`
      const alreadySent = await prisma.sentEmailLog.findUnique({ where: { key } })
      if (alreadySent) { skipped++; continue }

      try {
        await sendAdoptionFollowUpEmail({
          to:           app.applicantEmail,
          adopterName:  app.applicantName,
          animalName:   app.animal.name,
          orgName:      app.organization.name,
          orgEmail:     app.organization.email,
          followUpType: stage.type,
        })
        await prisma.sentEmailLog.create({ data: { key } })
        sent++
        console.log(`[cron:follow-up] sent ${key}`)
      } catch (err) {
        console.error(`[cron:follow-up] failed for ${key}:`, err)
        errors.push(key)
      }
    }
  }

  console.log(`[cron:follow-up] done — sent=${sent} skipped=${skipped} errors=${errors.length}`)
  return NextResponse.json({ sent, skipped, errors })
}
