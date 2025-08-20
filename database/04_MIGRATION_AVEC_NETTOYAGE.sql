-- =================================================================
-- MIGRATION CORRECTIVE AVEC NETTOYAGE - TERANGA FONCIER
-- =================================================================
-- 🚨 IMPORTANT : Exécuter ce script dans Supabase SQL Editor
-- 🧹 Correction : Nettoyer les données orphelines avant contraintes FK
-- ⏱️ Temps estimé : 3-5 minutes

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
-- 🔄 AJOUT DES COLONNES MANQUANTES AUX TABLES EXISTANTES
-- =================================================================

-- Ajouter les colonnes manquantes à la table parcels
DO $$
BEGIN
  -- Vérifier et ajouter owner_id si elle n'existe pas
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'parcels' AND column_name = 'owner_id'
  ) THEN
    ALTER TABLE parcels ADD COLUMN owner_id UUID;
  END IF;
  
  -- Vérifier et ajouter agent_id si elle n'existe pas
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'parcels' AND column_name = 'agent_id'
  ) THEN
    ALTER TABLE parcels ADD COLUMN agent_id UUID;
  END IF;
END
$$;

-- Ajouter les colonnes manquantes à parcel_submissions
DO $$
BEGIN
  -- Vérifier et ajouter parcel_id si elle n'existe pas
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'parcel_submissions' AND column_name = 'parcel_id'
  ) THEN
    ALTER TABLE parcel_submissions ADD COLUMN parcel_id UUID;
  END IF;
  
  -- Vérifier et ajouter submitted_by si elle n'existe pas
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'parcel_submissions' AND column_name = 'submitted_by'
  ) THEN
    ALTER TABLE parcel_submissions ADD COLUMN submitted_by UUID;
  END IF;
  
  -- Vérifier et ajouter reviewed_by si elle n'existe pas
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'parcel_submissions' AND column_name = 'reviewed_by'
  ) THEN
    ALTER TABLE parcel_submissions ADD COLUMN reviewed_by UUID;
  END IF;
END
$$;

-- Ajouter les colonnes manquantes à transactions
DO $$
BEGIN
  -- Vérifier et ajouter user_id si elle n'existe pas
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'transactions' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE transactions ADD COLUMN user_id UUID;
  END IF;
  
  -- Vérifier et ajouter parcel_id si elle n'existe pas
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'transactions' AND column_name = 'parcel_id'
  ) THEN
    ALTER TABLE transactions ADD COLUMN parcel_id UUID;
  END IF;
END
$$;

-- Ajouter les colonnes manquantes à notifications
DO $$
BEGIN
  -- Vérifier et ajouter user_id si elle n'existe pas
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'notifications' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE notifications ADD COLUMN user_id UUID;
  END IF;
END
$$;

-- Ajouter les colonnes manquantes à fraud_alerts
DO $$
BEGIN
  -- Vérifier et ajouter user_id si elle n'existe pas
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'fraud_alerts' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE fraud_alerts ADD COLUMN user_id UUID;
  END IF;
  
  -- Vérifier et ajouter resolved_by si elle n'existe pas
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'fraud_alerts' AND column_name = 'resolved_by'
  ) THEN
    ALTER TABLE fraud_alerts ADD COLUMN resolved_by UUID;
  END IF;
END
$$;

-- Ajouter les colonnes manquantes à messages
DO $$
BEGIN
  -- Vérifier et ajouter sender_id si elle n'existe pas
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'messages' AND column_name = 'sender_id'
  ) THEN
    ALTER TABLE messages ADD COLUMN sender_id UUID;
  END IF;
  
  -- Vérifier et ajouter conversation_id si elle n'existe pas
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'messages' AND column_name = 'conversation_id'
  ) THEN
    ALTER TABLE messages ADD COLUMN conversation_id UUID;
  END IF;
END
$$;

-- =================================================================
-- 🧹 NETTOYAGE DES DONNÉES ORPHELINES
-- =================================================================

