-- Migration: Adjust events insert policy to allow authenticated users to write standard events
-- Date: 2025-08-19
-- Rationale: enable client-side logging (favorites, searches, document uploads) without requiring admin role.

DO $$ BEGIN
  -- Drop old policy if exists
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'events' AND policyname = 'events_insert'
  ) THEN
    EXECUTE 'DROP POLICY events_insert ON events';
  END IF;
END $$;

-- New broader insert policy: any authenticated user can insert; tighten later with CHECK clauses (e.g. allowed event_type patterns)
CREATE POLICY events_insert ON events FOR INSERT WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'service_role');
