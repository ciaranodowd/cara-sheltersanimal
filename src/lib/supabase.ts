import { createClient, SupabaseClient } from "@supabase/supabase-js"

export const ANIMAL_PHOTOS_BUCKET = "animal-photos"

/**
 * Server-side Supabase client using the service role key.
 * Only use in API routes / server components — never expose to the browser.
 *
 * Lazily initialized via Proxy so the client is only created at request time,
 * not at module load time during the Next.js build (which would throw if env
 * vars are absent in the build environment).
 */
let _client: SupabaseClient | null = null

function getClient(): SupabaseClient {
  if (!_client) {
    _client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    )
  }
  return _client
}

export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    return getClient()[prop as keyof SupabaseClient]
  },
})
