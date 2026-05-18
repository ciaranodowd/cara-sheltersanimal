import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY!)
const FROM = process.env.RESEND_FROM_EMAIL ?? "noreply@carashelters.ie"

function baseUrl(): string {
  return (process.env.NEXTAUTH_URL ?? "http://localhost:3000").replace(/\/$/, "")
}

// Shared HTML wrapper — matches the style of existing emails in email.ts
function wrap(body: string, orgName: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:sans-serif;color:#1a1a1a;max-width:600px;margin:0 auto;padding:32px 24px">
  <div style="margin-bottom:32px">
    <span style="display:inline-block;background:#1a3a2a;color:#4ade80;font-weight:700;font-size:18px;padding:6px 14px;border-radius:6px;letter-spacing:0.5px">cara</span>
  </div>
  ${body}
  <hr style="border:none;border-top:1px solid #eee;margin:24px 0">
  <p style="color:#aaa;font-size:12px;margin:0">Sent by ${orgName} via Cara.</p>
</body>
</html>`
}

function ctaButton(href: string, label: string): string {
  return `<div style="text-align:center;margin:32px 0">
    <a href="${href}" style="display:inline-block;background:#1a3a2a;color:#fff;text-decoration:none;font-weight:600;padding:14px 32px;border-radius:8px;font-size:15px">${label}</a>
  </div>`
}

// Format a Date for display. Uses Europe/Dublin as the primary timezone since this is
// an Irish product. If the org is in a different timezone, times may be off by ±1 hour
// in summer — the email advises confirming with the shelter.
function formatDatetime(d: Date): string {
  return d.toLocaleString("en-GB", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Dublin",
  })
}

function formatDate(d: Date): string {
  return d.toLocaleDateString("en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Europe/Dublin",
  })
}

function formatCurrency(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-IE", { style: "currency", currency }).format(amount)
  } catch {
    return `${currency} ${amount.toFixed(2)}`
  }
}

// ─────────────────────────────────────────────
// APPLICATION RECEIVED  (adopt + foster)
// ─────────────────────────────────────────────

export async function sendApplicationReceivedEmail({
  to,
  applicantName,
  animalName,
  orgName,
  isFoster,
}: {
  to: string
  applicantName: string
  animalName: string
  orgName: string
  orgSlug?: string
  isFoster: boolean
}) {
  const subject = isFoster
    ? `We received your foster application for ${animalName}`
    : `We received your adoption application for ${animalName}`

  const intro = isFoster
    ? `Thank you for applying to foster <strong>${animalName}</strong> with <strong>${orgName}</strong>.
       Fostering makes a real difference to animals in our care — we really appreciate it.`
    : `Thank you for applying to adopt <strong>${animalName}</strong> from <strong>${orgName}</strong>.
       We're delighted you're interested and will give your application careful consideration.`

  const steps = isFoster
    ? `<ul style="color:#374151;margin:0;padding-left:20px;font-size:14px">
         <li style="margin-bottom:6px">Our foster coordination team will review your application</li>
         <li style="margin-bottom:6px">We may contact you to arrange a home visit</li>
         <li>You'll hear from us within 5–7 working days</li>
       </ul>`
    : `<ul style="color:#374151;margin:0;padding-left:20px;font-size:14px">
         <li style="margin-bottom:6px">Our adoption team will review your application</li>
         <li style="margin-bottom:6px">We may be in touch to arrange a meet &amp; greet or home visit</li>
         <li>You'll hear from us within 5–7 working days</li>
       </ul>`

  const { error } = await resend.emails.send({
    from: FROM,
    to,
    subject,
    html: wrap(`
      <h1 style="font-size:22px;font-weight:700;margin:0 0 16px">Application received</h1>
      <p style="color:#555;margin:0 0 16px">Hi ${applicantName},</p>
      <p style="color:#555;margin:0 0 24px">${intro}</p>
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px 20px;margin-bottom:24px">
        <p style="font-weight:600;color:#166534;margin:0 0 10px">What happens next</p>
        ${steps}
      </div>
      <p style="color:#888;font-size:13px;margin:0">
        If you have questions in the meantime, you can reply to this email or contact ${orgName} directly.
      </p>
    `, orgName),
  })
  if (error) throw new Error(error.message)
}

// ─────────────────────────────────────────────
// APPLICATION APPROVED  (adopt + foster)
// ─────────────────────────────────────────────

export async function sendApplicationApprovedEmail({
  to,
  applicantName,
  animalName,
  orgName,
  orgSlug,
  isFoster,
}: {
  to: string
  applicantName: string
  animalName: string
  orgName: string
  orgSlug: string
  isFoster: boolean
}) {
  const portalUrl = `${baseUrl()}/portal/${orgSlug}`

  const subject = isFoster
    ? `Your foster application for ${animalName} has been approved`
    : `Great news — your adoption application for ${animalName} has been approved`

  const body = isFoster
    ? `
      <h1 style="font-size:22px;font-weight:700;margin:0 0 16px">Your foster application has been approved!</h1>
      <p style="color:#555;margin:0 0 16px">Hi ${applicantName},</p>
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:14px 20px;margin-bottom:24px">
        <span style="font-weight:600;color:#166534">Application approved ✓</span>
      </div>
      <p style="color:#555;margin:0 0 16px">
        <strong>${orgName}</strong> has approved your application to foster <strong>${animalName}</strong>.
        Thank you for opening your home to an animal in need — it truly makes a difference.
      </p>
      <p style="color:#555;margin:0">
        Our foster coordinator will be in touch shortly to arrange the next steps,
        including a home check and a handover date. Keep an eye on your inbox!
      </p>
    `
    : `
      <h1 style="font-size:22px;font-weight:700;margin:0 0 16px">Your adoption application has been approved!</h1>
      <p style="color:#555;margin:0 0 16px">Hi ${applicantName},</p>
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:14px 20px;margin-bottom:24px">
        <span style="font-weight:600;color:#166534">Application approved ✓</span>
      </div>
      <p style="color:#555;margin:0 0 16px">
        Congratulations! <strong>${orgName}</strong> has approved your application to adopt <strong>${animalName}</strong>.
      </p>
      <p style="color:#555;margin:0 0 24px">
        The team will be in touch soon to discuss next steps. This may include a meet &amp; greet,
        a home visit, or preparing your adoption contract. We can't wait to get things moving!
      </p>
      ${ctaButton(portalUrl, "View your application")}
    `

  const { error } = await resend.emails.send({
    from: FROM,
    to,
    subject,
    html: wrap(body, orgName),
  })
  if (error) throw new Error(error.message)
}

// ─────────────────────────────────────────────
// APPLICATION REJECTED  (adopt + foster)
// ─────────────────────────────────────────────

export async function sendApplicationRejectedEmail({
  to,
  applicantName,
  animalName,
  orgName,
  orgSlug,
  isFoster,
}: {
  to: string
  applicantName: string
  animalName: string
  orgName: string
  orgSlug: string
  isFoster: boolean
}) {
  const portalUrl = `${baseUrl()}/portal/${orgSlug}`

  const subject = isFoster
    ? `Update on your foster application for ${animalName}`
    : `Update on your adoption application for ${animalName}`

  const body = isFoster
    ? `
      <h1 style="font-size:22px;font-weight:700;margin:0 0 16px">Update on your foster application</h1>
      <p style="color:#555;margin:0 0 16px">Hi ${applicantName},</p>
      <p style="color:#555;margin:0 0 16px">
        Thank you so much for your interest in fostering <strong>${animalName}</strong> with <strong>${orgName}</strong>.
      </p>
      <p style="color:#555;margin:0 0 16px">
        After careful consideration, we're not able to proceed with your foster application for
        ${animalName} at this time. This is not a reflection on you personally — finding the right
        match for each animal involves many factors.
      </p>
      <p style="color:#555;margin:0 0 24px">
        We'd love to keep you in mind for future fostering opportunities. Animals in our care always
        need dedicated foster carers, and we hope you'll consider applying again.
      </p>
      ${ctaButton(portalUrl, "See animals who need fostering")}
    `
    : `
      <h1 style="font-size:22px;font-weight:700;margin:0 0 16px">Update on your adoption application</h1>
      <p style="color:#555;margin:0 0 16px">Hi ${applicantName},</p>
      <p style="color:#555;margin:0 0 16px">
        Thank you for your interest in adopting <strong>${animalName}</strong> from <strong>${orgName}</strong>.
      </p>
      <p style="color:#555;margin:0 0 16px">
        After careful consideration, we have decided to proceed with a different applicant at this time.
        This is not a reflection on you — finding the right match for each animal is a thoughtful process
        that takes many things into account.
      </p>
      <p style="color:#555;margin:0 0 24px">
        We'd encourage you to browse other animals who are looking for their forever home.
        There may be a perfect match waiting for you.
      </p>
      ${ctaButton(portalUrl, "Browse available animals")}
      <p style="color:#888;font-size:13px;margin:0">
        If you have any questions, please feel free to reach out to ${orgName} directly.
      </p>
    `

  const { error } = await resend.emails.send({
    from: FROM,
    to,
    subject,
    html: wrap(body, orgName),
  })
  if (error) throw new Error(error.message)
}

// ─────────────────────────────────────────────
// MEET & GREET SCHEDULED
// ─────────────────────────────────────────────

export async function sendMeetGreetScheduledEmail({
  to,
  applicantName,
  animalName,
  orgName,
  orgAddress,
  homeCheckDate,
}: {
  to: string
  applicantName: string
  animalName: string
  orgName: string
  orgAddress: string | null
  homeCheckDate: Date | null
}) {
  const location = orgAddress ?? "our shelter — your coordinator will confirm the exact address"

  const dateBlock = homeCheckDate
    ? `<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:20px 24px;margin-bottom:24px">
        <table style="border-collapse:collapse;width:100%">
          <tr>
            <td style="padding:6px 0;color:#64748b;font-size:14px;font-weight:600;width:90px;vertical-align:top">Date &amp; time</td>
            <td style="padding:6px 0;color:#1a1a1a;font-size:14px">${formatDatetime(homeCheckDate)}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#64748b;font-size:14px;font-weight:600;vertical-align:top">Location</td>
            <td style="padding:6px 0;color:#1a1a1a;font-size:14px">${location}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#64748b;font-size:14px;font-weight:600;vertical-align:top">Animal</td>
            <td style="padding:6px 0;color:#1a1a1a;font-size:14px">${animalName}</td>
          </tr>
        </table>
      </div>`
    : `<p style="color:#555;margin:0 0 24px">
        Your coordinator will be in touch to confirm the exact date, time, and location.
      </p>`

  const { error } = await resend.emails.send({
    from: FROM,
    to,
    subject: `Your meet and greet with ${animalName} is scheduled`,
    html: wrap(`
      <h1 style="font-size:22px;font-weight:700;margin:0 0 16px">Meet and greet scheduled</h1>
      <p style="color:#555;margin:0 0 16px">Hi ${applicantName},</p>
      <p style="color:#555;margin:0 0 16px">
        Great news! <strong>${orgName}</strong> has scheduled a meet and greet for you to meet
        <strong>${animalName}</strong>. We look forward to seeing you!
      </p>
      ${dateBlock}
      <div style="background:#fefce8;border:1px solid #fde047;border-radius:8px;padding:16px 20px;margin-bottom:24px">
        <p style="font-weight:600;color:#854d0e;margin:0 0 8px">What to bring</p>
        <ul style="color:#374151;margin:0;padding-left:20px;font-size:14px">
          <li style="margin-bottom:4px">Photo ID</li>
          <li style="margin-bottom:4px">All household members who will be living with the animal</li>
          <li>Any questions you'd like to ask the team</li>
        </ul>
      </div>
      <p style="color:#888;font-size:13px;margin:0">
        If you need to reschedule or have any questions, please contact ${orgName} directly.
      </p>
    `, orgName),
  })
  if (error) throw new Error(error.message)
}

// ─────────────────────────────────────────────
// ADOPTION COMPLETE  (manual completion via PATCH route)
// Note: the contract-signing flow already sends sendSignedContractEmails from email.ts.
// This function covers applications marked complete without a signed contract.
// ─────────────────────────────────────────────

export async function sendAdoptionCompleteEmail({
  to,
  adopterName,
  animalName,
  orgName,
  orgEmail,
}: {
  to: string
  adopterName: string
  animalName: string
  orgName: string
  orgEmail: string | null
}) {
  const contactLine = orgEmail
    ? `If you ever need support or advice, reach out to ${orgName} at
       <a href="mailto:${orgEmail}" style="color:#1a3a2a">${orgEmail}</a>.`
    : `If you ever need support or advice, don't hesitate to reach out to ${orgName}.`

  const { error } = await resend.emails.send({
    from: FROM,
    to,
    subject: `Congratulations — ${animalName} is officially yours!`,
    html: wrap(`
      <h1 style="font-size:22px;font-weight:700;margin:0 0 16px">Congratulations!</h1>
      <p style="color:#555;margin:0 0 16px">Hi ${adopterName},</p>
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:14px 20px;margin-bottom:24px">
        <span style="font-weight:600;color:#166534">Your adoption of ${animalName} is complete ✓</span>
      </div>
      <p style="color:#555;margin:0 0 16px">
        We're so happy that <strong>${animalName}</strong> has found their forever home with you.
        Thank you for giving them a loving, caring environment.
      </p>
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px 20px;margin-bottom:24px">
        <p style="font-weight:600;color:#1a1a1a;margin:0 0 10px;font-size:14px">Tips for the first few weeks</p>
        <ul style="color:#374151;margin:0;padding-left:20px;font-size:14px">
          <li style="margin-bottom:6px">Give ${animalName} time and space to settle into their new home</li>
          <li style="margin-bottom:6px">Keep routines consistent — regular feeding and walks help enormously</li>
          <li style="margin-bottom:6px">Book a vet check-up within the first few weeks</li>
          <li>Be patient — adjustment can take days or even weeks</li>
        </ul>
      </div>
      <p style="color:#555;margin:0 0 24px">${contactLine}</p>
      <p style="color:#555;margin:0">
        Thank you from everyone at <strong>${orgName}</strong>.
        We wish you and ${animalName} many happy years together!
      </p>
    `, orgName),
  })
  if (error) throw new Error(error.message)
}

