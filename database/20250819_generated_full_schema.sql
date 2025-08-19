-- GENERATED FULL SCHEMA (from AI prompt) - apply carefully; idempotent guards included.
-- Date: 2025-08-19

-- Helper: safe add column
CREATE OR REPLACE FUNCTION add_column_if_not_exists(t_name text, c_name text, c_def text) RETURNS void AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_name = t_name AND column_name = c_name
  ) THEN
    EXECUTE format('ALTER TABLE %I ADD COLUMN %s %s', t_name, c_name, c_def);
  END IF;
END;$$ LANGUAGE plpgsql;

-- USERS augment
SELECT add_column_if_not_exists('users','full_name','text');
SELECT add_column_if_not_exists('users','type','text');
SELECT add_column_if_not_exists('users','is_active','boolean DEFAULT true');
SELECT add_column_if_not_exists('users','deleted_at','timestamptz');
SELECT add_column_if_not_exists('users','verification_status','text DEFAULT ''unverified''');
SELECT add_column_if_not_exists('users','assigned_agent_id','uuid REFERENCES users(id)');

CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_type ON users(type);
CREATE INDEX IF NOT EXISTS idx_users_assigned_agent ON users(assigned_agent_id);
CREATE INDEX IF NOT EXISTS idx_users_active_not_deleted ON users(is_active) WHERE deleted_at IS NULL;