-- Nettoyer les données orphelines AVANT d'ajouter les contraintes FK
DO $$
BEGIN
  -- Supprimer les notifications avec user_id qui n'existent pas dans profiles
  DELETE FROM notifications 
  WHERE user_id IS NOT NULL 
    AND user_id NOT IN (SELECT id FROM profiles WHERE id IS NOT NULL);
  
  -- Supprimer les fraud_alerts avec user_id orphelins
  DELETE FROM fraud_alerts 
  WHERE user_id IS NOT NULL 
    AND user_id NOT IN (SELECT id FROM profiles WHERE id IS NOT NULL);
  
  -- Supprimer les transactions avec user_id orphelins
  DELETE FROM transactions 
  WHERE user_id IS NOT NULL 
    AND user_id NOT IN (SELECT id FROM profiles WHERE id IS NOT NULL);
  
  -- Supprimer les parcel_submissions avec submitted_by orphelins
  DELETE FROM parcel_submissions 
  WHERE submitted_by IS NOT NULL 
    AND submitted_by NOT IN (SELECT id FROM profiles WHERE id IS NOT NULL);
  
  -- Supprimer les messages avec sender_id orphelins
  DELETE FROM messages 
  WHERE sender_id IS NOT NULL 
    AND sender_id NOT IN (SELECT id FROM profiles WHERE id IS NOT NULL);
  
  -- Nettoyer les références vers parcels inexistantes
  UPDATE parcel_submissions SET parcel_id = NULL 
  WHERE parcel_id IS NOT NULL 
    AND parcel_id NOT IN (SELECT id FROM parcels WHERE id IS NOT NULL);
  
  UPDATE transactions SET parcel_id = NULL 
  WHERE parcel_id IS NOT NULL 
    AND parcel_id NOT IN (SELECT id FROM parcels WHERE id IS NOT NULL);
  
  -- Nettoyer les références vers conversations inexistantes
  UPDATE messages SET conversation_id = NULL 
  WHERE conversation_id IS NOT NULL 
    AND conversation_id NOT IN (SELECT id FROM conversations WHERE id IS NOT NULL);
  
  RAISE NOTICE 'Nettoyage des données orphelines terminé';
END
$$;

-- =================================================================
-- 🔗 CONTRAINTES DE CLÉS ÉTRANGÈRES (APRÈS NETTOYAGE)
-- =================================================================

-- Ajouter les contraintes FK après avoir nettoyé les données orphelines
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
  
  -- FK pour parcels vers profiles (seulement si les colonnes ont des valeurs valides)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'parcels_owner_id_fkey'
  ) THEN
    -- Nettoyer les owner_id orphelins avant d'ajouter la contrainte
    UPDATE parcels SET owner_id = NULL WHERE owner_id IS NOT NULL AND owner_id NOT IN (SELECT id FROM profiles);
    ALTER TABLE parcels ADD CONSTRAINT parcels_owner_id_fkey 
    FOREIGN KEY (owner_id) REFERENCES profiles(id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'parcels_agent_id_fkey'
  ) THEN
    -- Nettoyer les agent_id orphelins avant d'ajouter la contrainte
    UPDATE parcels SET agent_id = NULL WHERE agent_id IS NOT NULL AND agent_id NOT IN (SELECT id FROM profiles);
    ALTER TABLE parcels ADD CONSTRAINT parcels_agent_id_fkey 
    FOREIGN KEY (agent_id) REFERENCES profiles(id);
  END IF;
  
  -- FK pour parcel_submissions
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'parcel_submissions_parcel_id_fkey'
  ) THEN
    ALTER TABLE parcel_submissions ADD CONSTRAINT parcel_submissions_parcel_id_fkey 
    FOREIGN KEY (parcel_id) REFERENCES parcels(id) ON DELETE SET NULL;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'parcel_submissions_submitted_by_fkey'
  ) THEN
    ALTER TABLE parcel_submissions ADD CONSTRAINT parcel_submissions_submitted_by_fkey 
    FOREIGN KEY (submitted_by) REFERENCES profiles(id) ON DELETE SET NULL;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'parcel_submissions_reviewed_by_fkey'
  ) THEN
    ALTER TABLE parcel_submissions ADD CONSTRAINT parcel_submissions_reviewed_by_fkey 
    FOREIGN KEY (reviewed_by) REFERENCES profiles(id) ON DELETE SET NULL;
  END IF;
  
  -- FK pour transactions
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'transactions_user_id_fkey'
  ) THEN
    ALTER TABLE transactions ADD CONSTRAINT transactions_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE SET NULL;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'transactions_parcel_id_fkey'
  ) THEN
    ALTER TABLE transactions ADD CONSTRAINT transactions_parcel_id_fkey 
    FOREIGN KEY (parcel_id) REFERENCES parcels(id) ON DELETE SET NULL;
  END IF;
  
  -- FK pour notifications
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'notifications_user_id_fkey'
  ) THEN
    ALTER TABLE notifications ADD CONSTRAINT notifications_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
  END IF;
  
  -- FK pour fraud_alerts
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
    UPDATE fraud_alerts SET resolved_by = NULL WHERE resolved_by IS NOT NULL AND resolved_by NOT IN (SELECT id FROM profiles);
    ALTER TABLE fraud_alerts ADD CONSTRAINT fraud_alerts_resolved_by_fkey 
    FOREIGN KEY (resolved_by) REFERENCES profiles(id) ON DELETE SET NULL;
  END IF;
  
  -- FK pour messages
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'messages_conversation_id_fkey'
  ) THEN
    ALTER TABLE messages ADD CONSTRAINT messages_conversation_id_fkey 
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE SET NULL;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'messages_sender_id_fkey'
  ) THEN
    ALTER TABLE messages ADD CONSTRAINT messages_sender_id_fkey 
    FOREIGN KEY (sender_id) REFERENCES profiles(id) ON DELETE CASCADE;
  END IF;
  
  RAISE NOTICE 'Toutes les contraintes FK ont été ajoutées avec succès';
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
DO $$
BEGIN
  -- Trigger pour profiles (éviter les doublons)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'trigger_profiles_updated_at'
  ) THEN
    CREATE TRIGGER trigger_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  
  -- Trigger pour institutions
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'trigger_institutions_updated_at'
  ) THEN
    CREATE TRIGGER trigger_institutions_updated_at BEFORE UPDATE ON institutions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END
