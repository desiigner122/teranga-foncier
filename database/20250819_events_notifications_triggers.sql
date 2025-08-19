-- Migration: Critical events -> notifications + feature flag initial values
-- Date: 2025-08-19

-- Seed feature flag for event anti-spam window (ms) and importance threshold notification
INSERT INTO feature_flags(key, description, enabled, audience)
VALUES ('events_antispam_window_ms', 'Window ms for identical event client throttling', true, '{"value":5000}'),
       ('events_notify_min_importance', 'Minimum importance to create notification', true, '{"value":2}')
ON CONFLICT (key) DO NOTHING;

-- Assuming notifications table exists with columns: id (PK), user_id, title, message, type, created_at
-- Create function to fan-out notifications for critical events (importance >= threshold)
CREATE OR REPLACE FUNCTION trg_events_to_notifications()
RETURNS TRIGGER AS $$
DECLARE
  min_importance INT := 2;
  aud JSONB;
  cfg RECORD;
BEGIN
  SELECT audience INTO aud FROM feature_flags WHERE key='events_notify_min_importance' AND enabled=true;
  IF aud ? 'value' THEN min_importance := COALESCE((aud->>'value')::int,2); END IF;
  IF NEW.importance >= min_importance THEN
    -- Basic strategy: notify admin users (placeholder). Adjust to real targeting.
    INSERT INTO notifications(user_id, title, message, type, created_at)
    SELECT id, NEW.event_type, concat('Nouvel événement critique: ', NEW.event_type), 'critical_event', now()
    FROM users WHERE role='admin';
  END IF;
  RETURN NEW;
END; $$ LANGUAGE plpgsql;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname='trg_events_to_notifications') THEN
    EXECUTE 'CREATE TRIGGER trg_events_to_notifications AFTER INSERT ON events FOR EACH ROW EXECUTE PROCEDURE trg_events_to_notifications();';
  END IF;
END $$;
