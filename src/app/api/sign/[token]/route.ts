import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { generateSignedContractPdf } from "@/lib/pdf"
import { sendSignedContractEmails, sendMicrochipTransferEmail } from "@/lib/email"
import { supabaseAdmin } from "@/lib/supabase"

const CONTRACTS_BUCKET = "signed-contracts"

export async function GET(req: NextRequest, { params }: { params: { token: string } }) {
  const contract = await prisma.adoptionContract.findUnique({
    where: { signingToken: params.token },
    include: {
      application: { select: { applicantName: true, applicantEmail: true } },
      animal: { select: { name: true, species: true } },
      organization: { select: { name: true, logo: true } },
    },
  })

  if (!contract) return NextResponse.json({ error: "Not found" }, { status: 404 })

  return NextResponse.json({
    id: contract.id,
    contractText: contract.contractText,
    adoptionFee: contract.adoptionFee,
    currency: contract.currency,
    signedAt: contract.signedAt,
    adopterName: contract.application.applicantName,
    animalName: contract.animal.name,
    orgName: contract.organization.name,
    orgLogo: contract.organization.logo,
  })
}

export async function POST(req: NextRequest, { params }: { params: { token: string } }) {
  const contract = await prisma.adoptionContract.findUnique({
    where: { signingToken: params.token },
    include: {
      application: { select: { id: true, applicantName: true, applicantEmail: true, organizationId: true } },
      animal: { select: { name: true, microchipNumber: true } },
      organization: { select: { name: true, email: true } },
    },
  })

  if (!contract) return NextResponse.json({ error: "Not found" }, { status: 404 })
  if (contract.signedAt) return NextResponse.json({ error: "Already signed" }, { status: 409 })

  const { typedSignature } = await req.json()
  if (!typedSignature?.trim()) return NextResponse.json({ error: "Signature is required" }, { status: 400 })
  if (typeof typedSignature !== "string" || typedSignature.trim().length > 200) {
    return NextResponse.json({ error: "Signature must be under 200 characters" }, { status: 400 })
  }

  // Get IP address
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"

  const signedAt = new Date()

  // Generate signed PDF
  const pdfBytes = await generateSignedContractPdf({
    orgName: contract.organization.name,
    adopterName: contract.application.applicantName,
    animalName: contract.animal.name,
    contractText: contract.contractText,
    typedSignature: typedSignature.trim(),
    signedAt,
    signerIp: ip,
  })

  // Upload PDF to Supabase Storage
  let signedPdfPath: string | null = null
  try {
    // Ensure bucket exists
    const { data: buckets } = await supabaseAdmin.storage.listBuckets()
    if (!buckets?.find(b => b.name === CONTRACTS_BUCKET)) {
      await supabaseAdmin.storage.createBucket(CONTRACTS_BUCKET, { public: false })
    }

    const path = `${contract.application.organizationId}/${contract.id}/signed.pdf`
    const { error } = await supabaseAdmin.storage
      .from(CONTRACTS_BUCKET)
      .upload(path, Buffer.from(pdfBytes), { contentType: "application/pdf", upsert: true })

    if (!error) signedPdfPath = path
  } catch (err) {
    console.error("PDF upload failed:", err)
    // Non-fatal — we still send the email with attachment
  }

  // Mark as signed
  await prisma.adoptionContract.update({
    where: { id: contract.id },
    data: {
      signedAt,
      signatureData: typedSignature.trim(),
      signerIp: ip,
      signedPdfPath,
      completedAt: signedAt,
    },
  })

  // Update application status to COMPLETED
  await prisma.adoptionApplication.update({
    where: { id: contract.application.id },
    data: { status: "COMPLETED" },
  })

  // Remove animal from public portal immediately — signed contract means adopted
  await prisma.animal.update({
    where: { id: contract.animalId },
    data: { status: "ADOPTED", publicProfile: false },
  })

  // Send signed PDFs via email
  try {
    await sendSignedContractEmails({
      adopterEmail: contract.application.applicantEmail,
      orgEmail: contract.organization.email,
      adopterName: contract.application.applicantName,
      animalName: contract.animal.name,
      orgName: contract.organization.name,
      pdfBytes,
    })
  } catch (err) {
    console.error("Failed to send signed contract emails:", err)
  }

  // Send microchip transfer reminder if the animal has a chip number
  if (contract.animal.microchipNumber) {
    try {
      await sendMicrochipTransferEmail({
        to: contract.application.applicantEmail,
        adopterName: contract.application.applicantName,
        animalName: contract.animal.name,
        microchipNumber: contract.animal.microchipNumber,
        orgName: contract.organization.name,
      })
    } catch (err) {
      console.error("Failed to send microchip transfer email:", err)
    }
  }

  return NextResponse.json({ ok: true, signedAt })
}
