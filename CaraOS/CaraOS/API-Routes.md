# API Routes

All under `src/app/api/`. Route handlers use Next.js App Router conventions.

## Animals

| Method | Path | Action |
|---|---|---|
| GET | `/api/animals` | List animals (org-scoped) |
| POST | `/api/animals` | Create animal |
| GET | `/api/animals/[animalId]` | Get single animal |
| PATCH | `/api/animals/[animalId]` | Update animal |
| DELETE | `/api/animals/[animalId]` | Delete animal |
| POST | `/api/animals/[animalId]/photos` | Upload photo to Supabase |
| DELETE | `/api/animals/[animalId]/photos/[photoId]` | Delete photo |
| POST | `/api/animals/[animalId]/medical` | Add medical record |
| POST | `/api/animals/[animalId]/foster` | Create foster assignment |

## Applications

| Method | Path | Action |
|---|---|---|
| PATCH | `/api/applications/[appId]` | Update status, notes, assignment |
| GET | `/api/applications/[appId]/contract` | Fetch contract |
| POST | `/api/applications/[appId]/contract` | Generate contract from template |
| POST | `/api/applications/[appId]/contract/send` | Email signing link to adopter |

## Auth

| Method | Path | Action |
|---|---|---|
| * | `/api/auth/[...nextauth]` | NextAuth handlers (login, callback, session) |
| POST | `/api/auth/register` | Create new user account |
| POST | `/api/auth/forgot-password` | Send password reset email |

## User

| Method | Path | Action |
|---|---|---|
| PATCH | `/api/user/profile` | Update name, image |

## Organizations

| Method | Path | Action |
|---|---|---|
| GET | `/api/orgs/[orgSlug]` | Get org details |
| PATCH | `/api/orgs/[orgSlug]` | Update org settings |
| POST | `/api/orgs/[orgSlug]/invite` | Send team invite email |
| GET | `/api/orgs/[orgSlug]/contract-template` | Fetch HTML contract template |
| PATCH | `/api/orgs/[orgSlug]/contract-template` | Save contract template |
| GET | `/api/orgs/[orgSlug]/gdpr` | List GDPR requests |
| POST | `/api/orgs/[orgSlug]/gdpr` | Create GDPR request |

## People

| Method | Path | Action |
|---|---|---|
| POST | `/api/people` | Create adopter/foster/volunteer/donor |

## Donations

| Method | Path | Action |
|---|---|---|
| POST | `/api/donations` | Record donation |

## Public Portal (unauthenticated)

| Method | Path | Action |
|---|---|---|
| GET | `/api/portal/[orgSlug]/animals/[animalId]` | Public animal data |
| POST | `/api/portal/[orgSlug]/apply` | Submit adoption application |

## Foster Portal (token-authenticated)

| Method | Path | Action |
|---|---|---|
| GET | `/api/foster/[token]` | Get assignment + animal data |
| POST | `/api/foster/[token]/updates` | Submit update from foster |

## Contract Signing (token-authenticated)

| Method | Path | Action |
|---|---|---|
| GET | `/api/sign/[token]` | Fetch contract for signing |
| POST | `/api/sign/[token]` | Submit signature → generate PDF |

## Onboarding

| Method | Path | Action |
|---|---|---|
| POST | `/api/onboarding` | Create org + link to user |

## Webhooks (reserved)

| Path | Notes |
|---|---|
| `/api/webhooks/stripe/` | Stripe payment event handler (directory exists, no handler yet) |

## See Also
- [[Features/Applications]] — application status flow
- [[Systems/Payments]] — Stripe integration
- [[Systems/Notifications]] — emails sent from API routes
