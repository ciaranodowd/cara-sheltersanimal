-- Add donationsEnabled to Organization and message to Donation
-- Run in Supabase SQL editor: https://supabase.com/dashboard/project/_/sql

ALTER TABLE "Organization"
  ADD COLUMN IF NOT EXISTS "donationsEnabled" BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE "Donation"
  ADD COLUMN IF NOT EXISTS "message" TEXT;
