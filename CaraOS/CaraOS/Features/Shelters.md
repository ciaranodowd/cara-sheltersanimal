# Feature: Shelters (Multi-Tenancy & Org Management)

## Overview
Each shelter is an `Organization`. Users can belong to multiple orgs. All data is org-scoped. The platform supports Irish and UK charities with localised fields.

## Organisation Creation

1. User registers at `/register`
2. Redirected to `/onboarding`
3. `POST /api/onboarding` creates `Organization` + `UserOrganization` (ADMIN role)
4. Redirected to `/:orgSlug` dashboard

## Roles

| Role | Access |
|---|---|
| ADMIN | Full access — settings, billing, team management |
| STAFF | Animals, adoptions, people, donations |
| VOLUNTEER | Limited — assigned tasks, home checks |
| FOSTER | Foster portal only (`/foster/[token]`) |

## Settings Pages

All under `/:orgSlug/settings/`:

| Tab | File | Manages |
|---|---|---|
| General | `org-settings-form.tsx` | Name, address, phone, charity numbers |
| Contract | `contract-template-settings.tsx` | HTML adoption contract template |
| GDPR | `gdpr-settings.tsx` | View/manage GDPR requests |
| Team | `team-settings.tsx` | Invite + manage team members |
| Profile | `settings/profile/page.tsx` | Personal user settings |

## Team Invites

- ADMIN sends invite via `POST /api/orgs/[orgSlug]/invite`
- Creates `Invite` record with expiring token
- Resend sends invite email with link
- Accepted invite creates `UserOrganization` with specified role

## People Management

Four person types tracked under People section:

| Type | Key Extra Fields |
|---|---|
| Adopter | Applications history |
| Foster | Approval status, capacity, species prefs |
| Volunteer | Skills, isHomeChecker, isDriver, hoursLogged |
| Donor | isGiftAidEligible, isTaxRelief |

All created via `POST /api/people`, all have `unique(email, organizationId)`.

## Foster Management

Dashboard page: `/:orgSlug/foster`  
- View all active/ended foster assignments
- FosterAssignment generates a `fosterPortalToken`
- Foster receives email link to `/foster/[token]`

**Foster Portal** (`/foster/[token]`):
- Token-gated, no login required
- Foster can read animal info
- Post updates via `POST /api/foster/[token]/updates`
- View shelter updates timeline (`updates-panel.tsx`)

## Portal Management

Dashboard page: `/:orgSlug/portal`  
Controls which animals appear on the public portal (`publicProfile = true`).

**Public Portal** (`/portal/:orgSlug`):
- Shows available animals
- Public can view profiles and submit adoption applications

## Charity Numbers

| Field | Country | Purpose |
|---|---|---|
| `chyNumber` | Ireland | Gift Aid / CHY tax relief |
| `charityNumber` | UK | Charity Commission |
| `registrationNum` | Generic | Company registration |

## Stripe Connect

- `stripeAccountId` + `stripeOnboarded` on Organization
- Adoption fees + donations go through org's Stripe account
- Webhook directory: `/api/webhooks/stripe/` (handler not yet implemented)

## See Also
- [[Database]] — Organization, UserOrganization, Invite models
- [[Systems/Auth]] — session, roles
- [[Systems/GDPR]] — GDPR compliance
- [[Systems/Payments]] — Stripe Connect
