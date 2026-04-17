# Feature: Adoption Applications

## Overview
An `AdoptionApplication` is submitted by an `Adopter` for a specific `Animal`. Staff manage it through the dashboard through to contract signing and adoption completion.

## Application Workflow

```
Public applies at /portal/:orgSlug/adopt/:animalId/apply
         ↓
PENDING → REVIEWING / UNDER_REVIEW
         ↓
    HOME_CHECK → HOME_CHECK_SCHEDULED → HOME_CHECK_DONE
         ↓
    APPROVED → CONTRACT_SENT
         ↓
    (adopter signs at /sign/:token)
         ↓
    COMPLETED
         ↗ (any point)
    REJECTED / WITHDRAWN
```

## Dashboard Pages

| Page | Path |
|---|---|
| All applications | `/:orgSlug/adoptions` |
| Rejected | `/:orgSlug/adoptions/rejected` |
| Application detail | `/:orgSlug/adoptions/:appId` |
| Contract view | `/:orgSlug/adoptions/:appId/contract` |

## Application Form (Public)

Path: `/portal/:orgSlug/adopt/:animalId/apply`  
Form fields defined in `src/types/form-config.ts` — per-org configurable.

**Standard sections**:
1. About you (name, address, phone)
2. Your lifestyle (work hours, home type, rent/own, landlord permission)
3. Other animals (hasOtherPets, details)
4. Other pets/children details
5. About this adoption (why adopt, experience level)
6. Vet reference

**Custom questions**: Orgs can add custom text/dropdown/yes-no questions via `FormConfig`.

GDPR consent collected at submission time.

## Home Check

- Assigned to a `Volunteer` with `isHomeChecker = true`
- Fields: `homeCheckDate`, `homeCheckNotes`, `homeCheckPassed`

## Contract Generation

1. Staff clicks "Generate Contract" on `/:orgSlug/adoptions/:appId/contract`
2. `POST /api/applications/[appId]/contract` fills org's `contractTemplate` with animal + adopter data
3. Creates `AdoptionContract` with unique `signingToken`
4. Staff clicks "Send for Signing" → `POST .../contract/send` → Resend email to adopter with link to `/sign/[token]`

## Contract Signing

Path: `/sign/[token]` (public, no login required)  
- Adopter reads contract
- Types their name as e-signature
- `POST /api/sign/[token]` records `signatureData`, `signedAt`, `signerIp`
- PDF generated via pdf-lib and stored in Supabase Storage
- Signed contract emailed to adopter + org

eIDAS compliance: stores typed name + timestamp + IP.

## Key Model Fields

**AdoptionApplication**:
- `assignedToId` → User (staff member handling it)
- `homeCheckerId` → User (volunteer)
- `applicationType` — ADOPT | FOSTER
- `gdprConsent`, `gdprConsentAt`, `gdprConsentIp`

**AdoptionContract**:
- `signingToken` — UUID in signing URL
- `signedPdfPath` — Supabase path to PDF
- `adoptionFee` + `stripePaymentId`
- `completedAt` — marks final adoption

## Emails Sent

- Application received (to adopter)
- Application approved/rejected
- Home check scheduled
- Contract signing link
- Signed contract copy (to adopter + org)
- Adoption complete

## See Also
- [[Database]] — AdoptionApplication, AdoptionContract models
- [[Systems/Notifications]] — email functions
- [[Systems/PDF]] — contract PDF generation
- [[Systems/Payments]] — adoption fee via Stripe
- [[Systems/GDPR]] — consent handling
