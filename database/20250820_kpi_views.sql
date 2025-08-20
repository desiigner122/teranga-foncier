-- KPI Materialized Views & Supporting Indices
-- Transactions per month (rolling 12)
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_transactions_monthly AS
SELECT date_trunc('month', created_at) AS month,
       COUNT(*)                       AS transactions_count,
       SUM(amount)                    AS total_amount,
       AVG(amount)                    AS avg_amount
FROM transactions
WHERE created_at >= (now() - interval '12 months')
GROUP BY 1
ORDER BY 1 DESC;
CREATE INDEX IF NOT EXISTS idx_mv_transactions_monthly_month ON mv_transactions_monthly(month);

-- Notary processing times (auth time - creation)
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_notary_processing_times AS
SELECT n.id,
       n.notary_id,
       n.status,
       n.created_at,
       n.updated_at,
       EXTRACT(EPOCH FROM (n.updated_at - n.created_at)) / 3600 AS processing_hours
FROM transactions n
WHERE n.status IN ('authenticated','notarized','completed');
CREATE INDEX IF NOT EXISTS idx_mv_notary_processing_times_notary ON mv_notary_processing_times(notary_id);

-- Bank exposure by zone
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_bank_exposure_by_zone AS
SELECT g.bank_id,
       p.zone,
       SUM(g.guarantee_amount) AS total_exposure,
       COUNT(*)                AS guarantees_count
FROM bank_guarantees g
JOIN parcels p ON p.id = g.parcel_id
WHERE g.status IN ('active','pending')
GROUP BY 1,2;
CREATE INDEX IF NOT EXISTS idx_mv_bank_exposure_zone ON mv_bank_exposure_by_zone(zone);

-- Refresh helper function
CREATE OR REPLACE FUNCTION refresh_kpi_materialized_views() RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_transactions_monthly;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_notary_processing_times;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_bank_exposure_by_zone;
END;$$;

-- Suggested cron (pg_cron or external): hourly refresh
-- SELECT cron.schedule('refresh_kpis_hourly', '55 * * * *', $$SELECT refresh_kpi_materialized_views();$$);
