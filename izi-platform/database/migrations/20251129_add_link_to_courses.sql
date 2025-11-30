-- Migration: 2025-11-29 - Add link column to courses table
-- Purpose: add a link field (text) to courses

BEGIN;

ALTER TABLE courses
  ADD COLUMN IF NOT EXISTS link TEXT;

COMMIT;

-- Rollback (commented):
-- BEGIN;
-- ALTER TABLE courses DROP COLUMN IF EXISTS link;
-- COMMIT;

