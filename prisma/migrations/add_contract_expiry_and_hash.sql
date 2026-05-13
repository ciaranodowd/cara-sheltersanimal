-- Add token expiry and document integrity hash to AdoptionContract
-- Run in Supabase SQL editor: https://supabase.com/dashboard/project/_/sql

ALTER TABLE "AdoptionContract"
  ADD COLUMN IF NOT EXISTS "tokenExpiresAt" TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS "contractHash"   TEXT;
