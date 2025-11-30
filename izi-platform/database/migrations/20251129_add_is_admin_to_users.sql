-- Migration: 2025-11-29 - Add is_admin column to users table
-- Purpose: add a boolean is_admin field to mark administrator users (default: false)
-- Run this migration using your SQL client (psql, pgAdmin, etc.)

BEGIN;

-- Add column if it doesn't already exist (idempotent)
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

COMMIT;

-- Rollback (if your migration runner doesn't support down scripts separately,
-- you can run the block below to revert this migration):
--
-- BEGIN;
-- ALTER TABLE users DROP COLUMN IF EXISTS is_admin;
-- COMMIT;

