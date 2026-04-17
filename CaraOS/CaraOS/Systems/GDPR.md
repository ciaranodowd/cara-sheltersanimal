# System: GDPR Compliance

## Overview
Cara handles personal data for Irish/UK charities. GDPR compliance is baked into the data model and request tracking.

## Consent Tracking

All four person types store consent fields:

| Field | Present On |
|---|---|
| `gdprConsent` Boolean | Adopter, Foster, Volunteer, Donor |
| `gdprConsentAt` DateTime | Adopter, Foster, Volunteer, Donor |
| `gdprConsentIp` String | Adopter (captured on application) |
| `marketingConsent` Boolean | Adopter |

Consent is captured at the point of data collection (application form, person creation).

## GDPR Requests

Model: `GdprRequest`  
Managed in `/:orgSlug/settings` → GDPR tab (`gdpr-settings.tsx`)

**Request Types** (GdprRequestType):
- ACCESS — subject access request
- ERASURE — right to be forgotten
- RECTIFICATION — correct inaccurate data
- PORTABILITY — data export

**Statuses** (GdprStatus):
- PENDING → IN_PROGRESS → COMPLETED / REJECTED

## API

| Method | Path | Action |
|---|---|---|
| GET | `/api/orgs/[orgSlug]/gdpr` | List requests for org |
| POST | `/api/orgs/[orgSlug]/gdpr` | Create new request |

## eIDAS Compliance (Contract Signing)

On contract signing (`/sign/[token]`):
- `signatureData` — typed name stored as e-signature
- `signedAt` — timestamp
- `signerIp` — IP address captured

Displayed in PDF under eIDAS Regulation reference. See [[Systems/PDF]].

## Activity Logging

`ActivityLog` model provides audit trail of all staff actions:
- `action` — what happened
- `entityType`, `entityId` — what was affected
- `meta` — JSON metadata
- `userId` — who did it

## See Also
- [[Database]] — GdprRequest, ActivityLog models
- [[Features/Applications]] — consent captured during application
- [[Systems/PDF]] — eIDAS in contracts
