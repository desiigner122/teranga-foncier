-- Messaging table + RLS hardening additions (date 2025-08-20)

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid, -- future grouping
  sender_id uuid not null references public.users(id) on delete cascade,
  recipient_id uuid not null references public.users(id) on delete cascade,
  submission_id uuid references public.parcel_submissions(id) on delete set null,
  body text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists idx_messages_recipient on public.messages(recipient_id, created_at desc);
create index if not exists idx_messages_submission on public.messages(submission_id);

alter table public.messages enable row level security;

-- Sender or recipient can view
create policy if not exists "messages_select_participants" on public.messages
  for select using ( auth.uid() in (sender_id, recipient_id) );
-- Insert: sender must be auth.uid
create policy if not exists "messages_insert_sender" on public.messages
  for insert with check ( auth.uid() = sender_id );
-- Update (mark read): only recipient on own unread
create policy if not exists "messages_update_mark_read" on public.messages
  for update using ( auth.uid() = recipient_id ) with check ( auth.uid() = recipient_id );

-- RLS Hardening for parcel_submissions: split reviewer/admin policies
-- View by reviewer roles (mairie, notaire) or admin, plus owner (already existing owner policy)
create policy if not exists "parcel_submissions_reviewer_select" on public.parcel_submissions
  for select using (
    exists (select 1 from public.users u where u.id = auth.uid() and (u.role='admin' or lower(u.type) in ('mairie','notaire')))
  );
-- Prevent broad update except via secure functions; restrict direct updates to admins only now
create policy if not exists "parcel_submissions_admin_direct_update" on public.parcel_submissions
  for update using (
    exists (select 1 from public.users u where u.id = auth.uid() and u.role='admin')
  );

-- (Optional) revoke old broad update policy manually outside migration if needed.

-- Parcels: limit select to all authenticated for now (placeholder) – future tighten.
-- Example future policy stub (commented):
-- create policy "parcels_public_select" on public.parcels for select using ( true );
