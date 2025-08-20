-- =================================================================
-- MIGRATION TABLES MANQUANTES - TERANGA FONCIER
-- =================================================================
-- 🚨 IMPORTANT : Exécuter ce script dans Supabase SQL Editor
-- 📅 Tables manquantes détectées
-- ⏱️ Temps estimé : 2-3 minutes

-- =================================================================
-- 🔧 EXTENSIONS (au cas où)
-- =================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =================================================================
-- 👥 TABLE PROFILES (MANQUANTE - CRITIQUE)
-- =================================================================
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
-- 🏢 TABLE INSTITUTIONS (MANQUANTE)
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
-- 💬 TABLE CONVERSATION_PARTICIPANTS (MANQUANTE)
-- =================================================================
CREATE TABLE IF NOT EXISTS conversation_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL, -- Contrainte FK sera ajoutée après
  role TEXT DEFAULT 'member',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  left_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  
  UNIQUE(conversation_id, user_id),
  CONSTRAINT participants_role_check CHECK (
    role IN ('member', 'admin', 'moderator')
  )
);

-- =================================================================
-- 🔗 CONTRAINTES DE CLÉS ÉTRANGÈRES
-- =================================================================

-- Ajouter les contraintes FK manquantes
DO $$
BEGIN
  -- FK pour conversation_participants vers profiles
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'conversation_participants_user_id_fkey'
  ) THEN
    ALTER TABLE conversation_participants ADD CONSTRAINT conversation_participants_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
  END IF;
  
  -- FK pour les autres tables vers profiles (si elles n'existent pas)
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
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'transactions_user_id_fkey'
  ) THEN
    ALTER TABLE transactions ADD CONSTRAINT transactions_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES profiles(id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'notifications_user_id_fkey'
  ) THEN
    ALTER TABLE notifications ADD CONSTRAINT notifications_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
  END IF;
  
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
-- 🚀 TRIGGERS UPDATED_AT
-- =================================================================

-- Fonction générique pour updated_at (au cas où elle n'existe pas)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour les nouvelles tables
CREATE TRIGGER trigger_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_institutions_updated_at BEFORE UPDATE ON institutions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =================================================================
-- 📊 INDEX DE PERFORMANCE
-- =================================================================

-- Index pour profiles
CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON profiles(user_type);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON profiles(status);

-- Index pour institutions
CREATE INDEX IF NOT EXISTS idx_institutions_type ON institutions(type);
CREATE INDEX IF NOT EXISTS idx_institutions_status ON institutions(status);
CREATE INDEX IF NOT EXISTS idx_institutions_region ON institutions(region);

-- =================================================================
-- ✅ DONNÉES DE BASE (si les tables sont vides)
-- =================================================================

-- Ajouter les données dans regions si elle est vide
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

-- Ajouter les rôles si la table est vide
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

-- =================================================================
-- ✅ DIAGNOSTIC FINAL
-- =================================================================

-- Vérifier que tout est en place
SELECT 
  'RÉSULTAT' as type,
  CASE 
    WHEN COUNT(*) = 4 THEN '✅ TOUTES LES TABLES MANQUANTES CRÉÉES'
    ELSE '⚠️ Quelques tables manquent encore'
  END as status,
  string_agg(table_name, ', ') as tables_trouvees
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('profiles', 'institutions', 'conversation_participants', 'regions');

-- Compter les enregistrements
SELECT 'DONNÉES' as type, 'regions' as table_name, COUNT(*) as records FROM regions
UNION ALL
SELECT 'DONNÉES', 'roles', COUNT(*) FROM roles;

SELECT '🎉 MIGRATION DES TABLES MANQUANTES TERMINÉE !' as message;
