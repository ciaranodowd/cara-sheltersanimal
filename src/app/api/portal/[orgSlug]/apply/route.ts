import { NextRequest, NextResponse } from "next/server"
import { createHmac } from "crypto"
import { prisma } from "@/lib/prisma"
import { rateLimiters, getIP, checkRateLimit } from "@/lib/ratelimit"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const VALID_APPLICATION_TYPES = new Set(["ADOPT", "FOSTER"])

// Field length limits
const MAX_NAME = 200
const MAX_EMAIL = 254
const MAX_PHONE = 30
const MAX_ADDRESS = 500
const MAX_SHORT = 500
const MAX_LONG = 5000

export async function POST(
  req: NextRequest,
  { params }: { params: { orgSlug: string } }
) {
  const ip = getIP(req)
  try {
    const limited = await checkRateLimit(rateLimiters.adoptionApplication, ip)
    if (limited) return limited
  } catch (err) {
    console.error("Rate limit check failed:", err)
  }

  const org = await prisma.organization.findUnique({
    where: { slug: params.orgSlug },
    select: { id: true },
  })
  if (!org) return NextResponse.json({ error: "Organisation not found" }, { status: 404 })

  const body = await req.json()
  const {
    animalId, applicantName, applicantEmail, applicantPhone, applicantAddress, applicantCounty,
    householdType, rentOrOwn, landlordPermission,
    hasGarden, gardenFenced, hasChildren, childrenAges,
    hasOtherPets, otherPetsDetails, experienceLevel, previousPets,
    whyAdopt, workingHours, applicationType, gdprConsent, privacyPolicyConsent,
  } = body

  // Required field presence
  if (!animalId || !applicantName || !applicantEmail || !whyAdopt) {
    return NextResponse.json({ error: "Required fields missing" }, { status: 400 })
  }

  // Both consent fields are mandatory — enforce server-side
  if (gdprConsent !== true) {
    return NextResponse.json({ error: "GDPR consent is required to submit an application" }, { status: 400 })
  }
  if (privacyPolicyConsent !== true) {
    return NextResponse.json({ error: "You must confirm you have read the Privacy Policy" }, { status: 400 })
  }

  // Input validation
  if (typeof applicantName !== "string" || applicantName.trim().length < 2 || applicantName.trim().length > MAX_NAME) {
    return NextResponse.json({ error: "Invalid name" }, { status: 400 })
  }
  if (typeof applicantEmail !== "string" || !EMAIL_RE.test(applicantEmail) || applicantEmail.length > MAX_EMAIL) {
    return NextResponse.json({ error: "Invalid email address" }, { status: 400 })
  }
  if (applicantPhone && (typeof applicantPhone !== "string" || applicantPhone.length > MAX_PHONE)) {
    return NextResponse.json({ error: "Invalid phone number" }, { status: 400 })
  }
  if (applicantAddress && (typeof applicantAddress !== "string" || applicantAddress.length > MAX_ADDRESS)) {
    return NextResponse.json({ error: "Address is too long" }, { status: 400 })
  }
  if (typeof whyAdopt !== "string" || whyAdopt.trim().length < 10 || whyAdopt.length > MAX_LONG) {
    return NextResponse.json({ error: "Please provide a reason (10–5000 characters)" }, { status: 400 })
  }
  if (childrenAges && (typeof childrenAges !== "string" || childrenAges.length > MAX_SHORT)) {
    return NextResponse.json({ error: "Children's ages field is too long" }, { status: 400 })
  }
  if (otherPetsDetails && (typeof otherPetsDetails !== "string" || otherPetsDetails.length > MAX_SHORT)) {
    return NextResponse.json({ error: "Other pets field is too long" }, { status: 400 })
  }
  if (previousPets && (typeof previousPets !== "string" || previousPets.length > MAX_LONG)) {
    return NextResponse.json({ error: "Previous pets field is too long" }, { status: 400 })
  }
  if (workingHours && (typeof workingHours !== "string" || workingHours.length > MAX_SHORT)) {
    return NextResponse.json({ error: "Working hours field is too long" }, { status: 400 })
  }

  // Validate enum values
  const resolvedType = applicationType ?? "ADOPT"
  if (!VALID_APPLICATION_TYPES.has(resolvedType)) {
    return NextResponse.json({ error: "Invalid application type" }, { status: 400 })
  }

  // Verify the animal is available and belongs to this org
  const animal = await prisma.animal.findFirst({
    where: { id: animalId, organizationId: org.id, status: "AVAILABLE" },
  })
  if (!animal) return NextResponse.json({ error: "Animal not available" }, { status: 400 })

  const application = await (prisma.adoptionApplication.create as any)({
    data: {
      organizationId: org.id,
      animalId,
      applicantName: applicantName.trim(),
      applicantEmail: applicantEmail.toLowerCase().trim(),
      applicantPhone: applicantPhone?.trim() || null,
      applicantAddress: applicantAddress?.trim() || null,
      applicantCounty: applicantCounty || null,
      householdType: householdType || null,
      rentOrOwn: rentOrOwn || null,
      landlordPermission: landlordPermission ?? null,
      hasGarden: hasGarden ?? false,
      gardenFenced: gardenFenced ?? null,
      hasChildren: hasChildren ?? false,
      childrenAges: childrenAges?.trim() || null,
      hasOtherPets: hasOtherPets ?? false,
      otherPetsDetails: otherPetsDetails?.trim() || null,
      experienceLevel: experienceLevel || null,
      previousPets: previousPets?.trim() || null,
      whyAdopt: whyAdopt.trim(),
      workingHours: workingHours?.trim() || null,
      applicationType: resolvedType,
      gdprConsent: true,
      gdprConsentAt: new Date(),
      gdprConsentIp: ip,
      privacyPolicyConsent: true,
      privacyPolicyConsentAt: new Date(),
      privacyPolicyConsentIp: ip,
      status: "PENDING",
    },
  })

  const participant = await prisma.user.upsert({
    where: { email: applicantEmail.toLowerCase().trim() },
    update: {},
    create: { email: applicantEmail.toLowerCase().trim(), name: applicantName.trim() },
  })

  const conversation = await prisma.conversation.create({
    data: {
      shelterOrganizationId: org.id,
      participantUserId: participant.id,
      animalId,
      type: resolvedType === "FOSTER" ? "FOSTER" : "ADOPTION",
    },
    select: { id: true },
  })

  const conversationSecret = createHmac("sha256", process.env.NEXTAUTH_SECRET!)
    .update(conversation.id)
    .digest("hex")

  return NextResponse.json(
    { id: application.id, conversationToken: conversation.id, conversationSecret },
    { status: 201 }
  )
}