-- ROLES
CREATE TABLE IF NOT EXISTS roles (
  id SERIAL PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  label TEXT NOT NULL,
  description TEXT,
  feature_flags JSONB DEFAULT '[]'::jsonb,
  default_permissions JSONB DEFAULT '[]'::jsonb,
  is_system BOOLEAN DEFAULT false,
  is_protected BOOLEAN DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE TABLE IF NOT EXISTS user_roles (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role_id INT REFERENCES roles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY(user_id, role_id)
);

-- FEATURE FLAGS
CREATE TABLE IF NOT EXISTS feature_flags (
  id BIGSERIAL PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  label TEXT,
  description TEXT,
  audience JSONB,
  enabled BOOLEAN DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- GEO HIERARCHY
CREATE TABLE IF NOT EXISTS regions (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT UNIQUE
);
CREATE TABLE IF NOT EXISTS departments (
  id BIGSERIAL PRIMARY KEY,
  region_id BIGINT REFERENCES regions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT,
  UNIQUE(region_id,name)
);
CREATE INDEX IF NOT EXISTS idx_departments_region ON departments(region_id);
CREATE TABLE IF NOT EXISTS communes (
  id BIGSERIAL PRIMARY KEY,
  department_id BIGINT REFERENCES departments(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT,
  UNIQUE(department_id,name)
);
CREATE INDEX IF NOT EXISTS idx_communes_department ON communes(department_id);

-- INSTITUTIONS
CREATE TABLE IF NOT EXISTS institution_profiles (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) UNIQUE,
  institution_type TEXT,
  name TEXT,
  slug TEXT UNIQUE,
  status TEXT DEFAULT 'pending',
  region_id BIGINT REFERENCES regions(id),
  department_id BIGINT REFERENCES departments(id),
  commune_id BIGINT REFERENCES communes(id),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_institution_type_status ON institution_profiles(institution_type,status);
CREATE INDEX IF NOT EXISTS idx_institution_region ON institution_profiles(region_id);

-- PARCELS (augment if exists)
CREATE TABLE IF NOT EXISTS parcels (
  id BIGSERIAL PRIMARY KEY,
  reference TEXT UNIQUE,
  owner_id UUID REFERENCES users(id),
  status TEXT DEFAULT 'draft',
  type TEXT,
  area_sqm NUMERIC,
  price NUMERIC,
  location_name TEXT,
  region_id BIGINT REFERENCES regions(id),
  department_id BIGINT REFERENCES departments(id),
  commune_id BIGINT REFERENCES communes(id),
  coordinates geography(Point,4326),
  metadata JSONB DEFAULT '{}'::jsonb,
  documents JSONB DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  is_featured BOOLEAN DEFAULT false,
  verification_status TEXT DEFAULT 'pending'
);
CREATE INDEX IF NOT EXISTS idx_parcels_status ON parcels(status);
CREATE INDEX IF NOT EXISTS idx_parcels_owner ON parcels(owner_id);
CREATE INDEX IF NOT EXISTS idx_parcels_geo ON parcels(region_id,department_id,commune_id);
CREATE INDEX IF NOT EXISTS idx_parcels_featured ON parcels(is_featured) WHERE is_featured = true;

-- REQUESTS
CREATE TABLE IF NOT EXISTS requests (
  id BIGSERIAL PRIMARY KEY,
  reference TEXT UNIQUE,
  user_id UUID REFERENCES users(id),
  recipient_type TEXT,
  recipient_user_id UUID REFERENCES users(id),
  parcel_id BIGINT REFERENCES parcels(id),
  request_type TEXT,
  status TEXT DEFAULT 'pending',
  message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  closed_at timestamptz
);
CREATE INDEX IF NOT EXISTS idx_requests_user ON requests(user_id);
CREATE INDEX IF NOT EXISTS idx_requests_recipient ON requests(recipient_user_id);
CREATE INDEX IF NOT EXISTS idx_requests_parcel ON requests(parcel_id);
CREATE INDEX IF NOT EXISTS idx_requests_status ON requests(status);
CREATE INDEX IF NOT EXISTS idx_requests_type_status ON requests(request_type,status);

-- TRANSACTIONS
CREATE TABLE IF NOT EXISTS transactions (
  id BIGSERIAL PRIMARY KEY,
  reference TEXT UNIQUE,
  parcel_id BIGINT REFERENCES parcels(id),
  buyer_id UUID REFERENCES users(id),
  seller_id UUID REFERENCES users(id),
  agent_id UUID REFERENCES users(id),
  notaire_id UUID REFERENCES users(id),
  type TEXT,
  status TEXT DEFAULT 'pending',
  amount NUMERIC,
  currency TEXT DEFAULT 'XOF',
  payment_method TEXT,
  description TEXT,
  documents JSONB DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  completed_at timestamptz
);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_buyer ON transactions(buyer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_seller ON transactions(seller_id);

-- PAYMENTS
CREATE TABLE IF NOT EXISTS payments (
  id BIGSERIAL PRIMARY KEY,
  transaction_id BIGINT REFERENCES transactions(id) ON DELETE CASCADE,
  reference TEXT UNIQUE,
  amount NUMERIC,
  currency TEXT DEFAULT 'XOF',
  status TEXT DEFAULT 'pending',
  method TEXT,
  provider TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  paid_at timestamptz
);
CREATE INDEX IF NOT EXISTS idx_payments_tx ON payments(transaction_id);
CREATE INDEX IF NOT EXISTS idx_payments_status_pending ON payments(status) WHERE status='pending';

-- PAYMENT METHODS CATALOG
CREATE TABLE IF NOT EXISTS payment_methods (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT,
  providers TEXT[],
  enabled BOOLEAN DEFAULT true,
  created_at timestamptz DEFAULT now()
);
CREATE TABLE IF NOT EXISTS mobile_money_providers (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  enabled BOOLEAN DEFAULT true,
  created_at timestamptz DEFAULT now()
);
CREATE TABLE IF NOT EXISTS notaire_specialities (
  id SERIAL PRIMARY KEY,
  label TEXT UNIQUE NOT NULL
);

-- MESSAGING
CREATE TABLE IF NOT EXISTS conversations (
  id BIGSERIAL PRIMARY KEY,
  subject TEXT,
  created_by UUID REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE TABLE IF NOT EXISTS conversation_participants (
  conversation_id BIGINT REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  added_at timestamptz DEFAULT now(),
  PRIMARY KEY(conversation_id,user_id)
);
CREATE TABLE IF NOT EXISTS messages (
  id BIGSERIAL PRIMARY KEY,
  conversation_id BIGINT REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id),
  content TEXT,
  attachments JSONB DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  read_at timestamptz
);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);

-- NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT,
  title TEXT,
  body TEXT,
  data JSONB DEFAULT '{}'::jsonb,
  read BOOLEAN DEFAULT false,
  created_at timestamptz DEFAULT now(),
  read_at timestamptz
);
CREATE INDEX IF NOT EXISTS idx_notifications_user_created ON notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, read);

-- FAVORITES & SAVED SEARCHES
CREATE TABLE IF NOT EXISTS favorites (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  parcel_id BIGINT REFERENCES parcels(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY(user_id, parcel_id)
);
CREATE TABLE IF NOT EXISTS saved_searches (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT,
  filters JSONB,
  new_results_count INT DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_saved_searches_user ON saved_searches(user_id);

-- BLOG POSTS
CREATE TABLE IF NOT EXISTS blog_posts (
  id BIGSERIAL PRIMARY KEY,
  slug TEXT UNIQUE,
  title TEXT,
  excerpt TEXT,
  content TEXT,
  author_id UUID REFERENCES users(id),
  status TEXT DEFAULT 'draft',
  tags TEXT[],
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status_pub ON blog_posts(status, published_at DESC);

-- AUDIT LOGS
CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGSERIAL PRIMARY KEY,
  event_type TEXT,
  actor_user_id UUID,
  target_user_id UUID,
  target_table TEXT,
  target_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON audit_logs(actor_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_target ON audit_logs(target_table, target_id);

-- DOCUMENTS
CREATE TABLE IF NOT EXISTS documents (
  id BIGSERIAL PRIMARY KEY,
  owner_user_id UUID REFERENCES users(id),
  entity_type TEXT,
  entity_id TEXT,
  filename TEXT,
  content_type TEXT,
  size_bytes BIGINT,
  storage_path TEXT UNIQUE,
  status TEXT DEFAULT 'uploaded',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_documents_entity ON documents(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_documents_owner ON documents(owner_user_id);

-- MARKET PREDICTIONS
CREATE TABLE IF NOT EXISTS market_predictions (
  id BIGSERIAL PRIMARY KEY,
  region_id BIGINT REFERENCES regions(id),
  department_id BIGINT REFERENCES departments(id),
  commune_id BIGINT REFERENCES communes(id),
  property_type TEXT,
  predicted_price_per_sqm NUMERIC,
  confidence_score NUMERIC,
  factors JSONB,
  created_at timestamptz DEFAULT now(),
  valid_until timestamptz
);
CREATE INDEX IF NOT EXISTS idx_market_predictions_geo ON market_predictions(region_id,department_id,commune_id);

-- INVESTMENTS & PROJECTS
CREATE TABLE IF NOT EXISTS investments (
  id BIGSERIAL PRIMARY KEY,
  reference TEXT UNIQUE,
  investor_id UUID REFERENCES users(id),
  parcel_id BIGINT REFERENCES parcels(id),
  investment_type TEXT,
  amount_invested NUMERIC,
  expected_roi NUMERIC,
  status TEXT DEFAULT 'active',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE TABLE IF NOT EXISTS promoteur_projects (
  id BIGSERIAL PRIMARY KEY,
  reference TEXT UNIQUE,
  promoteur_id UUID REFERENCES users(id),
  name TEXT,
  project_type TEXT,
  status TEXT DEFAULT 'planning',
  total_budget NUMERIC,
  units_total INT,
  units_sold INT DEFAULT 0,
  parcels JSONB DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE TABLE IF NOT EXISTS promoteur_project_units (
  id BIGSERIAL PRIMARY KEY,
  project_id BIGINT REFERENCES promoteur_projects(id) ON DELETE CASCADE,
  name TEXT,
  status TEXT DEFAULT 'available',
  price NUMERIC,
  area_sqm NUMERIC,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_pp_units_project_status ON promoteur_project_units(project_id,status);

-- PARCEL VIEWS (support analytics in VendeurDashboard)
CREATE TABLE IF NOT EXISTS parcel_views (
  id BIGSERIAL PRIMARY KEY,
  parcel_id BIGINT REFERENCES parcels(id) ON DELETE CASCADE,
  viewer_id UUID REFERENCES users(id),
  viewed_at timestamptz DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);
CREATE INDEX IF NOT EXISTS idx_parcel_views_parcel ON parcel_views(parcel_id, viewed_at DESC);
CREATE INDEX IF NOT EXISTS idx_parcel_views_viewer ON parcel_views(viewer_id);

-- PARCEL INQUIRIES (support inquiries stats)
CREATE TABLE IF NOT EXISTS parcel_inquiries (
  id BIGSERIAL PRIMARY KEY,
  parcel_id BIGINT REFERENCES parcels(id) ON DELETE CASCADE,
  inquirer_id UUID REFERENCES users(id),
  inquiry_type TEXT,
  message TEXT,
  created_at timestamptz DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);
CREATE INDEX IF NOT EXISTS idx_parcel_inquiries_parcel ON parcel_inquiries(parcel_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_parcel_inquiries_inquirer ON parcel_inquiries(inquirer_id);

-- USER ACTIVITIES (timeline & anti-fraud signals)
CREATE TABLE IF NOT EXISTS user_activities (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  activity_type TEXT,
  entity_type TEXT,
  entity_id TEXT,
  description TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_user_activities_user ON user_activities(user_id, created_at DESC);

-- SOIL ANALYSES
CREATE TABLE IF NOT EXISTS soil_analyses (
  id BIGSERIAL PRIMARY KEY,
  parcel_id BIGINT REFERENCES parcels(id),
  agriculteur_id UUID REFERENCES users(id),
  ph_level NUMERIC,
  organic_matter NUMERIC,
  metrics JSONB,
  recommendations JSONB,
  analysis_date date DEFAULT current_date,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_soil_analyses_parcel ON soil_analyses(parcel_id);

-- RISK LAYERS
CREATE TABLE IF NOT EXISTS risk_layers (
  id SERIAL PRIMARY KEY,
  code TEXT UNIQUE,
  name TEXT NOT NULL,
  category TEXT,
  description TEXT,
  source TEXT,
  geometry geography,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);
CREATE TABLE IF NOT EXISTS risk_layer_parcels (
  risk_layer_id INT REFERENCES risk_layers(id) ON DELETE CASCADE,
  parcel_id BIGINT REFERENCES parcels(id) ON DELETE CASCADE,
  impact_level TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  PRIMARY KEY(risk_layer_id, parcel_id)
);

-- GIN indexes for JSON heavy columns
CREATE INDEX IF NOT EXISTS idx_parcels_metadata_gin ON parcels USING GIN (metadata);
CREATE INDEX IF NOT EXISTS idx_requests_metadata_gin ON requests USING GIN (metadata);
CREATE INDEX IF NOT EXISTS idx_transactions_documents_gin ON transactions USING GIN (documents);
CREATE INDEX IF NOT EXISTS idx_feature_flags_audience_gin ON feature_flags USING GIN (audience);

-- TRIGGER updated_at
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;$$ LANGUAGE plpgsql;

DO $$
DECLARE r RECORD; BEGIN
  FOR r IN SELECT tablename FROM pg_tables WHERE schemaname='public' AND tablename IN (
    'roles','institution_profiles','parcels','requests','transactions','payments','blog_posts','documents','investments','promoteur_projects','promoteur_project_units'
  ) LOOP
    EXECUTE format('CREATE TRIGGER trg_upd_%s BEFORE UPDATE ON %I FOR EACH ROW EXECUTE PROCEDURE set_updated_at();', r.tablename, r.tablename);
  END LOOP;
END;$$;

-- ENABLE RLS & POLICIES (minimal examples)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE parcels ENABLE ROW LEVEL SECURITY;
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_layers ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_layer_parcels ENABLE ROW LEVEL SECURITY;

-- Helper function is_admin(uid)
CREATE OR REPLACE FUNCTION is_admin(p_uid uuid) RETURNS boolean AS $$
  SELECT EXISTS(SELECT 1 FROM user_roles ur JOIN roles r ON ur.role_id=r.id WHERE ur.user_id=p_uid AND r.key='admin');
$$ LANGUAGE sql STABLE;

-- Policies (guard create if not exists via catalog check) -- simplified; refine later.
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='users' AND policyname='users_select_self_or_admin') THEN
    EXECUTE 'CREATE POLICY users_select_self_or_admin ON users FOR SELECT USING (id = auth.uid() OR is_admin(auth.uid()));';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='parcels' AND policyname='parcels_select_public_or_related') THEN
    EXECUTE 'CREATE POLICY parcels_select_public_or_related ON parcels FOR SELECT USING (status IN (''published'',''active'') OR owner_id = auth.uid() OR is_admin(auth.uid()));';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='requests' AND policyname='requests_participants_select') THEN
    EXECUTE 'CREATE POLICY requests_participants_select ON requests FOR SELECT USING (user_id = auth.uid() OR recipient_user_id = auth.uid() OR is_admin(auth.uid()));';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='transactions' AND policyname='transactions_participants_select') THEN
    EXECUTE 'CREATE POLICY transactions_participants_select ON transactions FOR SELECT USING (buyer_id=auth.uid() OR seller_id=auth.uid() OR agent_id=auth.uid() OR notaire_id=auth.uid() OR is_admin(auth.uid()));';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='payments' AND policyname='payments_via_transactions') THEN
    EXECUTE 'CREATE POLICY payments_via_transactions ON payments FOR SELECT USING (EXISTS (SELECT 1 FROM transactions t WHERE t.id=payments.transaction_id AND (t.buyer_id=auth.uid() OR t.seller_id=auth.uid() OR t.agent_id=auth.uid() OR t.notaire_id=auth.uid() OR is_admin(auth.uid()))));';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='notifications' AND policyname='notifications_owner') THEN
    EXECUTE 'CREATE POLICY notifications_owner ON notifications FOR SELECT USING (user_id = auth.uid());';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='favorites' AND policyname='favorites_owner') THEN
    EXECUTE 'CREATE POLICY favorites_owner ON favorites FOR SELECT USING (user_id = auth.uid());';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='saved_searches' AND policyname='saved_searches_owner') THEN
    EXECUTE 'CREATE POLICY saved_searches_owner ON saved_searches FOR SELECT USING (user_id = auth.uid());';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='documents' AND policyname='documents_owner_or_admin') THEN
    EXECUTE 'CREATE POLICY documents_owner_or_admin ON documents FOR SELECT USING (owner_user_id=auth.uid() OR is_admin(auth.uid()));';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='blog_posts' AND policyname='blog_posts_public') THEN
    EXECUTE 'CREATE POLICY blog_posts_public ON blog_posts FOR SELECT USING (status=''published'' OR is_admin(auth.uid()));';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='feature_flags' AND policyname='feature_flags_read') THEN
    EXECUTE 'CREATE POLICY feature_flags_read ON feature_flags FOR SELECT USING (true);';
  END IF;
END $$;
