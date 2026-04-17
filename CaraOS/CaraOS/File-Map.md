# File Map

## Root

```
/c/Projects/cara/
├── prisma/
│   ├── schema.prisma          ← all models + enums
│   └── migrations/
│       └── add_application_fields.sql
├── public/logo.svg
├── src/
│   ├── app/                   ← Next.js App Router
│   ├── components/            ← shared React components
│   ├── lib/                   ← utility libraries
│   ├── types/                 ← TypeScript definitions
│   ├── middleware.ts           ← route protection
│   ├── globals.css
│   └── providers.tsx          ← client providers wrapper
├── .env / .env.example
├── next.config.mjs
├── tailwind.config.ts
└── package.json
```

## src/app — Route Tree

```
app/
├── page.tsx                           /  (landing page)
├── layout.tsx                         root layout
├── onboarding/page.tsx                /onboarding
│
├── (auth)/
│   ├── layout.tsx
│   ├── login/
│   │   ├── page.tsx
│   │   └── LoginForm.tsx
│   ├── register/page.tsx
│   └── forgot-password/page.tsx
│
├── (dashboard)/[orgSlug]/
│   ├── layout.tsx                     dashboard shell + sidebar
│   ├── page.tsx                       dashboard home
│   ├── animals/
│   │   ├── page.tsx                   animals list
│   │   ├── new/page.tsx
│   │   └── [animalId]/
│   │       ├── page.tsx               animal detail
│   │       ├── edit/page.tsx
│   │       ├── _components/assign-foster-modal.tsx
│   │       ├── foster/new/page.tsx + _components/foster-assign-form.tsx
│   │       └── medical/new/page.tsx + _components/medical-record-form.tsx
│   ├── adoptions/
│   │   ├── page.tsx                   applications list
│   │   ├── rejected/page.tsx
│   │   └── [appId]/
│   │       ├── page.tsx
│   │       └── contract/page.tsx
│   ├── donations/
│   │   ├── page.tsx
│   │   ├── new/page.tsx + _components/donation-form.tsx
│   │   └── campaigns/
│   │       ├── page.tsx
│   │       └── [campaignId]/page.tsx
│   ├── people/
│   │   ├── page.tsx
│   │   ├── new/page.tsx + _components/person-form.tsx
│   │   ├── adopters/[adopterId]/page.tsx
│   │   ├── fosters/[fosterId]/page.tsx
│   │   ├── donors/[donorId]/page.tsx
│   │   └── volunteers/[volunteerId]/page.tsx
│   ├── foster/page.tsx                foster overview
│   ├── reports/page.tsx
│   ├── portal/page.tsx                portal management
│   └── settings/
│       ├── page.tsx
│       ├── profile/page.tsx
│       └── _components/
│           ├── org-settings-form.tsx
│           ├── contract-template-settings.tsx
│           ├── gdpr-settings.tsx
│           └── team-settings.tsx
│
├── portal/[orgSlug]/
│   ├── page.tsx                       public animals listing
│   ├── animals/[animalId]/page.tsx    public animal profile
│   └── adopt/[animalId]/
│       ├── page.tsx
│       └── apply/page.tsx             adoption application form
│
├── foster/[token]/
│   ├── page.tsx                       foster portal
│   └── _components/updates-panel.tsx
│
├── sign/[token]/page.tsx              contract signing
│
└── api/                               ← see [[API-Routes]]
```

## src/lib — Utilities

| File | Purpose |
|---|---|
| `auth.ts` | NextAuth config, session helpers |
| `prisma.ts` | Prisma client singleton |
| `supabase.ts` | Supabase Storage client (server only) |
| `email.ts` | Resend email functions |
| `pdf.ts` | pdf-lib contract generation |
| `constants.ts` | Display labels, counties list |
| `rate-limit.ts` | Login rate limiter |

## src/types

| File | Purpose |
|---|---|
| `next-auth.d.ts` | Session type augmentation |
| `form-config.ts` | `FormConfig` interface, adoption form field definitions |

## src/components

| Path | Purpose |
|---|---|
| `layout/sidebar.tsx` | Main nav sidebar |
| `layout/mobile-nav.tsx` | Mobile navigation |
| `photo-upload.tsx` | Animal photo gallery manager |
| `microchip-lookup.tsx` | Microchip registry lookup |
| `share-animal-button.tsx` | Social share buttons |
| `ui/` | Radix UI primitives (button, dialog, select…) |

## See Also
- [[Routes]] — URL patterns
- [[Components]] — component details
- [[API-Routes]] — API endpoint list
