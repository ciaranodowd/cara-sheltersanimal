# System: Notifications (Email)

## Stack
- **Provider**: Resend v6.10.0
- **Config**: `src/lib/email.ts`
- **From address**: `RESEND_FROM_EMAIL` (default: `noreply@cara.ie`)

## Email Functions (in `src/lib/email.ts`)

| Function | Trigger | Recipients |
|---|---|---|
| `sendFosterInviteEmail()` | Foster assignment created | Foster carer |
| `sendContractSigningEmail()` | Contract sent for signing | Adopter |
| `sendSignedContractEmails()` | Contract signed | Adopter + org |
| `sendMicrochipTransferEmail()` | Adoption completed | Adopter |

## Email Template System

Templates are stored in the `EmailTemplate` DB model — one row per `EmailType` per org. Orgs can customise templates in Settings.

**EmailType enum**:
- APPLICATION_RECEIVED
- APPLICATION_APPROVED
- APPLICATION_REJECTED
- HOME_CHECK_SCHEDULED
- ADOPTION_CONTRACT
- ADOPTION_COMPLETE
- FOSTER_WELCOME
- FOSTER_CHECK_IN
- DONATION_RECEIPT
- CAMPAIGN_UPDATE
- WELCOME

## Email Features
- HTML + plain text versions
- Branded with Cara logo
- PDF attachments (signed adoption contracts)
- Safe sender domain (`cara.ie`)

## Environment Variables

```
RESEND_API_KEY       — Resend API key
RESEND_FROM_EMAIL    — sender address (e.g. hello@cara.ie)
```

## See Also
- [[Features/Applications]] — which emails fire during adoption workflow
- [[Systems/PDF]] — PDF attached to signing confirmation emails
- [[Database]] — EmailTemplate model
