-- Migration: Add strict CHECK on events.importance (0-3)
-- Date: 2025-08-19
ALTER TABLE events
  ADD CONSTRAINT IF NOT EXISTS chk_events_importance_range CHECK (importance BETWEEN 0 AND 3);
