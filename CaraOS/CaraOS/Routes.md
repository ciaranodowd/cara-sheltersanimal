# Routes

## Auth Routes

| URL | File | Notes |
|---|---|---|
| `/login` | `(auth)/login/page.tsx` | Credentials + Google |
| `/register` | `(auth)/register/page.tsx` | Creates user + org |
| `/forgot-password` | `(auth)/forgot-password/page.tsx` | Sends reset email |

## Dashboard Routes (protected, requires session)

Base: `/:orgSlug/...`

| URL | File | Notes |
|---|---|---|
| `/:orgSlug` | `[orgSlug]/page.tsx` | Dashboard home |
| `/:orgSlug/animals` | `animals/page.tsx` | Animals list |
| `/:orgSlug/animals/new` | `animals/new/page.tsx` | Add animal |
| `/:orgSlug/animals/:id` | `animals/[animalId]/page.tsx` | Animal detail |
| `/:orgSlug/animals/:id/edit` | `animals/[animalId]/edit/page.tsx` | Edit animal |
| `/:orgSlug/animals/:id/foster/new` | `foster/new/page.tsx` | Assign foster |
| `/:orgSlug/animals/:id/medical/new` | `medical/new/page.tsx` | Add medical record |
| `/:orgSlug/adoptions` | `adoptions/page.tsx` | Applications list |
| `/:orgSlug/adoptions/rejected` | `adoptions/rejected/page.tsx` | Rejected apps |
| `/:orgSlug/adoptions/:appId` | `adoptions/[appId]/page.tsx` | Application detail |
| `/:orgSlug/adoptions/:appId/contract` | `contract/page.tsx` | View/send contract |
| `/:orgSlug/donations` | `donations/page.tsx` | Donations list |
| `/:orgSlug/donations/new` | `donations/new/page.tsx` | Add donation |
| `/:orgSlug/donations/campaigns` | `campaigns/page.tsx` | Campaigns list |
| `/:orgSlug/donations/campaigns/:id` | `campaigns/[id]/page.tsx` | Campaign detail |
| `/:orgSlug/people` | `people/page.tsx` | People list |
| `/:orgSlug/people/new` | `people/new/page.tsx` | Add person |
| `/:orgSlug/people/adopters/:id` | `adopters/[adopterId]/page.tsx` | Adopter profile |
| `/:orgSlug/people/fosters/:id` | `fosters/[fosterId]/page.tsx` | Foster profile |
| `/:orgSlug/people/donors/:id` | `donors/[donorId]/page.tsx` | Donor profile |
| `/:orgSlug/people/volunteers/:id` | `volunteers/[id]/page.tsx` | Volunteer profile |
| `/:orgSlug/foster` | `foster/page.tsx` | Foster management |
| `/:orgSlug/reports` | `reports/page.tsx` | Analytics |
| `/:orgSlug/portal` | `portal/page.tsx` | Manage public portal |
| `/:orgSlug/settings` | `settings/page.tsx` | Org settings |
| `/:orgSlug/settings/profile` | `settings/profile/page.tsx` | User profile |

## Public Portal Routes (unauthenticated)

| URL | File | Notes |
|---|---|---|
| `/portal/:orgSlug` | `portal/[orgSlug]/page.tsx` | Animals listing |
| `/portal/:orgSlug/animals/:id` | `animals/[animalId]/page.tsx` | Public animal profile |
| `/portal/:orgSlug/adopt/:id` | `adopt/[animalId]/page.tsx` | Adoption info page |
| `/portal/:orgSlug/adopt/:id/apply` | `apply/page.tsx` | Application form |

## Token-Based Routes (unauthenticated)

| URL | File | Notes |
|---|---|---|
| `/foster/:token` | `foster/[token]/page.tsx` | Foster updates portal |
| `/sign/:token` | `sign/[token]/page.tsx` | Contract e-signing |

## Root

| URL | File | Notes |
|---|---|---|
| `/` | `app/page.tsx` | Marketing landing page |
| `/onboarding` | `onboarding/page.tsx` | Create org after registration |

## See Also
- [[API-Routes]] — server-side endpoints
- [[File-Map]] — file locations
- [[Features/Applications]] — adoption workflow routes
