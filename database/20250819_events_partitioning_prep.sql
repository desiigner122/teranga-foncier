-- Prep script for future monthly partitioning of events table
-- Not applied yet (illustrative). Convert main table to partitioned when row count large.

-- Example plan (do not run blindly in prod):
-- 1. Create new partitioned table events_new partition by RANGE (created_at)
-- 2. Create partitions events_2025_08 etc.
-- 3. Copy data, swap names, re-create indexes & policies.
-- 4. Drop old table.

-- Skeleton definitions commented out:
/*
CREATE TABLE events_new (
  LIKE events INCLUDING ALL
) PARTITION BY RANGE (created_at);

CREATE TABLE events_2025_08 PARTITION OF events_new
FOR VALUES FROM ('2025-08-01') TO ('2025-09-01');
*/

-- Future function to auto create next month partition.
/*
CREATE OR REPLACE FUNCTION ensure_events_partition(p_date date)
RETURNS void AS $$
DECLARE
  start_ts date := date_trunc('month', p_date)::date;
  end_ts date := (start_ts + INTERVAL '1 month')::date;
  part_name text := 'events_' || to_char(start_ts,'YYYY_MM');
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_class WHERE relname = part_name
  ) THEN
    EXECUTE format('CREATE TABLE %I PARTITION OF events FOR VALUES FROM (%L) TO (%L);', part_name, start_ts, end_ts);
  END IF;
END; $$ LANGUAGE plpgsql;
*/
