import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(_req: NextRequest, { params }: { params: { token: string } }) {
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

  if (!assignment) return NextResponse.json({ error: "Not found" }, { status: 404 })
  if (assignment.status === "ENDED") return NextResponse.json({ error: "This foster placement has ended" }, { status: 410 })

  return NextResponse.json(assignment)
}
