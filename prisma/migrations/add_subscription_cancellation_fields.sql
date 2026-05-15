-- Add subscription cancellation fields to Organization
-- Run in Supabase SQL editor: https://supabase.com/dashboard/project/_/sql

ALTER TABLE "Organization"
  ADD COLUMN IF NOT EXISTS "cancelAt"          TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS "canceledAt"        TIMESTAMPTZ;
