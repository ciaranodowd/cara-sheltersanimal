-- Add missing Organization columns
-- Run in Supabase SQL editor: https://supabase.com/dashboard/project/_/sql

ALTER TABLE "Organization"
  ADD COLUMN IF NOT EXISTS "stripeCustomerId"     TEXT    UNIQUE,
  ADD COLUMN IF NOT EXISTS "stripeSubscriptionId" TEXT,
  ADD COLUMN IF NOT EXISTS "stripeAccountId"      TEXT,
  ADD COLUMN IF NOT EXISTS "stripeOnboarded"      BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS "trialStartDate"       TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS "trialEndDate"         TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS "plan"                 TEXT    NOT NULL DEFAULT 'trial',
  ADD COLUMN IF NOT EXISTS "planStatus"           TEXT    NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS "postcode"             TEXT,
  ADD COLUMN IF NOT EXISTS "charityNumber"        TEXT,
  ADD COLUMN IF NOT EXISTS "registrationNum"      TEXT,
  ADD COLUMN IF NOT EXISTS "vetName"              TEXT,
  ADD COLUMN IF NOT EXISTS "vetPhone"             TEXT,
  ADD COLUMN IF NOT EXISTS "coordinatorPhone"     TEXT;
