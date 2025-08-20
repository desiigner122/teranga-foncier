-- Table: parcel_submissions (anti-fraud gated listing workflow)
-- Generated: 2025-08-20

create table if not exists public.parcel_submissions (
  id uuid default gen_random_uuid() primary key,
  owner_id uuid not null references public.users(id) on delete cascade,
  reference text not null,
  location text,
  type text,
  price numeric,
  surface numeric,
  description text,
  documents jsonb default '[]'::jsonb,
  status text not null default 'pending', -- pending | approved | rejected
  parcel_id uuid references public.parcels(id),
  reviewer_id uuid references public.users(id),
  approved_at timestamptz,
  rejected_at timestamptz,
  rejection_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_parcel_submissions_owner on public.parcel_submissions(owner_id);
create index if not exists idx_parcel_submissions_status on public.parcel_submissions(status);
create index if not exists idx_parcel_submissions_created_at on public.parcel_submissions(created_at desc);

-- Simple RLS (adjust as needed)
alter table public.parcel_submissions enable row level security;

-- Owner can view own submissions
create policy if not exists "parcel_submissions_owner_select" on public.parcel_submissions
  for select using ( auth.uid() = owner_id );

-- Owner can insert own row
create policy if not exists "parcel_submissions_owner_insert" on public.parcel_submissions
  for insert with check ( auth.uid() = owner_id );

-- Restricted update: only admin / mairie / notaire (example: relies on custom claim 'role')
create policy if not exists "parcel_submissions_admin_update" on public.parcel_submissions
  for update using (
    exists (select 1 from public.users u where u.id = auth.uid() and (u.role = 'admin' or lower(u.type) in ('mairie','notaire')))
  );

-- Allow admins to select all
create policy if not exists "parcel_submissions_admin_select_all" on public.parcel_submissions
  for select using (
    exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin')
  );

-- Trigger to keep updated_at fresh
create or replace function public.tg_parcel_submissions_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;$$;

drop trigger if exists trg_parcel_submissions_set_updated_at on public.parcel_submissions;
create trigger trg_parcel_submissions_set_updated_at
before update on public.parcel_submissions
for each row execute function public.tg_parcel_submissions_set_updated_at();