$$;

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

-- Index pour les nouvelles colonnes FK
CREATE INDEX IF NOT EXISTS idx_parcels_owner_id ON parcels(owner_id);
CREATE INDEX IF NOT EXISTS idx_parcels_agent_id ON parcels(agent_id);
CREATE INDEX IF NOT EXISTS idx_parcel_submissions_parcel_id ON parcel_submissions(parcel_id);
CREATE INDEX IF NOT EXISTS idx_parcel_submissions_submitted_by ON parcel_submissions(submitted_by);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_fraud_alerts_user_id ON fraud_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);

-- =================================================================
-- ✅ DONNÉES DE BASE (si les tables sont vides)
-- =================================================================

-- Ajouter les données dans regions si elle est vide (en s'adaptant à la structure existante)
DO $$
DECLARE
  regions_columns TEXT[];
BEGIN
  -- Vérifier quelles colonnes existent dans la table regions
  SELECT array_agg(column_name) INTO regions_columns
  FROM information_schema.columns 
  WHERE table_name = 'regions' AND table_schema = 'public';
  
  -- Si la table regions n'existe pas ou est vide de colonnes, la passer
  IF regions_columns IS NULL OR array_length(regions_columns, 1) = 0 THEN
    RAISE NOTICE 'Table regions non trouvée ou sans colonnes, création ignorée';
    RETURN;
  END IF;
  
  -- Vérifier si les colonnes standard existent et procéder en conséquence
  IF 'name' = ANY(regions_columns) THEN
    -- La colonne name existe, vérifier si capital existe aussi
    IF 'capital' = ANY(regions_columns) THEN
      -- Structure complète avec capital
      INSERT INTO regions (name, code, capital) 
      SELECT 'Dakar', 'DK', 'Dakar' WHERE NOT EXISTS (SELECT 1 FROM regions WHERE name = 'Dakar')
      UNION ALL
      SELECT 'Thiès', 'TH', 'Thiès' WHERE NOT EXISTS (SELECT 1 FROM regions WHERE name = 'Thiès')
      UNION ALL
      SELECT 'Saint-Louis', 'SL', 'Saint-Louis' WHERE NOT EXISTS (SELECT 1 FROM regions WHERE name = 'Saint-Louis')
      UNION ALL
      SELECT 'Diourbel', 'DB', 'Diourbel' WHERE NOT EXISTS (SELECT 1 FROM regions WHERE name = 'Diourbel')
      UNION ALL
      SELECT 'Louga', 'LG', 'Louga' WHERE NOT EXISTS (SELECT 1 FROM regions WHERE name = 'Louga')
      UNION ALL
      SELECT 'Fatick', 'FK', 'Fatick' WHERE NOT EXISTS (SELECT 1 FROM regions WHERE name = 'Fatick')
      UNION ALL
      SELECT 'Kaolack', 'KL', 'Kaolack' WHERE NOT EXISTS (SELECT 1 FROM regions WHERE name = 'Kaolack')
      UNION ALL
      SELECT 'Kaffrine', 'KF', 'Kaffrine' WHERE NOT EXISTS (SELECT 1 FROM regions WHERE name = 'Kaffrine')
      UNION ALL
      SELECT 'Tambacounda', 'TC', 'Tambacounda' WHERE NOT EXISTS (SELECT 1 FROM regions WHERE name = 'Tambacounda')
      UNION ALL
      SELECT 'Kédougou', 'KD', 'Kédougou' WHERE NOT EXISTS (SELECT 1 FROM regions WHERE name = 'Kédougou')
      UNION ALL
      SELECT 'Kolda', 'KO', 'Kolda' WHERE NOT EXISTS (SELECT 1 FROM regions WHERE name = 'Kolda')
      UNION ALL
      SELECT 'Ziguinchor', 'ZG', 'Ziguinchor' WHERE NOT EXISTS (SELECT 1 FROM regions WHERE name = 'Ziguinchor')
      UNION ALL
      SELECT 'Matam', 'MT', 'Matam' WHERE NOT EXISTS (SELECT 1 FROM regions WHERE name = 'Matam')
      UNION ALL
      SELECT 'Sédhiou', 'SD', 'Sédhiou' WHERE NOT EXISTS (SELECT 1 FROM regions WHERE name = 'Sédhiou');
      
      RAISE NOTICE 'Régions insérées avec structure complète (name, code, capital)';
    ELSE
      -- Structure simple avec name et code
      IF 'code' = ANY(regions_columns) THEN
        INSERT INTO regions (name, code) 
        SELECT 'Dakar', 'DK' WHERE NOT EXISTS (SELECT 1 FROM regions WHERE name = 'Dakar')
        UNION ALL
        SELECT 'Thiès', 'TH' WHERE NOT EXISTS (SELECT 1 FROM regions WHERE name = 'Thiès')
        UNION ALL
        SELECT 'Saint-Louis', 'SL' WHERE NOT EXISTS (SELECT 1 FROM regions WHERE name = 'Saint-Louis')
        UNION ALL
        SELECT 'Diourbel', 'DB' WHERE NOT EXISTS (SELECT 1 FROM regions WHERE name = 'Diourbel')
        UNION ALL
        SELECT 'Louga', 'LG' WHERE NOT EXISTS (SELECT 1 FROM regions WHERE name = 'Louga')
        UNION ALL
        SELECT 'Fatick', 'FK' WHERE NOT EXISTS (SELECT 1 FROM regions WHERE name = 'Fatick')
        UNION ALL
        SELECT 'Kaolack', 'KL' WHERE NOT EXISTS (SELECT 1 FROM regions WHERE name = 'Kaolack')
        UNION ALL
        SELECT 'Kaffrine', 'KF' WHERE NOT EXISTS (SELECT 1 FROM regions WHERE name = 'Kaffrine')
        UNION ALL
        SELECT 'Tambacounda', 'TC' WHERE NOT EXISTS (SELECT 1 FROM regions WHERE name = 'Tambacounda')
        UNION ALL
        SELECT 'Kédougou', 'KD' WHERE NOT EXISTS (SELECT 1 FROM regions WHERE name = 'Kédougou')
        UNION ALL
        SELECT 'Kolda', 'KO' WHERE NOT EXISTS (SELECT 1 FROM regions WHERE name = 'Kolda')
        UNION ALL
        SELECT 'Ziguinchor', 'ZG' WHERE NOT EXISTS (SELECT 1 FROM regions WHERE name = 'Ziguinchor')
        UNION ALL
        SELECT 'Matam', 'MT' WHERE NOT EXISTS (SELECT 1 FROM regions WHERE name = 'Matam')
        UNION ALL
        SELECT 'Sédhiou', 'SD' WHERE NOT EXISTS (SELECT 1 FROM regions WHERE name = 'Sédhiou');
        
        RAISE NOTICE 'Régions insérées avec structure simple (name, code)';
      ELSE
        -- Seulement name
        INSERT INTO regions (name) 
        SELECT 'Dakar' WHERE NOT EXISTS (SELECT 1 FROM regions WHERE name = 'Dakar')
        UNION ALL
        SELECT 'Thiès' WHERE NOT EXISTS (SELECT 1 FROM regions WHERE name = 'Thiès')
        UNION ALL
        SELECT 'Saint-Louis' WHERE NOT EXISTS (SELECT 1 FROM regions WHERE name = 'Saint-Louis')
        UNION ALL
        SELECT 'Diourbel' WHERE NOT EXISTS (SELECT 1 FROM regions WHERE name = 'Diourbel')
        UNION ALL
        SELECT 'Louga' WHERE NOT EXISTS (SELECT 1 FROM regions WHERE name = 'Louga')
        UNION ALL
        SELECT 'Fatick' WHERE NOT EXISTS (SELECT 1 FROM regions WHERE name = 'Fatick')
        UNION ALL
        SELECT 'Kaolack' WHERE NOT EXISTS (SELECT 1 FROM regions WHERE name = 'Kaolack')
        UNION ALL
        SELECT 'Kaffrine' WHERE NOT EXISTS (SELECT 1 FROM regions WHERE name = 'Kaffrine')
        UNION ALL
        SELECT 'Tambacounda' WHERE NOT EXISTS (SELECT 1 FROM regions WHERE name = 'Tambacounda')
        UNION ALL
        SELECT 'Kédougou' WHERE NOT EXISTS (SELECT 1 FROM regions WHERE name = 'Kédougou')
        UNION ALL
        SELECT 'Kolda' WHERE NOT EXISTS (SELECT 1 FROM regions WHERE name = 'Kolda')
        UNION ALL
        SELECT 'Ziguinchor' WHERE NOT EXISTS (SELECT 1 FROM regions WHERE name = 'Ziguinchor')
        UNION ALL
        SELECT 'Matam' WHERE NOT EXISTS (SELECT 1 FROM regions WHERE name = 'Matam')
        UNION ALL
        SELECT 'Sédhiou' WHERE NOT EXISTS (SELECT 1 FROM regions WHERE name = 'Sédhiou');
        
        RAISE NOTICE 'Régions insérées avec structure minimal (name seulement)';
      END IF;
    END IF;
  ELSE
    -- Structure de table regions inconnue, lister les colonnes et passer
    RAISE NOTICE 'Structure de table regions non reconnue. Colonnes trouvées: %', array_to_string(regions_columns, ', ');
    RAISE NOTICE 'Insertion de régions ignorée - structure non compatible';
  END IF;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Erreur lors de l''insertion des régions: %', SQLERRM;
    RAISE NOTICE 'Insertion de régions ignorée';
END
$$;

-- Ajouter les rôles si la table est vide (en s'adaptant à la structure existante)
DO $$
DECLARE
  roles_columns TEXT[];
BEGIN
  -- Vérifier quelles colonnes existent dans la table roles
  SELECT array_agg(column_name) INTO roles_columns
  FROM information_schema.columns 
  WHERE table_name = 'roles' AND table_schema = 'public';
  
  -- Si la table roles n'existe pas ou est vide de colonnes, la passer
  IF roles_columns IS NULL OR array_length(roles_columns, 1) = 0 THEN
    RAISE NOTICE 'Table roles non trouvée ou sans colonnes, création ignorée';
    RETURN;
  END IF;
  
  -- Vérifier si les colonnes standard existent et procéder en conséquence
  IF 'name' = ANY(roles_columns) AND 'description' = ANY(roles_columns) THEN
    -- Vérifier si permissions et is_system existent aussi
    IF 'permissions' = ANY(roles_columns) AND 'is_system' = ANY(roles_columns) THEN
      -- Structure complète avec permissions et is_system
      INSERT INTO roles (name, description, is_system, permissions) 
      SELECT 'admin', 'Administrateur système', true, '["all"]' WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'admin')
      UNION ALL
      SELECT 'particulier', 'Particulier/Citoyen', true, '["view_parcels", "submit_requests"]' WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'particulier')
      UNION ALL
      SELECT 'agriculteur', 'Agriculteur', true, '["manage_lands", "view_weather", "equipment"]' WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'agriculteur')
      UNION ALL
      SELECT 'banque', 'Institution bancaire', true, '["view_funding", "manage_guarantees"]' WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'banque')
      UNION ALL
      SELECT 'investisseur', 'Investisseur', true, '["view_opportunities", "analyze_market"]' WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'investisseur')
      UNION ALL
      SELECT 'mairie', 'Mairie/Collectivité', true, '["manage_urban_plan", "handle_disputes"]' WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'mairie')
      UNION ALL
      SELECT 'notaire', 'Notaire', true, '["manage_documents", "authentication"]' WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'notaire')
      UNION ALL
      SELECT 'promoteur', 'Promoteur immobilier', true, '["manage_projects", "track_construction"]' WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'promoteur')
      UNION ALL
      SELECT 'vendeur', 'Vendeur/Agent', true, '["manage_properties", "handle_inquiries"]' WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'vendeur')
      UNION ALL
      SELECT 'agent', 'Agent immobilier', true, '["manage_clients", "handle_parcels"]' WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'agent');
      
      RAISE NOTICE 'Rôles insérés avec structure complète (name, description, is_system, permissions)';
    ELSE
      -- Structure simplifiée avec seulement name et description
      INSERT INTO roles (name, description) 
      SELECT 'admin', 'Administrateur système' WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'admin')
      UNION ALL
      SELECT 'particulier', 'Particulier/Citoyen' WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'particulier')
      UNION ALL
      SELECT 'agriculteur', 'Agriculteur' WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'agriculteur')
      UNION ALL
      SELECT 'banque', 'Institution bancaire' WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'banque')
      UNION ALL
      SELECT 'investisseur', 'Investisseur' WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'investisseur')
      UNION ALL
      SELECT 'mairie', 'Mairie/Collectivité' WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'mairie')
      UNION ALL
      SELECT 'notaire', 'Notaire' WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'notaire')
      UNION ALL
      SELECT 'promoteur', 'Promoteur immobilier' WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'promoteur')
      UNION ALL
      SELECT 'vendeur', 'Vendeur/Agent' WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'vendeur')
      UNION ALL
      SELECT 'agent', 'Agent immobilier' WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'agent');
      
      RAISE NOTICE 'Rôles insérés avec structure simple (name, description)';
    END IF;
  ELSE
    -- Structure de table roles inconnue, lister les colonnes et passer
    RAISE NOTICE 'Structure de table roles non reconnue. Colonnes trouvées: %', array_to_string(roles_columns, ', ');
    RAISE NOTICE 'Insertion de rôles ignorée - structure non compatible';
  END IF;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Erreur lors de l''insertion des rôles: %', SQLERRM;
    RAISE NOTICE 'Insertion de rôles ignorée';
END
$$;

-- =================================================================
-- ✅ DIAGNOSTIC FINAL
-- =================================================================

-- Vérifier que tout est en place
SELECT 
  'RÉSULTAT' as type,
  CASE 
    WHEN COUNT(*) >= 3 THEN '✅ TOUTES LES TABLES CRITIQUES CRÉÉES'
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

-- Vérifier les contraintes FK créées
SELECT 
  'CONTRAINTES' as type,
  COUNT(*) as contraintes_fk_creees
FROM information_schema.table_constraints 
WHERE constraint_type = 'FOREIGN KEY' 
  AND table_schema = 'public';

-- Compter les données nettoyées
SELECT 'NETTOYAGE' as type, 'notifications_valides' as table_name, COUNT(*) as records FROM notifications WHERE user_id IS NOT NULL
UNION ALL
SELECT 'NETTOYAGE', 'fraud_alerts_valides', COUNT(*) FROM fraud_alerts WHERE user_id IS NOT NULL
UNION ALL
SELECT 'NETTOYAGE', 'transactions_valides', COUNT(*) FROM transactions WHERE user_id IS NOT NULL;

SELECT '🎉 MIGRATION CORRECTIVE AVEC NETTOYAGE TERMINÉE !' as message;
