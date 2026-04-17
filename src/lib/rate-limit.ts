// In-memory rate limiter.
// Works for single-instance deployments. For multi-instance production
// (e.g. Vercel with multiple serverless regions), replace with
// @upstash/ratelimit backed by Redis.

interface RateWindow {
  count: number
  resetAt: number
}

const store = new Map<string, RateWindow>()

// Sweep expired entries every minute to prevent unbounded memory growth
setInterval(() => {
  const now = Date.now()
  for (const [key, window] of store.entries()) {
    if (now > window.resetAt) store.delete(key)
  }
}, 60_000).unref?.()

export function rateLimit(
  identifier: string,
  opts: { limit: number; windowMs: number }
): { ok: boolean; retryAfter?: number } {
  const now = Date.now()
  const entry = store.get(identifier)

  if (!entry || now > entry.resetAt) {
    store.set(identifier, { count: 1, resetAt: now + opts.windowMs })
    return { ok: true }
  }

  if (entry.count >= opts.limit) {
    return { ok: false, retryAfter: Math.ceil((entry.resetAt - now) / 1000) }
  }

  entry.count++
  return { ok: true }
}
