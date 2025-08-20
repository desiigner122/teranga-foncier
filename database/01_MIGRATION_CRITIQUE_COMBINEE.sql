-- =================================================================
-- MIGRATION CRITIQUE COMBINÉE - TERANGA FONCIER
-- =================================================================
-- 🚨 IMPORTANT : Exécuter ce script EN PREMIER dans Supabase SQL Editor
-- 📅 Date : 20 Août 2025
-- ⏱️ Temps estimé : 10-15 minutes

-- =================================================================
-- 🔧 ÉTAPE 1 : EXTENSIONS REQUISES
-- =================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
-- CREATE EXTENSION IF NOT EXISTS "postgis"; -- Décommenter si géolocalisation nécessaire

-- =================================================================
-- 👥 ÉTAPE 2 : TABLE USERS ET PROFILES (Base fondamentale)
-- =================================================================

-- Table users (base Supabase Auth)
-- Note: Cette table existe déjà via Supabase Auth, nous ajoutons juste les colonnes manquantes

-- Table profiles étendue
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  user_type TEXT NOT NULL DEFAULT 'particulier',
  status TEXT DEFAULT 'active',
  email_verified BOOLEAN DEFAULT FALSE,
  phone_verified BOOLEAN DEFAULT FALSE,
  identity_verified BOOLEAN DEFAULT FALSE,
  institution_id UUID,
  metadata JSONB DEFAULT '{}',
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT profiles_user_type_check CHECK (
    user_type IN ('admin', 'particulier', 'agriculteur', 'banque', 'investisseur', 'mairie', 'notaire', 'promoteur', 'vendeur', 'agent')
  ),
  CONSTRAINT profiles_status_check CHECK (
    status IN ('active', 'inactive', 'suspended', 'pending')
  )
);

-- =================================================================
-- 🏢 ÉTAPE 3 : INSTITUTIONS
-- =================================================================
CREATE TABLE IF NOT EXISTS institutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  registration_number TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  logo_url TEXT,
  region TEXT,
  department TEXT,
  commune TEXT,
  status TEXT DEFAULT 'active',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT institutions_type_check CHECK (
    type IN ('banque', 'mairie', 'notaire', 'promoteur', 'agence')
  )
);

-- =================================================================
-- 🌍 ÉTAPE 4 : DONNÉES GÉOGRAPHIQUES SÉNÉGAL
-- =================================================================
CREATE TABLE IF NOT EXISTS regions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  code TEXT UNIQUE,
  capital TEXT,
  area_km2 DECIMAL,
  population INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT,
  region_id UUID REFERENCES regions(id),
  capital TEXT,
  area_km2 DECIMAL,
  population INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS communes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT,
  department_id UUID REFERENCES departments(id),
  type TEXT DEFAULT 'commune', -- commune, arrondissement
  area_km2 DECIMAL,
  population INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =================================================================
-- 🏠 ÉTAPE 5 : PARCELLES ET SOUMISSIONS
-- =================================================================
CREATE TABLE IF NOT EXISTS parcels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  region TEXT,
  department TEXT,
  commune TEXT,
  area_sqm DECIMAL,
  price DECIMAL,
  price_per_sqm DECIMAL,
  currency TEXT DEFAULT 'XOF',
  land_type TEXT DEFAULT 'residential',
  status TEXT DEFAULT 'available',
  owner_id UUID, -- Contrainte ajoutée plus tard
  agent_id UUID, -- Contrainte ajoutée plus tard
  features JSONB DEFAULT '{}',
  documents JSONB DEFAULT '[]',
  images JSONB DEFAULT '[]',
  coordinates JSONB, -- {lat, lng}
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT parcels_status_check CHECK (
    status IN ('available', 'reserved', 'sold', 'suspended')
  ),
  CONSTRAINT parcels_land_type_check CHECK (
    land_type IN ('residential', 'commercial', 'agricultural', 'industrial', 'mixed')
  )
);

