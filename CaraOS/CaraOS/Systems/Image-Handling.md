# System: Image Handling

## Stack
- **Storage**: Supabase Storage
- **Bucket**: `animal-photos`
- **Client**: `src/lib/supabase.ts` (server-side only, uses service role key)
- **Upload component**: `src/components/photo-upload.tsx`

## Upload Flow

1. User selects photos in `photo-upload.tsx`
2. Component calls `POST /api/animals/[animalId]/photos`
3. API route uploads file to Supabase `animal-photos` bucket
4. Returns public URL + storage key
5. Creates `AnimalPhoto` record in DB: `{ url, key, animalId, isPrimary, position, caption }`

## AnimalPhoto Model

| Field | Notes |
|---|---|
| url | Supabase public CDN URL |
| key | Storage path (used for deletion) |
| isPrimary | Boolean — one photo per animal |
| position | Int — display order |
| caption | String? |

## Deletion

`DELETE /api/animals/[animalId]/photos/[photoId]`  
Deletes from Supabase Storage (via `key`) + removes DB record.

## Supabase Client Setup

`src/lib/supabase.ts` — lazy-initialised to avoid errors during Next.js build. Only runs server-side. Uses `SUPABASE_SERVICE_ROLE_KEY` (never exposed to browser).

## Next.js Image Config

`next.config.mjs` whitelists remote image sources:
- `*.supabase.co` — animal photos
- `lh3.googleusercontent.com` — Google OAuth avatars

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL       — project URL
SUPABASE_SERVICE_ROLE_KEY      — server-side upload key (never public)
```

## See Also
- [[Features/Animals]] — photo upload usage
- [[Database]] — AnimalPhoto model