// ─────────────────────────────────────────────
// DONATION RECEIPT
// ─────────────────────────────────────────────

export async function sendDonationReceiptEmail({
  to,
  donorName,
  amount,
  currency,
  orgName,
  donationId,
  transactionId,
  donatedAt,
}: {
  to: string
  donorName: string | null
  amount: number
  currency: string
  orgName: string
  donationId: string
  transactionId: string | null
  donatedAt: Date
}) {
  const greeting = donorName ? `Dear ${donorName},` : "Dear donor,"
  const formattedAmount = formatCurrency(amount, currency)
  const formattedDate = formatDate(donatedAt)
  const ref = transactionId ?? donationId

  const { error } = await resend.emails.send({
    from: FROM,
    to,
    subject: `Thank you for your donation to ${orgName}`,
    html: wrap(`
      <h1 style="font-size:22px;font-weight:700;margin:0 0 16px">Thank you for your donation</h1>
      <p style="color:#555;margin:0 0 16px">${greeting}</p>
      <p style="color:#555;margin:0 0 24px">
        Your generous donation to <strong>${orgName}</strong> has been received.
        Every contribution helps us care for animals in need — thank you for making a real difference.
      </p>
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:20px 24px;margin-bottom:24px">
        <p style="font-weight:600;color:#1a1a1a;margin:0 0 12px;font-size:14px">Donation receipt</p>
        <table style="border-collapse:collapse;width:100%">
          <tr>
            <td style="padding:6px 0;color:#64748b;font-size:14px;font-weight:600;width:120px">Organisation</td>
            <td style="padding:6px 0;color:#1a1a1a;font-size:14px">${orgName}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#64748b;font-size:14px;font-weight:600">Amount</td>
            <td style="padding:6px 0;color:#1a1a1a;font-size:14px;font-weight:700">${formattedAmount}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#64748b;font-size:14px;font-weight:600">Date</td>
            <td style="padding:6px 0;color:#1a1a1a;font-size:14px">${formattedDate}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#64748b;font-size:14px;font-weight:600">Reference</td>
            <td style="padding:6px 0;color:#1a1a1a;font-size:13px;font-family:monospace">${ref}</td>
          </tr>
        </table>
      </div>
      <p style="color:#888;font-size:13px;margin:0">
        Please keep this email for your records.
        If you have any questions about your donation, please contact ${orgName}.
      </p>
    `, orgName),
  })
  if (error) throw new Error(error.message)
}

