-- Migration: RLS policies for user_documents and guidance for storage bucket 'documents'
-- Date: 2025-08-19
-- Safe to run multiple times (IF NOT EXISTS patterns)

-- 1. Ensure table user_documents exists (skip creation if already managed elsewhere)
-- CREATE TABLE IF NOT EXISTS user_documents (
--   id BIGSERIAL PRIMARY KEY,
--   user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
--   name text NOT NULL,
--   file_path text NOT NULL UNIQUE,
--   file_size bigint,
--   mime_type text,
--   category text,
--   tags text[] DEFAULT '{}',
--   verified boolean DEFAULT false,
--   created_at timestamptz DEFAULT now()
-- );

-- 2. Enable RLS
ALTER TABLE user_documents ENABLE ROW LEVEL SECURITY;

-- 3. Policies (idempotent via catalog checks)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE polname='user_documents_select_own'
  ) THEN
    EXECUTE 'CREATE POLICY user_documents_select_own ON user_documents FOR SELECT USING (user_id = auth.uid())';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE polname='user_documents_insert_self'
  ) THEN
    EXECUTE 'CREATE POLICY user_documents_insert_self ON user_documents FOR INSERT WITH CHECK (user_id = auth.uid())';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE polname='user_documents_update_own'
  ) THEN
    EXECUTE 'CREATE POLICY user_documents_update_own ON user_documents FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid())';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE polname='user_documents_delete_own'
  ) THEN
    EXECUTE 'CREATE POLICY user_documents_delete_own ON user_documents FOR DELETE USING (user_id = auth.uid())';
  END IF;
END $$;

-- Optional: Allow an admin/service role to bypass (assumes role 'service_role')
-- COMMENT: manage with Supabase dashboard or run a separate grant.

-- 4. Tag column addition if missing
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='user_documents' AND column_name='tags'
  ) THEN
    ALTER TABLE user_documents ADD COLUMN tags text[] DEFAULT '{}';
  END IF;
END $$;

-- 5. Document categories enum simulation (not strict) – could be validated via CHECK in future

-- 6. Storage bucket policy (manual steps because Supabase storage configured outside SQL migration):
-- In Supabase dashboard > Storage > policies for bucket 'documents':
-- Example policies (SQL hints):
-- create policy "documents_read_own" on storage.objects for select using (
--   bucket_id = 'documents' AND (auth.role() = 'service_role' OR owner = auth.uid())
-- );
-- create policy "documents_insert_own" on storage.objects for insert with check (
--   bucket_id = 'documents' AND owner = auth.uid()
-- );
-- create policy "documents_delete_own" on storage.objects for delete using (
--   bucket_id = 'documents' AND owner = auth.uid()
-- );

-- 7. Index for faster user filtering
CREATE INDEX IF NOT EXISTS idx_user_documents_user_id ON user_documents(user_id);

-- 8. Future: classification tags join (document_classifications) handled by separate migration.
