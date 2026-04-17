# Architecture

## Overview

Cara is a multi-tenant SaaS platform. Each shelter is an `Organization`. All data is scoped by `organizationId`. Users belong to one or more orgs with a role.

## Request Flow

```
Browser → Next.js Middleware (auth check)
       → App Router (RSC / Server Actions / Route Handlers)
       → Prisma ORM
       → PostgreSQL (Supabase)
```

## Route Groups

| Group | Path Pattern | Purpose |
|---|---|---|
| `(auth)` | `/login`, `/register`, `/forgot-password` | Unauthenticated pages |
| `(dashboard)` | `/[orgSlug]/...` | Staff dashboard (protected) |
| `portal` | `/portal/[orgSlug]/...` | Public adoption portal |
| `foster` | `/foster/[token]` | Token-gated foster portal |
| `sign` | `/sign/[token]` | Contract signing (public) |
| root | `/`, `/onboarding` | Landing + org creation |

## Multi-Tenancy

- Every dashboard URL includes `[orgSlug]`
- Middleware (`src/middleware.ts`) enforces session on dashboard routes
- API routes check `organizationId` from session before any DB query
- Roles: `ADMIN > STAFF > VOLUNTEER > FOSTER`

## External Services

```
Cara App
 ├── Supabase PostgreSQL  — primary database (pooler + direct URL)
 ├── Supabase Storage     — animal-photos bucket
 ├── Resend               — transactional email
 ├── Stripe               — adoption fees + donations
 └── Google OAuth         — optional SSO
```

## Data Scoping Pattern

Every model that holds shelter data has `organizationId`. Queries always filter by org derived from the authenticated session's org membership.

## Key Libraries

- `src/lib/auth.ts` — NextAuth config, session helpers
- `src/lib/prisma.ts` — Prisma client singleton
- `src/lib/supabase.ts` — Supabase client (server-side only)
- `src/lib/email.ts` — Resend email helpers
- `src/lib/pdf.ts` — pdf-lib contract generation
- `src/lib/constants.ts` — Enums, labels, counties list
- `src/lib/rate-limit.ts` — Login rate limiter

## Security Headers

Set in `next.config.mjs`: X-Frame-Options, X-Content-Type-Options, HSTS, CORS (locked to NEXTAUTH_URL in prod).

## See Also
- [[Database]] — full schema
- [[Systems/Auth]] — auth detail
- [[File-Map]] — directory layout
