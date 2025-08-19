-- Massive Batch Foundation Migration (Aggregated Core Structures)
-- Date: 2025-08-19
-- WARNING: This aggregates multiple conceptual phases for convenience.
-- Apply ONLY if you intentionally accept a broad schema expansion.
-- Idempotent guards (IF NOT EXISTS) used where safe.

-- =====================
-- EXTENSIONS (safeguarded)
-- =====================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector; -- for embeddings (already in draft maybe)

-- =====================
-- EVENTS (Generic Timeline Backbone)
-- =====================
CREATE TABLE IF NOT EXISTS events (
  id BIGSERIAL PRIMARY KEY,
  entity_type TEXT NOT NULL,                 -- e.g. 'parcel','institution','user','workflow','document'
  entity_id TEXT NOT NULL,                   -- flexible to allow UUID, BIGINT, etc.
  event_type TEXT NOT NULL,                  -- e.g. 'parcel.created','parcel.price_changed'
  actor_user_id UUID REFERENCES users(id),   -- nullable for system events
  importance SMALLINT DEFAULT 0,             -- 0=info,1=notice,2=warn,3=critical
  source TEXT DEFAULT 'system',              -- 'system','user','ai','import'
  data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_events_entity ON events(entity_type, entity_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_event_type ON events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_actor ON events(actor_user_id);
CREATE INDEX IF NOT EXISTS idx_events_importance ON events(importance);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;
-- Basic policy: all authenticated can read events for now (tighten per entity later)
CREATE POLICY events_select ON events FOR SELECT USING (auth.role() = 'authenticated');
-- Insert restricted to service or admin for integrity; adapt if end-users produce events directly
CREATE OR REPLACE FUNCTION is_admin(uid UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (SELECT 1 FROM users WHERE id=uid AND (role='admin' OR is_admin = TRUE));
$$ LANGUAGE sql STABLE;
CREATE POLICY events_insert ON events FOR INSERT WITH CHECK (auth.role() = 'service_role' OR is_admin(auth.uid()));

-- Helper function for uniform event logging
CREATE OR REPLACE FUNCTION log_event(p_entity_type TEXT, p_entity_id TEXT, p_event_type TEXT, p_actor UUID, p_importance SMALLINT, p_source TEXT, p_data JSONB)
RETURNS VOID AS $$
BEGIN
  INSERT INTO events(entity_type, entity_id, event_type, actor_user_id, importance, source, data)
  VALUES(p_entity_type, p_entity_id, p_event_type, p_actor, COALESCE(p_importance,0), COALESCE(p_source,'system'), COALESCE(p_data,'{}'::jsonb));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
GRANT EXECUTE ON FUNCTION log_event TO authenticated; -- optionally restrict

-- =====================
-- PARCEL PRICE HISTORY + TRIGGER
-- =====================
-- Stores historical price changes to support timelines & analytics
CREATE TABLE IF NOT EXISTS parcel_price_history (
  id BIGSERIAL PRIMARY KEY,
  parcel_id BIGINT REFERENCES parcels(id) ON DELETE CASCADE,
  old_price NUMERIC,
  new_price NUMERIC,
  changed_at TIMESTAMPTZ DEFAULT NOW(),
  actor_user_id UUID,
  source TEXT DEFAULT 'system',
  metadata JSONB
);
CREATE INDEX IF NOT EXISTS idx_parcel_price_history_parcel ON parcel_price_history(parcel_id, changed_at DESC);

ALTER TABLE parcel_price_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY pph_select ON parcel_price_history FOR SELECT USING (auth.role() = 'authenticated');

-- Trigger to capture price changes (assumes parcels table has a 'price' column; adjust if named differently)
CREATE OR REPLACE FUNCTION trg_capture_parcel_price_change()
RETURNS TRIGGER AS $$
DECLARE
  v_old NUMERIC;
  v_new NUMERIC;
BEGIN
  v_old := OLD.price;
  v_new := NEW.price;
  IF v_old IS DISTINCT FROM v_new THEN
    INSERT INTO parcel_price_history(parcel_id, old_price, new_price, actor_user_id, source, metadata)
    VALUES(OLD.id, v_old, v_new, NULL, 'trigger', jsonb_build_object('reason','update'));
    PERFORM log_event('parcel', OLD.id::text, 'parcel.price_changed', NULL, 0, 'trigger', jsonb_build_object('old_price', v_old, 'new_price', v_new));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='parcels') THEN
    -- Safe create trigger if not exists pattern
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_parcel_price_change') THEN
      EXECUTE 'CREATE TRIGGER trg_parcel_price_change BEFORE UPDATE ON parcels FOR EACH ROW EXECUTE PROCEDURE trg_capture_parcel_price_change();';
    END IF;
  END IF;
END;$$;

-- =====================
-- CONSOLIDATED MATERIALIZED VIEWS (placeholders)
-- =====================
-- Daily event aggregation for quick timeline summaries
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_events_daily AS
SELECT entity_type, entity_id, date_trunc('day', created_at) AS day, count(*) AS event_count
FROM events
GROUP BY entity_type, entity_id, day;
CREATE INDEX IF NOT EXISTS idx_mv_events_daily_entity ON mv_events_daily(entity_type, entity_id, day DESC);

-- =====================
-- USAGE SNAPSHOT (if usage_events exists, else safe no-op view attempt)
-- =====================
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_usage_daily AS
SELECT user_id, feature, date_trunc('day', occurred_at) AS d, sum(quantity) qty
FROM usage_events
GROUP BY user_id, feature, d;

-- =====================
-- RISK LAYER ASSOCIATION (from draft) -- optional lightweight indexes
-- (Assumes tables from draft applied separately; kept here for completeness guards)
CREATE TABLE IF NOT EXISTS risk_layers (
  id SERIAL PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category TEXT,
  description TEXT,
  source TEXT,
  geometry GEOGRAPHY,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS risk_layer_parcels (
  risk_layer_id INTEGER REFERENCES risk_layers(id) ON DELETE CASCADE,
  parcel_id BIGINT REFERENCES parcels(id) ON DELETE CASCADE,
  impact_level TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  PRIMARY KEY (risk_layer_id, parcel_id)
);
ALTER TABLE risk_layers ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_layer_parcels ENABLE ROW LEVEL SECURITY;
CREATE POLICY risk_layers_select ON risk_layers FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY risk_layer_parcels_select ON risk_layer_parcels FOR SELECT USING (auth.role() = 'authenticated');

-- =====================
-- VIEW: Unified parcel timeline (joins events + price history)
-- =====================
CREATE OR REPLACE VIEW parcel_timeline AS
SELECT e.id as timeline_id,
       e.created_at,
       e.event_type,
       e.importance,
       e.actor_user_id,
       e.data,
       NULL::NUMERIC AS old_price,
       NULL::NUMERIC AS new_price,
       e.entity_id::BIGINT AS parcel_id,
       'event'::TEXT AS source_type
FROM events e
WHERE e.entity_type='parcel'
UNION ALL
SELECT ph.id as timeline_id,
       ph.changed_at as created_at,
       'parcel.price_changed' as event_type,
       0 as importance,
       ph.actor_user_id,
       ph.metadata as data,
       ph.old_price,
       ph.new_price,
       ph.parcel_id,
       'price_history'::TEXT AS source_type
FROM parcel_price_history ph;

-- =====================
-- INDEX / PERFORMANCE NOTES
-- * Consider partitioning events by month when row count > 10M.
-- * Add GIN index on events.data if deep querying by JSON fields becomes frequent.
-- =====================
-- END