CREATE TABLE IF NOT EXISTS parcel_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parcel_id UUID, -- Contrainte ajoutée plus tard
  submitted_by UUID NOT NULL, -- Contrainte ajoutée plus tard
  submission_type TEXT NOT NULL DEFAULT 'purchase_request',
  status TEXT DEFAULT 'pending',
  data JSONB DEFAULT '{}',
  amount DECIMAL,
  payment_method TEXT,
  notes TEXT,
  reviewed_by UUID, -- Contrainte ajoutée plus tard
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT submissions_type_check CHECK (
    submission_type IN ('purchase_request', 'reservation', 'price_inquiry', 'visit_request', 'document_request')
  ),
  CONSTRAINT submissions_status_check CHECK (
    status IN ('pending', 'approved', 'rejected', 'cancelled', 'completed')
  )
);

-- =================================================================
-- 💰 ÉTAPE 6 : TRANSACTIONS ET PAIEMENTS
-- =================================================================
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL, -- Contrainte ajoutée plus tard
  parcel_id UUID, -- Contrainte ajoutée plus tard
  type TEXT NOT NULL,
  amount DECIMAL NOT NULL,
  currency TEXT DEFAULT 'XOF',
  status TEXT DEFAULT 'pending',
  payment_method TEXT,
  payment_reference TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT transactions_type_check CHECK (
    type IN ('purchase', 'deposit', 'fee', 'commission', 'refund')
  ),
  CONSTRAINT transactions_status_check CHECK (
    status IN ('pending', 'completed', 'failed', 'cancelled', 'refunded')
  )
);

-- =================================================================
-- 📢 ÉTAPE 7 : NOTIFICATIONS ET ALERTES
-- =================================================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL, -- Contrainte ajoutée plus tard
  title TEXT NOT NULL,
  body TEXT,
  type TEXT DEFAULT 'info',
  data JSONB DEFAULT '{}',
  read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT notifications_type_check CHECK (
    type IN ('info', 'warning', 'success', 'error', 'promotion')
  )
);

CREATE TABLE IF NOT EXISTS fraud_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL, -- Contrainte ajoutée plus tard
  alert_type TEXT NOT NULL,
  severity TEXT DEFAULT 'medium',
  title TEXT NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  status TEXT DEFAULT 'active',
  resolved_at TIMESTAMPTZ,
  resolved_by UUID, -- Contrainte ajoutée plus tard
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT fraud_alerts_severity_check CHECK (
    severity IN ('low', 'medium', 'high', 'critical')
  ),
  CONSTRAINT fraud_alerts_status_check CHECK (
    status IN ('active', 'resolved', 'dismissed')
  )
);

-- =================================================================
-- 💬 ÉTAPE 8 : SYSTÈME DE MESSAGERIE
-- =================================================================
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT,
  type TEXT DEFAULT 'direct',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT conversations_type_check CHECK (
    type IN ('direct', 'group', 'support')
  )
);

CREATE TABLE IF NOT EXISTS conversation_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL, -- Contrainte ajoutée plus tard
  user_id UUID NOT NULL, -- Contrainte ajoutée plus tard
  role TEXT DEFAULT 'member',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  left_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  
  UNIQUE(conversation_id, user_id),
  CONSTRAINT participants_role_check CHECK (
    role IN ('member', 'admin', 'moderator')
  )
);

CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL, -- Contrainte ajoutée plus tard
  sender_id UUID NOT NULL, -- Contrainte ajoutée plus tard
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text',
  metadata JSONB DEFAULT '{}',
  edited_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT messages_type_check CHECK (
    message_type IN ('text', 'image', 'file', 'system')
  )
);

-- =================================================================
-- 🔐 ÉTAPE 9 : RÔLES ET PERMISSIONS
-- =================================================================
CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  permissions JSONB DEFAULT '[]',
  is_system BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =================================================================
-- 📊 ÉTAPE 10 : INDEX DE PERFORMANCE
-- =================================================================

-- Index pour profiles
CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON profiles(user_type);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON profiles(status);

-- Index pour parcels
CREATE INDEX IF NOT EXISTS idx_parcels_location ON parcels(region, department, commune);
CREATE INDEX IF NOT EXISTS idx_parcels_status ON parcels(status);
CREATE INDEX IF NOT EXISTS idx_parcels_price ON parcels(price);
CREATE INDEX IF NOT EXISTS idx_parcels_owner ON parcels(owner_id);

-- Index pour parcel_submissions
CREATE INDEX IF NOT EXISTS idx_submissions_parcel ON parcel_submissions(parcel_id);
CREATE INDEX IF NOT EXISTS idx_submissions_user ON parcel_submissions(submitted_by);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON parcel_submissions(status);

