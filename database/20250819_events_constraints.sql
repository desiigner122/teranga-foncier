-- Migration: Events constraints (pattern & size) + optional GIN index
-- Date: 2025-08-19

ALTER TABLE events
  ADD CONSTRAINT IF NOT EXISTS chk_events_event_type_pattern CHECK (event_type ~ '^[a-z]+(\.[a-z_]+)+$');

-- Limit data JSON size (~10 KB) via trigger (cannot directly CHECK length of jsonb)
CREATE OR REPLACE FUNCTION trg_events_limit_data_size()
RETURNS TRIGGER AS $$
DECLARE
  byte_len INT;
BEGIN
  byte_len := length(encode(convert_to(COALESCE(NEW.data::text,'{}'),'UTF8'),'escape'));
  IF byte_len > 10000 THEN
    RAISE EXCEPTION 'events.data too large (% bytes > 10000)', byte_len;
  END IF;
  RETURN NEW;
END; $$ LANGUAGE plpgsql;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname='trg_events_limit_data_size') THEN
    EXECUTE 'CREATE TRIGGER trg_events_limit_data_size BEFORE INSERT OR UPDATE ON events FOR EACH ROW EXECUTE PROCEDURE trg_events_limit_data_size();';
  END IF;
END $$;

-- Optional GIN index for querying inside data (safe no-op if already exists with same name)
CREATE INDEX IF NOT EXISTS idx_events_data_gin ON events USING GIN (data jsonb_path_ops);
