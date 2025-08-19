-- Migration: Materialized Views refresh functions + RPC
-- Date: 2025-08-19

-- Functions (use CONCURRENTLY only if MV has appropriate unique index & not inside transaction)
CREATE OR REPLACE FUNCTION refresh_mv_events()
RETURNS void AS $$
BEGIN
  BEGIN
    EXECUTE 'REFRESH MATERIALIZED VIEW CONCURRENTLY mv_events_daily';
  EXCEPTION WHEN OTHERS THEN
    -- fallback simple refresh if concurrently not possible
    EXECUTE 'REFRESH MATERIALIZED VIEW mv_events_daily';
  END;
END; $$ LANGUAGE plpgsql SECURITY DEFINER SET search_path=public;

CREATE OR REPLACE FUNCTION refresh_mv_price_grid()
RETURNS void AS $$
BEGIN
  BEGIN
    EXECUTE 'REFRESH MATERIALIZED VIEW CONCURRENTLY mv_parcel_price_grid';
  EXCEPTION WHEN OTHERS THEN
    EXECUTE 'REFRESH MATERIALIZED VIEW mv_parcel_price_grid';
  END;
END; $$ LANGUAGE plpgsql SECURITY DEFINER SET search_path=public;

-- Optional RPC wrapper combining both
CREATE OR REPLACE FUNCTION refresh_all_mvs()
RETURNS json AS $$
DECLARE
  started_at timestamptz := now();
BEGIN
  PERFORM refresh_mv_events();
  PERFORM refresh_mv_price_grid();
  RETURN json_build_object('ok', true, 'refreshed', ARRAY['mv_events_daily','mv_parcel_price_grid'], 'took_ms', (extract(epoch from (now()-started_at))*1000)::int);
END; $$ LANGUAGE plpgsql SECURITY DEFINER SET search_path=public;

GRANT EXECUTE ON FUNCTION refresh_mv_events() TO authenticated;
GRANT EXECUTE ON FUNCTION refresh_mv_price_grid() TO authenticated;
GRANT EXECUTE ON FUNCTION refresh_all_mvs() TO authenticated;
