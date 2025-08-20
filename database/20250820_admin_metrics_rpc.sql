-- Central RPC for admin metrics (idempotent)
-- Returns unified JSON with key metric sections
create or replace function public.admin_dashboard_metrics()
returns json language sql security definer as $$
  with users_cte as (
    select count(*)::int total_users from public.users
  ), parcels_cte as (
    select count(*)::int total_parcels from public.parcels
  ), requests_cte as (
    select count(*)::int total_requests from public.requests
  ), sales_cte as (
    select coalesce(sum(price),0)::numeric total_sales from public.parcels where status='sold'
  ), pending_subs as (
    select count(*)::int pending_submissions from public.parcel_submissions where status='pending'
  ), user_regs as (
    select to_char(date_trunc('month', created_at),'Mon') mon, count(*)::int c
    from public.users
    where created_at >= now() - interval '6 months'
    group by 1 order by min(created_at)
  ), parcel_status as (
    select status, count(*)::int c from public.parcels group by 1
  )
  select json_build_object(
    'totals', json_build_object(
      'users',(select total_users from users_cte),
      'parcels',(select total_parcels from parcels_cte),
      'requests',(select total_requests from requests_cte),
      'sales_amount',(select total_sales from sales_cte),
      'pending_submissions',(select pending_submissions from pending_subs)
    ),
    'user_registrations', (select coalesce(json_agg(json_build_object('name',mon,'value',c)),'[]'::json) from user_regs),
    'parcel_status', (select coalesce(json_agg(json_build_object('name',status,'value',c)),'[]'::json) from parcel_status)
  );
$$;

grant execute on function public.admin_dashboard_metrics() to authenticated;