-- Index pour transactions
CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_parcel ON transactions(parcel_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);

-- Index pour notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_created ON notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(user_id, read);

-- Index pour messages
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);

-- =================================================================
-- � ÉTAPE 11 : CONTRAINTES DE CLÉS ÉTRANGÈRES
-- =================================================================

-- Ajouter les contraintes après création de toutes les tables
DO $$
BEGIN
  -- Contraintes pour parcels
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'parcels_owner_id_fkey'
  ) THEN
    ALTER TABLE parcels ADD CONSTRAINT parcels_owner_id_fkey 
    FOREIGN KEY (owner_id) REFERENCES profiles(id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'parcels_agent_id_fkey'
  ) THEN
    ALTER TABLE parcels ADD CONSTRAINT parcels_agent_id_fkey 
    FOREIGN KEY (agent_id) REFERENCES profiles(id);
  END IF;
  
  -- Contraintes pour parcel_submissions
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'parcel_submissions_parcel_id_fkey'
  ) THEN
    ALTER TABLE parcel_submissions ADD CONSTRAINT parcel_submissions_parcel_id_fkey 
    FOREIGN KEY (parcel_id) REFERENCES parcels(id) ON DELETE CASCADE;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'parcel_submissions_submitted_by_fkey'
  ) THEN
    ALTER TABLE parcel_submissions ADD CONSTRAINT parcel_submissions_submitted_by_fkey 
    FOREIGN KEY (submitted_by) REFERENCES profiles(id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'parcel_submissions_reviewed_by_fkey'
  ) THEN
    ALTER TABLE parcel_submissions ADD CONSTRAINT parcel_submissions_reviewed_by_fkey 
    FOREIGN KEY (reviewed_by) REFERENCES profiles(id);
  END IF;
  
  -- Contraintes pour transactions
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'transactions_user_id_fkey'
  ) THEN
    ALTER TABLE transactions ADD CONSTRAINT transactions_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES profiles(id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'transactions_parcel_id_fkey'
  ) THEN
    ALTER TABLE transactions ADD CONSTRAINT transactions_parcel_id_fkey 
    FOREIGN KEY (parcel_id) REFERENCES parcels(id);
  END IF;
  
  -- Contraintes pour notifications
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'notifications_user_id_fkey'
  ) THEN
    ALTER TABLE notifications ADD CONSTRAINT notifications_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
  END IF;
  
  -- Contraintes pour fraud_alerts
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fraud_alerts_user_id_fkey'
  ) THEN
    ALTER TABLE fraud_alerts ADD CONSTRAINT fraud_alerts_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fraud_alerts_resolved_by_fkey'
  ) THEN
    ALTER TABLE fraud_alerts ADD CONSTRAINT fraud_alerts_resolved_by_fkey 
    FOREIGN KEY (resolved_by) REFERENCES profiles(id);
  END IF;
  
  -- Contraintes pour conversation_participants
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'conversation_participants_conversation_id_fkey'
  ) THEN
    ALTER TABLE conversation_participants ADD CONSTRAINT conversation_participants_conversation_id_fkey 
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'conversation_participants_user_id_fkey'
  ) THEN
    ALTER TABLE conversation_participants ADD CONSTRAINT conversation_participants_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
  END IF;
  
  -- Contraintes pour messages
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'messages_conversation_id_fkey'
  ) THEN
    ALTER TABLE messages ADD CONSTRAINT messages_conversation_id_fkey 
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'messages_sender_id_fkey'
  ) THEN
    ALTER TABLE messages ADD CONSTRAINT messages_sender_id_fkey 
    FOREIGN KEY (sender_id) REFERENCES profiles(id) ON DELETE CASCADE;
  END IF;
END
$$;

-- =================================================================
-- �🚀 ÉTAPE 12 : TRIGGERS UPDATED_AT
-- =================================================================

-- Fonction générique pour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour toutes les tables avec updated_at
CREATE TRIGGER trigger_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_institutions_updated_at BEFORE UPDATE ON institutions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_parcels_updated_at BEFORE UPDATE ON parcels
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_parcel_submissions_updated_at BEFORE UPDATE ON parcel_submissions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_transactions_updated_at BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_notifications_updated_at BEFORE UPDATE ON notifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_conversations_updated_at BEFORE UPDATE ON conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =================================================================
-- ✅ INSERTION DONNÉES DE BASE
-- =================================================================

