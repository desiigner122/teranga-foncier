-- Migration: Document upload & classification, Institution status triggers
-- Date: 2025-08-19
-- Assumes tables: user_documents (upload), document_classifications (classification), institution_profiles

-- Document uploaded event (AFTER INSERT)
CREATE OR REPLACE FUNCTION trg_log_document_uploaded()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM log_event('document', NEW.id::text, 'document.uploaded', NEW.user_id, 0, 'trigger', jsonb_build_object('name', NEW.name, 'category', NEW.category));
  RETURN NEW;
END; $$ LANGUAGE plpgsql;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='user_documents') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname='trg_document_uploaded') THEN
      EXECUTE 'CREATE TRIGGER trg_document_uploaded AFTER INSERT ON user_documents FOR EACH ROW EXECUTE PROCEDURE trg_log_document_uploaded();';
    END IF;
  END IF;
END $$;

-- Document classified event (AFTER INSERT on document_classifications)
CREATE OR REPLACE FUNCTION trg_log_document_classified()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM log_event('document', COALESCE(NEW.document_id,0)::text, 'document.classified', NULL, 0, 'trigger', jsonb_build_object('label', NEW.label, 'confidence', NEW.confidence));
  RETURN NEW;
END; $$ LANGUAGE plpgsql;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='document_classifications') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname='trg_document_classified') THEN
      EXECUTE 'CREATE TRIGGER trg_document_classified AFTER INSERT ON document_classifications FOR EACH ROW EXECUTE PROCEDURE trg_log_document_classified();';
    END IF;
  END IF;
END $$;

-- Institution status change (BEFORE UPDATE)
CREATE OR REPLACE FUNCTION trg_capture_institution_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    PERFORM log_event('institution', OLD.id::text, 'institution.status_updated', NULL, 1, 'trigger', jsonb_build_object('old_status', OLD.status, 'new_status', NEW.status));
  END IF;
  RETURN NEW;
END; $$ LANGUAGE plpgsql;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='institution_profiles') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname='trg_institution_status_change') THEN
      EXECUTE 'CREATE TRIGGER trg_institution_status_change BEFORE UPDATE ON institution_profiles FOR EACH ROW EXECUTE PROCEDURE trg_capture_institution_status_change();';
    END IF;
  END IF;
END $$;
