# Dev: Architecture Decisions

## App Router (Next.js 14)
Using the App Router with React Server Components. Most dashboard pages are RSCs — data fetched server-side via Prisma directly. Client components (`"use client"`) only where interactivity requires it.

## Multi-Tenancy via Slug
Org slug in the URL (`/:orgSlug/...`) rather than subdomain. Simpler to deploy on Vercel, no wildcard DNS needed. Slug enforced unique on `Organization`.

## NextAuth v4 (not v5)
Stable, well-documented. PrismaAdapter is mature. Google OAuth + credentials in one config. v5 still in beta at time of project start.

## Supabase for Storage (not DB)
Prisma + Supabase PostgreSQL for the database (using connection pooler for serverless). Supabase Storage for images — avoids base64 in DB, gives CDN URLs. DB operations via Prisma, never via Supabase client SDK for data.

## Resend (not SendGrid/Postmark)
Simple API, generous free tier, good DX. TypeScript SDK. Per-org custom templates stored in DB.

## pdf-lib (not Puppeteer)
Puppeteer is heavy and requires headless Chrome — bad for Vercel serverless. pdf-lib is pure JS, zero system deps, works in Edge/serverless. Trade-off: manual layout, no HTML→PDF.

## Prisma over Drizzle
Prisma chosen for maturity, type safety, and tooling. Schema-first approach suits the data model. Drizzle would be faster for raw queries but Prisma's relation handling is cleaner for this model depth.

## Token-Based Public Routes
Foster portal and contract signing use opaque UUID tokens rather than requiring accounts. Reduces friction for fosters and adopters — no account creation needed. Tokens stored in DB and validated server-side.

## Form Config in Types (not DB)
`FormConfig` interface in `src/types/form-config.ts` defines adoption form fields. Custom questions per-org stored in this config structure (likely persisted to org settings). Field definitions are code-owned, custom questions are data-owned.

## `_components` Co-location
Page-specific components live in `_components/` alongside their page rather than in `src/components/`. Global reusable components go in `src/components/`. The underscore prefix hides them from Next.js routing.

## See Also
- [[Architecture]] — system overview
- [[Dev/Bugs]] — known issues
