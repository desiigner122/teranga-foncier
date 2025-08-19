-- Migration: Parcel status change trigger to record events
-- Date: 2025-08-19

CREATE OR REPLACE FUNCTION trg_capture_parcel_status_change()
RETURNS TRIGGER AS $$
DECLARE
  old_status TEXT;
  new_status TEXT;
BEGIN
  old_status := OLD.status;
  new_status := NEW.status;
  IF old_status IS DISTINCT FROM new_status THEN
    PERFORM log_event('parcel', OLD.id::text, 'parcel.status_updated', NULL, 1, 'trigger', jsonb_build_object('old_status', old_status, 'new_status', new_status));
  END IF;
  RETURN NEW;
END; $$ LANGUAGE plpgsql;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='parcels') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_parcel_status_change') THEN
      EXECUTE 'CREATE TRIGGER trg_parcel_status_change BEFORE UPDATE ON parcels FOR EACH ROW EXECUTE PROCEDURE trg_capture_parcel_status_change();';
    END IF;
  END IF;
END $$;
