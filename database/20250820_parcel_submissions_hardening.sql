-- Hardening migration for parcel_submissions workflow
-- Date: 2025-08-20
-- Adds: constraints, review table, helper view, secure function skeletons

-- 1. Constraints (idempotent patterns)
alter table public.parcel_submissions
  add column if not exists risk_score numeric;

-- Basic positive checks (skip if already there)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_parcel_submissions_price_positive'
  ) THEN
    ALTER TABLE public.parcel_submissions
      ADD CONSTRAINT chk_parcel_submissions_price_positive CHECK (price IS NULL OR price >= 0);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_parcel_submissions_surface_positive'
  ) THEN
    ALTER TABLE public.parcel_submissions
      ADD CONSTRAINT chk_parcel_submissions_surface_positive CHECK (surface IS NULL OR surface > 0);
  END IF;
END$$;

-- Prevent duplicate active references across submissions + parcels (soft uniqueness)
create unique index if not exists uq_parcel_submissions_reference_unique_pending
  on public.parcel_submissions(reference) where status = 'pending';

-- 2. Review table
create table if not exists public.parcel_submission_reviews (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.parcel_submissions(id) on delete cascade,
  reviewer_id uuid references public.users(id),
  decision text not null check (decision in ('approved','rejected')),
  reason text,
  created_at timestamptz not null default now()
);
create index if not exists idx_ps_reviews_submission on public.parcel_submission_reviews(submission_id);

-- 3. View for audit (submissions approved but parcel_id missing)
create or replace view public.v_parcel_submission_inconsistencies as
select s.*
from public.parcel_submissions s
where s.status = 'approved' and s.parcel_id is null;

-- 4. Simple function wrappers (idempotent) for approval / rejection centralization
create or replace function public.approve_parcel_submission(p_submission uuid, p_reviewer uuid)
returns uuid language plpgsql security definer as $$
DECLARE v_sub record; v_parcel uuid; BEGIN
  select * into v_sub from public.parcel_submissions where id = p_submission for update;
  if not found then raise exception 'submission not found'; end if;
  if v_sub.status <> 'pending' then return v_sub.parcel_id; end if;
  -- create parcel (simplified) - in real case call another function
  insert into public.parcels(reference, location_name, type, price, area_sqm, status, owner_id, owner_type, verification_status)
  values(v_sub.reference, v_sub.location, v_sub.type, v_sub.price, v_sub.surface, 'available', v_sub.owner_id, 'Vendeur', 'verified')
  returning id into v_parcel;
  update public.parcel_submissions
    set status='approved', approved_at=now(), reviewer_id=p_reviewer, parcel_id=v_parcel, updated_at=now()
    where id = p_submission;
  insert into public.parcel_submission_reviews(submission_id, reviewer_id, decision)
    values(p_submission, p_reviewer, 'approved');
  return v_parcel;
END;$$;

grant execute on function public.approve_parcel_submission(uuid,uuid) to authenticated;

create or replace function public.reject_parcel_submission(p_submission uuid, p_reviewer uuid, p_reason text)
returns void language plpgsql security definer as $$
DECLARE v_sub record; BEGIN
  select * into v_sub from public.parcel_submissions where id = p_submission for update;
  if not found then raise exception 'submission not found'; end if;
  if v_sub.status <> 'pending' then return; end if;
  update public.parcel_submissions
    set status='rejected', rejected_at=now(), rejection_reason=p_reason, reviewer_id=p_reviewer, updated_at=now()
    where id = p_submission;
  insert into public.parcel_submission_reviews(submission_id, reviewer_id, decision, reason)
    values(p_submission, p_reviewer, 'rejected', p_reason);
END;$$;

grant execute on function public.reject_parcel_submission(uuid,uuid,text) to authenticated;

-- 5. RLS for reviews
alter table public.parcel_submission_reviews enable row level security;
create policy if not exists "ps_reviews_reviewer_select" on public.parcel_submission_reviews
  for select using (
    auth.uid() = reviewer_id OR
    exists(select 1 from public.parcel_submissions s where s.id = submission_id and s.owner_id = auth.uid()) OR
    exists(select 1 from public.users u where u.id = auth.uid() and u.role='admin')
  );
create policy if not exists "ps_reviews_insert_reviewer" on public.parcel_submission_reviews
  for insert with check (
    reviewer_id = auth.uid() OR exists(select 1 from public.users u where u.id = auth.uid() and u.role='admin')
  );

-- 6. TODO: Add hashing & verification pipeline externally.
