import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

// Null when env vars aren't configured (local dev without Upstash).
// All rate limit checks silently allow through in that case.
const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null

function makeLimiter(limiter: Ratelimit["limiter"], prefix: string): Ratelimit | null {
  if (!redis) return null
  return new Ratelimit({ redis, limiter, analytics: true, prefix })
}

export const rateLimiters = {
  login: makeLimiter(Ratelimit.slidingWindow(5, "15 m"), "cara:login"),
  register: makeLimiter(Ratelimit.slidingWindow(3, "1 h"), "cara:register"),
  passwordReset: makeLimiter(Ratelimit.slidingWindow(3, "15 m"), "cara:password-reset"),
  adoptionApplication: makeLimiter(Ratelimit.slidingWindow(5, "1 h"), "cara:adoption-apply"),
  contractSigning: makeLimiter(Ratelimit.slidingWindow(10, "1 h"), "cara:contract-sign"),
  portalMessage: makeLimiter(Ratelimit.slidingWindow(30, "1 h"), "cara:portal-msg"),
  api: makeLimiter(Ratelimit.slidingWindow(60, "1 m"), "cara:api"),
}

export function getIP(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")
  return forwarded ? forwarded.split(",")[0].trim() : "127.0.0.1"
}

export async function checkRateLimit(
  limiter: Ratelimit | null,
  identifier: string
): Promise<Response | null> {
  if (!limiter) return null // Upstash not configured — allow through
  const { success, limit, remaining, reset } = await limiter.limit(identifier)
  if (!success) {
    const retryAfter = Math.ceil((reset - Date.now()) / 1000)
    return new Response(
      JSON.stringify({ error: "Too many requests. Please try again later.", retryAfter }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "X-RateLimit-Limit": limit.toString(),
          "X-RateLimit-Remaining": remaining.toString(),
          "X-RateLimit-Reset": reset.toString(),
          "Retry-After": retryAfter.toString(),
        },
      }
    )
  }
  return null
}
