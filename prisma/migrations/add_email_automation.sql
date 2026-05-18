-- Cara — Schema sync for automated email system
--
-- IMPORTANT: The recommended way to apply this is via Prisma:
--
--   npx prisma db push
--
-- This syncs the full schema.prisma to your Supabase database.
-- Manual SQL option below for environments that apply migrations incrementally.

-- Track when an adoption was completed (drives follow-up email scheduling)
ALTER TABLE "AdoptionApplication"
  ADD COLUMN IF NOT EXISTS "completedAt" TIMESTAMPTZ;

-- Idempotency log for automated emails (prevents duplicate follow-up sends on cron retries)
CREATE TABLE IF NOT EXISTS "SentEmailLog" (
  "id"     TEXT        NOT NULL,
  "key"    TEXT        NOT NULL,
  "sentAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "SentEmailLog_pkey"    PRIMARY KEY ("id"),
  CONSTRAINT "SentEmailLog_key_key" UNIQUE      ("key")
);
