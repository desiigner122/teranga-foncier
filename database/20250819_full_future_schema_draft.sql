-- MONOLITHIC FUTURE SCHEMA DRAFT (Do NOT apply directly to production without review)
-- Consolidates proposed innovation roadmap structures.
-- Use feature flags + incremental migrations instead of one-shot in real practice.

-- ========================
-- Extensions
-- ========================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector; -- pgvector for embeddings

-- ========================
-- Risk Layers
-- ========================
CREATE TABLE IF NOT EXISTS risk_layers (
  id SERIAL PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category TEXT,
  description TEXT,
  source TEXT,
  geometry GEOGRAPHY, -- optional polygon
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

-- ========================
-- Ownership History
-- ========================
CREATE TABLE IF NOT EXISTS parcel_ownership_history (
  id BIGSERIAL PRIMARY KEY,
  parcel_id BIGINT REFERENCES parcels(id) ON DELETE CASCADE,
  previous_owner UUID,
  new_owner UUID,
  change_type TEXT,
  change_date TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB
);
CREATE INDEX IF NOT EXISTS idx_parcel_ownership_history_parcel ON parcel_ownership_history(parcel_id);

-- ========================
-- Embeddings (Legal / Docs)
-- ========================
CREATE TABLE IF NOT EXISTS legal_embeddings (
  id BIGSERIAL PRIMARY KEY,
  doc_type TEXT,
  doc_id BIGINT,
  chunk_index INT,
  content TEXT,
  embedding vector(1536),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_legal_embeddings_doc ON legal_embeddings(doc_id);
CREATE INDEX IF NOT EXISTS idx_legal_embeddings_vec ON legal_embeddings USING ivfflat (embedding vector_cosine_ops) WITH (lists=100);

-- ========================
-- Parcel Similarity Vectors
-- ========================
CREATE TABLE IF NOT EXISTS parcel_vectors (
  parcel_id BIGINT PRIMARY KEY REFERENCES parcels(id) ON DELETE CASCADE,
  embedding vector(768),
  model_version TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_parcel_vectors_embedding ON parcel_vectors USING ivfflat (embedding vector_cosine_ops) WITH (lists=100);

-- ========================
-- Workflows
-- ========================
CREATE TABLE IF NOT EXISTS workflows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active',
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS workflow_nodes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workflow_id UUID REFERENCES workflows(id) ON DELETE CASCADE,
  node_type TEXT NOT NULL,
  name TEXT,
  config JSONB DEFAULT '{}'::jsonb,
  position JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_workflow_nodes_workflow ON workflow_nodes(workflow_id);

CREATE TABLE IF NOT EXISTS workflow_runs (
  id BIGSERIAL PRIMARY KEY,
  workflow_id UUID REFERENCES workflows(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending',
  started_at TIMESTAMPTZ DEFAULT NOW(),
  finished_at TIMESTAMPTZ,
  trigger_source TEXT,
  context JSONB,
  result JSONB
);
CREATE INDEX IF NOT EXISTS idx_workflow_runs_workflow ON workflow_runs(workflow_id);

-- ========================
-- Fraud Scores
-- ========================
CREATE TABLE IF NOT EXISTS fraud_scores (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  score NUMERIC,
  factors JSONB,
  computed_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================
-- Usage & Billing
-- ========================
CREATE TABLE IF NOT EXISTS plans (
  id SERIAL PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  price_cents INT NOT NULL,
  currency TEXT DEFAULT 'XOF',
  interval TEXT DEFAULT 'monthly',
  features JSONB,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  plan_id INT REFERENCES plans(id),
  status TEXT DEFAULT 'active',
  started_at TIMESTAMPTZ DEFAULT NOW(),
  renew_at TIMESTAMPTZ,
  canceled_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id);

CREATE TABLE IF NOT EXISTS usage_events (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  feature TEXT NOT NULL,
  quantity INT DEFAULT 1,
  occurred_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB
);
CREATE INDEX IF NOT EXISTS idx_usage_events_user ON usage_events(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_events_feature ON usage_events(feature);

CREATE TABLE IF NOT EXISTS entitlements (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  feature TEXT NOT NULL,
  limit_value INT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, feature)
);

-- ========================
-- ROI Scenarios (Monte Carlo placeholder)
-- ========================
CREATE TABLE IF NOT EXISTS roi_scenarios (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  parcel_ids BIGINT[],
  parameters JSONB,
  simulated_at TIMESTAMPTZ DEFAULT NOW(),
  summary JSONB
);

-- ========================
-- Document Classification (tags)
-- ========================
CREATE TABLE IF NOT EXISTS document_classifications (
  id BIGSERIAL PRIMARY KEY,
  document_id BIGINT,
  label TEXT,
  confidence NUMERIC,
  model_version TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================
-- RLS ENABLE (Selective; refine before enabling in production)
-- ========================
ALTER TABLE risk_layers ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_layer_parcels ENABLE ROW LEVEL SECURITY;
ALTER TABLE parcel_ownership_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE legal_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE parcel_vectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE fraud_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE entitlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE roi_scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_classifications ENABLE ROW LEVEL SECURITY;

-- Simple read policies (tighten later)
CREATE POLICY rl_select_public_workflows ON workflows FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY rl_select_parcel_vectors ON parcel_vectors FOR SELECT USING (auth.role() = 'authenticated');

-- ========================
-- Views / Materialized Views Placeholders
-- ========================
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_usage_daily AS
SELECT user_id, feature, date_trunc('day', occurred_at) d, sum(quantity) qty
FROM usage_events GROUP BY user_id, feature, d;

-- ========================
-- TODO: Add triggers, advanced policies, indexes per feature need.
-- ========================
