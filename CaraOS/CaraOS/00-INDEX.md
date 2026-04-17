# Cara — Knowledge Base

Multi-tenant animal shelter management platform for Irish/UK charities.

## Quick Links

### Architecture & Structure
- [[Architecture]] — System overview, stack, data flow
- [[File-Map]] — Directory structure and key files
- [[Routes]] — All pages and URL patterns

### Code
- [[Components]] — React component inventory
- [[Database]] — Prisma schema, all models and enums
- [[API-Routes]] — All API endpoints

### Features
- [[Features/Animals]] — Animal profiles, intake, medical, photos
- [[Features/Applications]] — Adoption workflow, contracts, signing
- [[Features/Shelters]] — Multi-tenancy, orgs, roles, settings

### Systems
- [[Systems/Auth]] — NextAuth, credentials, Google OAuth
- [[Systems/Image-Handling]] — Supabase Storage, photo upload
- [[Systems/Notifications]] — Resend email, templates
- [[Systems/Payments]] — Stripe, donations, campaigns
- [[Systems/GDPR]] — Consent, data requests, compliance
- [[Systems/PDF]] — Contract generation, e-signatures

### Dev
- [[Dev/Decisions]] — Architecture decisions
- [[Dev/Bugs]] — Known issues

## Stack at a Glance

| Layer | Tech |
|---|---|
| Framework | Next.js 14 App Router |
| Language | TypeScript |
| Database | PostgreSQL (Supabase) + Prisma ORM |
| Auth | NextAuth v4 (credentials + Google) |
| Storage | Supabase Storage |
| Email | Resend |
| Payments | Stripe |
| UI | Radix UI + Tailwind CSS |
| Forms | React Hook Form + Zod |
| PDF | pdf-lib |
| Hosting | Vercel |