-- Rôles système
INSERT INTO roles (name, description, is_system, permissions) VALUES
('admin', 'Administrateur système', true, '["all"]'),
('particulier', 'Particulier/Citoyen', true, '["view_parcels", "submit_requests"]'),
('agriculteur', 'Agriculteur', true, '["manage_lands", "view_weather", "equipment"]'),
('banque', 'Institution bancaire', true, '["view_funding", "manage_guarantees"]'),
('investisseur', 'Investisseur', true, '["view_opportunities", "analyze_market"]'),
('mairie', 'Mairie/Collectivité', true, '["manage_urban_plan", "handle_disputes"]'),
('notaire', 'Notaire', true, '["manage_documents", "authentication"]'),
('promoteur', 'Promoteur immobilier', true, '["manage_projects", "track_construction"]'),
('vendeur', 'Vendeur/Agent', true, '["manage_properties", "handle_inquiries"]'),
('agent', 'Agent immobilier', true, '["manage_clients", "handle_parcels"]')
ON CONFLICT (name) DO NOTHING;

-- Régions du Sénégal (principales)
INSERT INTO regions (name, code, capital) VALUES
('Dakar', 'DK', 'Dakar'),
('Thiès', 'TH', 'Thiès'),
('Saint-Louis', 'SL', 'Saint-Louis'),
('Diourbel', 'DB', 'Diourbel'),
('Louga', 'LG', 'Louga'),
('Fatick', 'FK', 'Fatick'),
('Kaolack', 'KL', 'Kaolack'),
('Kaffrine', 'KF', 'Kaffrine'),
('Tambacounda', 'TC', 'Tambacounda'),
('Kédougou', 'KD', 'Kédougou'),
('Kolda', 'KO', 'Kolda'),
('Ziguinchor', 'ZG', 'Ziguinchor'),
('Matam', 'MT', 'Matam'),
('Sédhiou', 'SD', 'Sédhiou')
ON CONFLICT (name) DO NOTHING;

-- =================================================================
-- 🎉 FINALISATION
-- =================================================================

-- Actualiser les statistiques
ANALYZE;

-- Message de confirmation
SELECT 
  '-- =================================================================
-- ✅ ÉTAPE 13 : DIAGNOSTIC COMPLET POST-MIGRATION
-- =================================================================

-- Vérification des tables créées
SELECT 
  'TABLE' as type,
  table_name,
  'OK' as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
  AND table_name IN (
    'profiles', 'regions', 'departments', 'communes', 'districts', 'sectors',
    'parcels', 'parcel_submissions', 'notifications', 'transactions', 
    'fraud_alerts', 'events', 'conversations', 'conversation_participants', 
    'messages', 'user_documents', 'payment_methods', 'roles'
  )
ORDER BY table_name;

-- Vérification des contraintes de clés étrangères
SELECT 
  'CONSTRAINT' as type,
  tc.constraint_name,
  tc.table_name,
  'OK' as status
FROM information_schema.table_constraints tc
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
ORDER BY tc.table_name, tc.constraint_name;

-- Vérification des fonctions créées
SELECT 
  'FUNCTION' as type,
  routine_name,
  'OK' as status
FROM information_schema.routines 
WHERE routine_schema = 'public'
  AND routine_type = 'FUNCTION'
  AND routine_name LIKE 'update_%'
ORDER BY routine_name;

-- Vérification des triggers
SELECT 
  'TRIGGER' as type,
  trigger_name,
  event_object_table as table_name,
  'OK' as status
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- Comptes des enregistrements
SELECT 'COUNT' as type, 'profiles' as table_name, COUNT(*) as records FROM profiles
UNION ALL
SELECT 'COUNT', 'regions', COUNT(*) FROM regions
UNION ALL
SELECT 'COUNT', 'departments', COUNT(*) FROM departments
UNION ALL
SELECT 'COUNT', 'communes', COUNT(*) FROM communes
UNION ALL
SELECT 'COUNT', 'districts', COUNT(*) FROM districts
UNION ALL
SELECT 'COUNT', 'sectors', COUNT(*) FROM sectors
ORDER BY table_name;' as message,
  NOW() as completed_at,
  'Vous pouvez maintenant appliquer les autres migrations' as next_step;
