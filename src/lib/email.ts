import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY!)
const FROM = process.env.RESEND_FROM_EMAIL ?? "noreply@carashelters.ie"

export async function sendContractSigningEmail({
  to,
  adopterName,
  animalName,
  orgName,
  signingUrl,
}: {
  to: string
  adopterName: string
  animalName: string
  orgName: string
  signingUrl: string
}) {
  const { error } = await resend.emails.send({
    from: FROM,
    to,
    subject: `Your adoption contract for ${animalName} — please sign`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:sans-serif;color:#1a1a1a;max-width:600px;margin:0 auto;padding:32px 24px">
  <div style="margin-bottom:32px">
    <span style="display:inline-block;background:#1a3a2a;color:#4ade80;font-weight:700;font-size:18px;padding:6px 14px;border-radius:6px;letter-spacing:0.5px">cara</span>
  </div>
  <h1 style="font-size:22px;font-weight:700;margin:0 0 8px">Adoption contract ready to sign</h1>
  <p style="color:#555;margin:0 0 24px">Hi ${adopterName},</p>
  <p style="color:#555;margin:0 0 24px">
    ${orgName} has prepared an adoption contract for <strong>${animalName}</strong>.
    Please review and sign the contract using the link below.
  </p>
  <div style="text-align:center;margin:32px 0">
    <a href="${signingUrl}" style="display:inline-block;background:#1a3a2a;color:#fff;text-decoration:none;font-weight:600;padding:14px 32px;border-radius:8px;font-size:15px">
      Review &amp; sign contract
    </a>
  </div>
  <p style="color:#888;font-size:13px;margin:0 0 8px">Or copy this link into your browser:</p>
  <p style="color:#888;font-size:13px;word-break:break-all;margin:0 0 32px">${signingUrl}</p>
  <hr style="border:none;border-top:1px solid #eee;margin:24px 0">
  <p style="color:#aaa;font-size:12px;margin:0">
    This email was sent by ${orgName} via Cara. If you believe you received this in error, please ignore it.
  </p>
</body>
</html>`,
  })
  if (error) throw new Error(error.message)
}

export async function sendSignedContractEmails({
  adopterEmail,
  orgEmail,
  adopterName,
  animalName,
  orgName,
  pdfBytes,
}: {
  adopterEmail: string
  orgEmail: string | null
  adopterName: string
  animalName: string
  orgName: string
  pdfBytes: Uint8Array
}) {
  const filename = `adoption-contract-${animalName.toLowerCase().replace(/\s+/g, "-")}.pdf`
  const pdfBuffer = Buffer.from(pdfBytes)

  const adopter = resend.emails.send({
    from: FROM,
    to: adopterEmail,
    subject: `Signed adoption contract — ${animalName}`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:sans-serif;color:#1a1a1a;max-width:600px;margin:0 auto;padding:32px 24px">
  <div style="margin-bottom:32px">
    <span style="display:inline-block;background:#1a3a2a;color:#4ade80;font-weight:700;font-size:18px;padding:6px 14px;border-radius:6px;letter-spacing:0.5px">cara</span>
  </div>
  <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px 20px;margin-bottom:24px;display:flex;align-items:center;gap:12px">
    <span style="font-size:20px">✓</span>
    <span style="font-weight:600;color:#166534">Your adoption contract has been signed</span>
  </div>
  <p style="color:#555;margin:0 0 24px">Hi ${adopterName},</p>
  <p style="color:#555;margin:0 0 24px">
    Your signed adoption contract for <strong>${animalName}</strong> from <strong>${orgName}</strong> is attached to this email.
    Please keep it for your records.
  </p>
  <p style="color:#555;margin:0 0 24px">
    Congratulations and welcome to the family!
  </p>
  <hr style="border:none;border-top:1px solid #eee;margin:24px 0">
  <p style="color:#aaa;font-size:12px;margin:0">Sent by ${orgName} via Cara.</p>
</body>
</html>`,
    attachments: [{ filename, content: pdfBuffer }],
  })

  const promises: Promise<unknown>[] = [adopter]

  if (orgEmail) {
    promises.push(
      resend.emails.send({
        from: FROM,
        to: orgEmail,
        subject: `Contract signed — ${adopterName} & ${animalName}`,
        html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:sans-serif;color:#1a1a1a;max-width:600px;margin:0 auto;padding:32px 24px">
  <div style="margin-bottom:32px">
    <span style="display:inline-block;background:#1a3a2a;color:#4ade80;font-weight:700;font-size:18px;padding:6px 14px;border-radius:6px;letter-spacing:0.5px">cara</span>
  </div>
  <p style="color:#555;margin:0 0 16px">The adoption contract for <strong>${animalName}</strong> has been signed by <strong>${adopterName}</strong>.</p>
  <p style="color:#555;margin:0 0 24px">The signed copy is attached. The adoption application has been marked as completed.</p>
  <hr style="border:none;border-top:1px solid #eee;margin:24px 0">
  <p style="color:#aaa;font-size:12px;margin:0">Cara — Animal Shelter Management</p>
</body>
</html>`,
        attachments: [{ filename, content: pdfBuffer }],
      })
    )
  }

  await Promise.all(promises)
}

export async function sendDeclineNotificationEmail({
  orgEmail,
  adopterName,
  adopterEmail,
  animalName,
  message,
}: {
  orgEmail: string
  adopterName: string
  adopterEmail: string
  animalName: string
  message: string
}) {
  const { error } = await resend.emails.send({
    from: FROM,
    to: orgEmail,
    replyTo: adopterEmail,
    subject: `Contract query / declined — ${adopterName} & ${animalName}`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:sans-serif;color:#1a1a1a;max-width:600px;margin:0 auto;padding:32px 24px">
  <div style="margin-bottom:32px">
    <span style="display:inline-block;background:#1a3a2a;color:#4ade80;font-weight:700;font-size:18px;padding:6px 14px;border-radius:6px;letter-spacing:0.5px">cara</span>
  </div>
  <div style="background:#fef9c3;border:1px solid #fde047;border-radius:8px;padding:16px 20px;margin-bottom:24px">
    <strong style="color:#854d0e">Adoption contract — question or decline</strong>
  </div>
  <p style="color:#555;margin:0 0 8px"><strong>${adopterName}</strong> (${adopterEmail}) has a query or has declined to sign the contract for <strong>${animalName}</strong>.</p>
  <p style="color:#555;margin:0 0 8px">Their message:</p>
  <blockquote style="border-left:3px solid #d4d4d4;margin:0 0 24px;padding:12px 16px;color:#444;background:#f9f9f9;border-radius:0 6px 6px 0">${message.replace(/\n/g, "<br>")}</blockquote>
  <p style="color:#555;margin:0 0 24px">You can reply directly to this email to respond to ${adopterName}.</p>
  <hr style="border:none;border-top:1px solid #eee;margin:24px 0">
  <p style="color:#aaa;font-size:12px;margin:0">Cara — Animal Shelter Management</p>
</body>
</html>`,
  })
  if (error) throw new Error(error.message)
}

export async function sendPasswordResetEmail({
  to,
  token,
}: {
  to: string
  token: string
}) {
  const baseUrl = (process.env.NEXTAUTH_URL ?? "http://localhost:3000").replace(/\/$/, "")
  const resetUrl = `${baseUrl}/reset-password?token=${token}`

  const { error } = await resend.emails.send({
    from: FROM,
    to,
    subject: "Reset your Cara password",
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:sans-serif;color:#1a1a1a;max-width:600px;margin:0 auto;padding:32px 24px">
  <div style="margin-bottom:32px">
    <span style="display:inline-block;background:#1a3a2a;color:#4ade80;font-weight:700;font-size:18px;padding:6px 14px;border-radius:6px;letter-spacing:0.5px">cara</span>
  </div>
  <h1 style="font-size:22px;font-weight:700;margin:0 0 8px">Reset your password</h1>
  <p style="color:#555;margin:0 0 24px">
    We received a request to reset your Cara password. Click the button below to choose a new password.
    This link expires in 1&nbsp;hour.
  </p>
  <div style="text-align:center;margin:32px 0">
    <a href="${resetUrl}" style="display:inline-block;background:#1a3a2a;color:#fff;text-decoration:none;font-weight:600;padding:14px 32px;border-radius:8px;font-size:15px">
      Reset password
    </a>
  </div>
  <p style="color:#888;font-size:13px;margin:0 0 8px">Or copy this link into your browser:</p>
  <p style="color:#888;font-size:13px;word-break:break-all;margin:0 0 32px">${resetUrl}</p>
  <p style="color:#aaa;font-size:13px;margin:0 0 32px">
    If you didn&apos;t request a password reset, you can safely ignore this email.
  </p>
  <hr style="border:none;border-top:1px solid #eee;margin:24px 0">
  <p style="color:#aaa;font-size:12px;margin:0">Cara &mdash; Animal Shelter Management</p>
</body>
</html>`,
  })
  if (error) throw new Error(error.message)
}

export async function sendInviteEmail({
  to,
  orgName,
  token,
}: {
  to: string
  orgName: string
  token: string
}) {
  const baseUrl = (process.env.NEXTAUTH_URL ?? "http://localhost:3000").replace(/\/$/, "")
  const setupUrl = `${baseUrl}/reset-password?token=${token}`

  const { error } = await resend.emails.send({
    from: FROM,
    to,
    subject: `You've been invited to join ${orgName} on Cara`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:sans-serif;color:#1a1a1a;max-width:600px;margin:0 auto;padding:32px 24px">
  <div style="margin-bottom:32px">
    <span style="display:inline-block;background:#1a3a2a;color:#4ade80;font-weight:700;font-size:18px;padding:6px 14px;border-radius:6px;letter-spacing:0.5px">cara</span>
  </div>
  <h1 style="font-size:22px;font-weight:700;margin:0 0 8px">You&apos;ve been invited to Cara</h1>
  <p style="color:#555;margin:0 0 24px">
    <strong>${orgName}</strong> has invited you to join their shelter on Cara.
    Click the button below to set your password and get started.
    This link expires in <strong>1&nbsp;hour</strong>.
  </p>
  <div style="text-align:center;margin:32px 0">
    <a href="${setupUrl}" style="display:inline-block;background:#1a3a2a;color:#fff;text-decoration:none;font-weight:600;padding:14px 32px;border-radius:8px;font-size:15px">
      Set your password
    </a>
  </div>
  <p style="color:#888;font-size:13px;margin:0 0 8px">Or copy this link into your browser:</p>
  <p style="color:#888;font-size:13px;word-break:break-all;margin:0 0 32px">${setupUrl}</p>
  <p style="color:#aaa;font-size:13px;margin:0 0 32px">
    If you weren&apos;t expecting this invitation, you can safely ignore this email.
  </p>
  <hr style="border:none;border-top:1px solid #eee;margin:24px 0">
  <p style="color:#aaa;font-size:12px;margin:0">Cara &mdash; Animal Shelter Management</p>
</body>
</html>`,
  })
  if (error) throw new Error(error.message)
}

export async function sendNewMessageEmail({
  to,
  participantName,
  orgName,
  orgSlug,
  conversationId,
  animalName,
}: {
  to: string
  participantName: string | null
  orgName: string
  orgSlug: string
  conversationId: string
  animalName: string | null
}) {
  const baseUrl = (process.env.NEXTAUTH_URL ?? "http://localhost:3000").replace(/\/$/, "")
  const portalUrl = `${baseUrl}/portal/${orgSlug}/conversations/${conversationId}`
  const greeting = participantName ? `Hi ${participantName},` : "Hi,"
  const about = animalName ? ` regarding <strong>${animalName}</strong>` : ""

  const { error } = await resend.emails.send({
    from: FROM,
    to,
    subject: `New message from ${orgName}`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:sans-serif;color:#1a1a1a;max-width:600px;margin:0 auto;padding:32px 24px">
  <div style="margin-bottom:32px">
    <span style="display:inline-block;background:#1a3a2a;color:#4ade80;font-weight:700;font-size:18px;padding:6px 14px;border-radius:6px;letter-spacing:0.5px">cara</span>
  </div>
  <h1 style="font-size:22px;font-weight:700;margin:0 0 8px">You have a new message</h1>
  <p style="color:#555;margin:0 0 24px">${greeting}</p>
  <p style="color:#555;margin:0 0 24px">
    <strong>${orgName}</strong> has sent you a message${about}. Click the button below to read and reply — no account needed.
  </p>
  <div style="text-align:center;margin:32px 0">
    <a href="${portalUrl}" style="display:inline-block;background:#1a3a2a;color:#fff;text-decoration:none;font-weight:600;padding:14px 32px;border-radius:8px;font-size:15px">
      Read message
    </a>
  </div>
  <p style="color:#888;font-size:13px;margin:0 0 8px">Or copy this link into your browser:</p>
  <p style="color:#888;font-size:13px;word-break:break-all;margin:0 0 32px">${portalUrl}</p>
  <hr style="border:none;border-top:1px solid #eee;margin:24px 0">
  <p style="color:#aaa;font-size:12px;margin:0">
    This message was sent by ${orgName} via Cara. If you weren&apos;t expecting this, you can safely ignore it.
  </p>
</body>
</html>`,
  })
  if (error) throw new Error(error.message)
}

export async function sendMicrochipTransferEmail({
  to,
  adopterName,
  animalName,
  microchipNumber,
  orgName,
}: {
  to: string
  adopterName: string
  animalName: string
  microchipNumber: string
  orgName: string
}) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: `Action required: Transfer ${animalName}'s microchip into your name`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:sans-serif;color:#1a1a1a;max-width:600px;margin:0 auto;padding:32px 24px">
  <div style="margin-bottom:32px">
    <span style="display:inline-block;background:#1a3a2a;color:#4ade80;font-weight:700;font-size:18px;padding:6px 14px;border-radius:6px;letter-spacing:0.5px">cara</span>
  </div>
  <h1 style="font-size:22px;font-weight:700;margin:0 0 8px">Congratulations on adopting ${animalName}! 🎉</h1>
  <p style="color:#555;margin:0 0 24px">Hi ${adopterName},</p>
  <p style="color:#555;margin:0 0 16px">
    We're so happy that <strong>${animalName}</strong> has found their forever home with you.
    There's one important step to complete your adoption:
  </p>
  <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:20px 24px;margin-bottom:24px">
    <p style="font-weight:700;color:#166534;margin:0 0 8px;font-size:15px">Transfer the microchip registration</p>
    <p style="color:#166534;margin:0 0 16px;font-size:14px">
      This is a legal requirement in Ireland. The chip must be registered in your name.
    </p>
    <p style="color:#374151;margin:0 0 6px;font-size:13px;font-weight:600">Chip number:</p>
    <p style="font-family:monospace;font-size:18px;font-weight:700;color:#1a3a2a;background:#fff;border:1px solid #bbf7d0;border-radius:6px;padding:10px 14px;margin:0 0 16px;letter-spacing:1px">${microchipNumber}</p>
    <p style="color:#374151;margin:0 0 10px;font-size:13px">You can transfer the registration at either of these Irish registries:</p>
    <table style="border-collapse:collapse;width:100%">
      <tr>
        <td style="padding:6px 8px 6px 0">
          <a href="https://www.fido.ie" style="display:inline-block;background:#1a3a2a;color:#fff;text-decoration:none;font-weight:600;padding:10px 20px;border-radius:6px;font-size:13px">
            Fido — fido.ie
          </a>
        </td>
        <td style="padding:6px 0">
          <a href="https://animark.ie" style="display:inline-block;background:#1a3a2a;color:#fff;text-decoration:none;font-weight:600;padding:10px 20px;border-radius:6px;font-size:13px">
            Animark — animark.ie
          </a>
        </td>
      </tr>
    </table>
  </div>
  <p style="color:#555;margin:0 0 24px;font-size:14px">
    If you have any questions, please don't hesitate to reach out to us at ${orgName}.
    We wish you and ${animalName} many happy years together!
  </p>
  <hr style="border:none;border-top:1px solid #eee;margin:24px 0">
  <p style="color:#aaa;font-size:12px;margin:0">Sent by ${orgName} via Cara.</p>
</body>
</html>`,
  })
}
