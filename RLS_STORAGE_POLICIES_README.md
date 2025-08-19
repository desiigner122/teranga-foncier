## RLS & Storage Policies (Documents)

This guide explains how the `user_documents` table and `documents` storage bucket are secured.

### Table: user_documents
Policies (see migration `20250819_rls_user_documents_and_storage.sql`):
1. user_documents_select_own – users read only their rows.
2. user_documents_insert_self – can insert only with their own `user_id`.
3. user_documents_update_own – can update only their rows.
4. user_documents_delete_own – can delete only their rows.

Add an elevated service / admin role via Supabase dashboard if centralized moderation needed.

### Storage Bucket: documents
Create (or verify) a bucket named `documents` in Supabase Storage.

Add policies (Storage > Policies) – adapt if Supabase UI changes:
```sql
-- Read own files (and allow service role)
create policy "documents_select_own" on storage.objects for select using (
  bucket_id = 'documents' and (auth.role() = 'service_role' or owner = auth.uid())
);

-- Upload (insert) only into own path (prefix match optional if you store userId/ prefix)
create policy "documents_insert_own" on storage.objects for insert with check (
  bucket_id = 'documents' and owner = auth.uid()
);

-- Delete own
create policy "documents_delete_own" on storage.objects for delete using (
  bucket_id = 'documents' and owner = auth.uid()
);
```

If you prefix objects by `user_id/` you can strengthen with `position(object_name, auth.uid()::text || '/') = 1`.

### Recommended Hardening
* Add virus scanning webhook (e.g. via Edge Function) before marking `verified=true`.
* Attach AI classification results into `document_classifications` linking by document id.
* Use tags (array) to store quick labels: `["identity","title","plan"]`.

### Municipal Requests Documents
When a municipal request is created we log `municipal_request.documents_uploaded` with `document_ids` referencing `user_documents.id`. Further processing (e.g., generating a consolidated dossier PDF) can run asynchronously.

### Future Enhancements
* Add CHECK constraints on category.
* Implement retention / soft delete flag.
* Add trigger to auto-log `document.deleted` on delete.
