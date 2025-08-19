-- Migration: Institutions, Geo Normalization, Audit Logs
-- Date: 2025-08-19
-- Description: Creates regions/departments/communes normalization, institution_profiles, audit_logs and supporting indexes + RLS.

-- =====================
-- GEO NORMALIZATION
-- =====================
CREATE TABLE IF NOT EXISTS regions (
  id SERIAL PRIMARY KEY,
  code TEXT UNIQUE,
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS departments (
  id SERIAL PRIMARY KEY,
  region_id INTEGER NOT NULL REFERENCES regions(id) ON DELETE CASCADE,
  code TEXT,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(region_id, name)
);

CREATE TABLE IF NOT EXISTS communes (
  id SERIAL PRIMARY KEY,
  department_id INTEGER NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  code TEXT,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(department_id, name)
);

CREATE INDEX IF NOT EXISTS idx_departments_region_id ON departments(region_id);
CREATE INDEX IF NOT EXISTS idx_communes_department_id ON communes(department_id);

-- Minimal seed (extend later)
INSERT INTO regions (code, name) VALUES
  ('DK', 'Dakar'),
  ('TH', 'Thiès'),
  ('SL', 'Saint-Louis')
ON CONFLICT (name) DO NOTHING;

INSERT INTO departments (region_id, code, name) VALUES
  ((SELECT id FROM regions WHERE name='Dakar'), 'DK1', 'Dakar'),
  ((SELECT id FROM regions WHERE name='Dakar'), 'DK2', 'Guédiawaye'),
  ((SELECT id FROM regions WHERE name='Dakar'), 'DK3', 'Pikine'),
  ((SELECT id FROM regions WHERE name='Thiès'), 'TH1', 'Thiès'),
  ((SELECT id FROM regions WHERE name='Saint-Louis'), 'SL1', 'Saint-Louis')
ON CONFLICT DO NOTHING;

INSERT INTO communes (department_id, code, name) VALUES
  ((SELECT d.id FROM departments d JOIN regions r ON r.id=d.region_id WHERE r.name='Dakar' AND d.name='Dakar'), 'DK1-PLAT', 'Dakar Plateau'),
  ((SELECT d.id FROM departments d JOIN regions r ON r.id=d.region_id WHERE r.name='Dakar' AND d.name='Pikine'), 'DK3-GUIN', 'Guinaw Rail'),
  ((SELECT d.id FROM departments d JOIN regions r ON r.id=d.region_id WHERE r.name='Thiès' AND d.name='Thiès'), 'TH1-TH', 'Thiès Ville')
ON CONFLICT DO NOTHING;

-- =====================
-- INSTITUTION PROFILES
-- =====================
CREATE TABLE IF NOT EXISTS institution_profiles (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  institution_type TEXT NOT NULL CHECK (institution_type IN ('Mairie','Banque','Notaire')),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  region_id INTEGER REFERENCES regions(id),
  department_id INTEGER REFERENCES departments(id),
  commune_id INTEGER REFERENCES communes(id),
  metadata JSONB DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'pending', -- pending | active | suspended
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_institution_profiles_user_id ON institution_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_institution_profiles_type ON institution_profiles(institution_type);
CREATE INDEX IF NOT EXISTS idx_institution_profiles_region ON institution_profiles(region_id);
CREATE INDEX IF NOT EXISTS idx_institution_profiles_status ON institution_profiles(status);
CREATE INDEX IF NOT EXISTS idx_institution_profiles_metadata_gin ON institution_profiles USING GIN (metadata jsonb_path_ops);
-- Optional functional index examples (uncomment if needed for frequent queries on nested JSON keys)
-- CREATE INDEX IF NOT EXISTS idx_institution_profiles_metadata_region_name ON institution_profiles USING GIN ((metadata -> 'region_name'));

-- Trigger function for updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_institution_profiles_updated
  BEFORE UPDATE ON institution_profiles
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

-- =====================
-- AUDIT LOGS
-- =====================
CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGSERIAL PRIMARY KEY,
  event_type TEXT NOT NULL,
  actor_user_id UUID REFERENCES users(id),
  target_user_id UUID REFERENCES users(id),
  target_table TEXT,
  target_id TEXT,
  metadata JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_event_type ON audit_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON audit_logs(actor_user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_target ON audit_logs(target_user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_metadata_gin ON audit_logs USING GIN (metadata jsonb_path_ops);
-- CREATE INDEX IF NOT EXISTS idx_audit_logs_event_metadata ON audit_logs USING GIN ((metadata -> 'event_subtype'));

-- =====================
-- RLS & POLICIES
-- =====================
ALTER TABLE regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE communes ENABLE ROW LEVEL SECURITY;
ALTER TABLE institution_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper: assume an is_admin boolean column on users or role='admin'. Adjust as per real schema.
CREATE OR REPLACE FUNCTION is_admin(uid UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (SELECT 1 FROM users WHERE id=uid AND (role='admin' OR is_admin = TRUE));
$$ LANGUAGE sql STABLE;

-- Regions / departments / communes: read-only for all authenticated users
CREATE POLICY geo_select_regions ON regions FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY geo_select_departments ON departments FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY geo_select_communes ON communes FOR SELECT USING (auth.role() = 'authenticated');

-- Institution profiles
CREATE POLICY institution_profiles_select ON institution_profiles
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY institution_profiles_insert ON institution_profiles
  FOR INSERT WITH CHECK (is_admin(auth.uid()));

CREATE POLICY institution_profiles_update ON institution_profiles
  FOR UPDATE USING (is_admin(auth.uid()));

-- Audit logs: only admins can see
CREATE POLICY audit_logs_select_admin ON audit_logs
  FOR SELECT USING (is_admin(auth.uid()));

-- Inserts to audit_logs from backend service role only
CREATE POLICY audit_logs_insert_service ON audit_logs
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- =====================
-- SAMPLE AUDIT FUNCTION (optional)
-- =====================
CREATE OR REPLACE FUNCTION log_audit_event(p_event_type TEXT, p_actor UUID, p_target UUID, p_table TEXT, p_id TEXT, p_metadata JSONB)
RETURNS VOID AS $$
BEGIN
  INSERT INTO audit_logs(event_type, actor_user_id, target_user_id, target_table, target_id, metadata)
  VALUES(p_event_type, p_actor, p_target, p_table, p_id, p_metadata);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Grant execute to authenticated so they can indirectly log if policy allows (optional - restrict as needed)
GRANT EXECUTE ON FUNCTION log_audit_event TO authenticated;

-- =====================
-- DONE
-- =====================