// ─────────────────────────────────────────────
// ADOPTION FOLLOW-UP  (3 days / 2 weeks / 3 months)
// ─────────────────────────────────────────────

export async function sendAdoptionFollowUpEmail({
  to,
  adopterName,
  animalName,
  orgName,
  orgEmail,
  followUpType,
}: {
  to: string
  adopterName: string
  animalName: string
  orgName: string
  orgEmail: string | null
  followUpType: "3days" | "2weeks" | "3months"
}) {
  const contactLine = orgEmail
    ? `Reach out to us any time at <a href="mailto:${orgEmail}" style="color:#1a3a2a">${orgEmail}</a> — we're always happy to help.`
    : `Reach out to ${orgName} any time — we're always happy to help.`

  let subject: string
  let body: string

  if (followUpType === "3days") {
    subject = `How is ${animalName} settling in?`
    body = `
      <h1 style="font-size:22px;font-weight:700;margin:0 0 16px">How are things going?</h1>
      <p style="color:#555;margin:0 0 16px">Hi ${adopterName},</p>
      <p style="color:#555;margin:0 0 16px">
        It's been a few days since <strong>${animalName}</strong> came home with you —
        we hope you're both settling in well!
      </p>
      <p style="color:#555;margin:0 0 16px">
        The first few days can be an adjustment period for any animal in a new home.
        A bit of patience and calm goes a long way — you're doing great.
      </p>
      <p style="color:#555;margin:0 0 24px">${contactLine}</p>
    `
  } else if (followUpType === "2weeks") {
    subject = `Two weeks with ${animalName} — checking in!`
    body = `
      <h1 style="font-size:22px;font-weight:700;margin:0 0 16px">Two weeks together!</h1>
      <p style="color:#555;margin:0 0 16px">Hi ${adopterName},</p>
      <p style="color:#555;margin:0 0 16px">
        It's been two weeks since <strong>${animalName}</strong> joined your family —
        we hope they're really starting to feel at home!
      </p>
      <p style="color:#555;margin:0 0 16px">
        By now, ${animalName} should be getting more comfortable, settling into routines,
        and maybe even showing a bit more of their personality.
      </p>
      <p style="color:#555;margin:0 0 24px">${contactLine}</p>
    `
  } else {
    subject = `Three months with ${animalName} — a special milestone`
    body = `
      <h1 style="font-size:22px;font-weight:700;margin:0 0 16px">Three months together!</h1>
      <p style="color:#555;margin:0 0 16px">Hi ${adopterName},</p>
      <p style="color:#555;margin:0 0 16px">
        Can you believe it? It's already been three months since <strong>${animalName}</strong>
        found their forever home with you.
      </p>
      <p style="color:#555;margin:0 0 16px">
        We hope the past few months have been full of happy moments and memories together.
        It means the world to us knowing that ${animalName} is loved and cared for.
      </p>
      <p style="color:#555;margin:0 0 24px">${contactLine}</p>
      <p style="color:#555;margin:0">
        Thank you from everyone at <strong>${orgName}</strong> for giving ${animalName}
        such a wonderful life.
      </p>
    `
  }

  const { error } = await resend.emails.send({
    from: FROM,
    to,
    subject,
    html: wrap(body, orgName),
  })
  if (error) throw new Error(error.message)
}
