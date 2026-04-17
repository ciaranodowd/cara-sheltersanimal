# System: Authentication

## Stack
- **NextAuth v4.24.13**
- **Adapter**: `@next-auth/prisma-adapter`
- **Session**: JWT (30-day max age)
- **Config**: `src/lib/auth.ts`
- **Route handler**: `src/app/api/auth/[...nextauth]/route.ts`

## Providers

### Credentials (email + password)
- Password hashed with bcryptjs
- Rate limited: 10 failed attempts per email per 15 minutes (`src/lib/rate-limit.ts`)
- Registration: `POST /api/auth/register`
- Password reset: `POST /api/auth/forgot-password`

### Google OAuth (optional)
- Requires `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET` in env
- Auto-disabled if env vars missing

## Session Data

The JWT session includes:
- `user.id` — User DB id
- `user.email`, `user.name`, `user.image`
- `user.organizations` — array of `{ orgId, slug, role }`

TypeScript types augmented in `src/types/next-auth.d.ts`.

## Route Protection

`src/middleware.ts` intercepts all `/(dashboard)/...` routes and redirects unauthenticated users to `/login`.

Portal, foster, and sign routes are **public** — no session required.

## Key Files

| File | Purpose |
|---|---|
| `src/lib/auth.ts` | NextAuth config, helper functions |
| `src/app/api/auth/[...nextauth]/route.ts` | NextAuth route handler |
| `src/app/api/auth/register/route.ts` | User registration |
| `src/app/api/auth/forgot-password/route.ts` | Password reset |
| `src/types/next-auth.d.ts` | Session type augmentation |
| `src/middleware.ts` | Route guard |

## Environment Variables

```
NEXTAUTH_URL       — canonical site URL
NEXTAUTH_SECRET    — JWT signing secret (openssl rand -base64 32)
GOOGLE_CLIENT_ID   — optional
GOOGLE_CLIENT_SECRET — optional
```

## Database Models

- `User` — core user record, stores bcrypt password for credentials
- `Account` — OAuth provider links
- `Session` — active sessions
- `VerificationToken` — email verification

## See Also
- [[Database]] — User, Account, Session models
- [[Features/Shelters]] — org roles and team invites
