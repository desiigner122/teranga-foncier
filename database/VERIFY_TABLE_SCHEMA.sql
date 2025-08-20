-- VERIFY_TABLE_SCHEMA.sql
-- Script pour vérifier et corriger les structures de tables
-- Exécuter sur Supabase pour résoudre les erreurs de colonnes manquantes

-- ====================================================
-- 1. VÉRIFICATION ET RÉPARATION TABLE MESSAGES
-- ====================================================

-- Vérifier si la table messages existe
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'messages') THEN
    -- Créer la table messages si elle n'existe pas
    CREATE TABLE messages (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      sender_id UUID REFERENCES profiles(id),
      recipient_id UUID REFERENCES profiles(id),
      conversation_id UUID,
      content TEXT NOT NULL,
      read BOOLEAN DEFAULT false,
      read_at TIMESTAMPTZ,
      metadata JSONB DEFAULT '{}',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    
    RAISE NOTICE '✅ Table messages créée';
  ELSE
    RAISE NOTICE '✓ Table messages existe déjà';
  END IF;
END $$;

-- Vérifier et ajouter des colonnes manquantes à messages
DO $$
DECLARE
  column_exists BOOLEAN;
BEGIN
  -- Vérifier et ajouter created_at
  SELECT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'messages' AND column_name = 'created_at'
  ) INTO column_exists;
  
  IF NOT column_exists THEN
    ALTER TABLE messages ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
    RAISE NOTICE '✅ Colonne created_at ajoutée à messages';
  ELSE
    RAISE NOTICE '✓ Colonne created_at existe déjà dans messages';
  END IF;
  
  -- Vérifier et ajouter updated_at
  SELECT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'messages' AND column_name = 'updated_at'
  ) INTO column_exists;
  
  IF NOT column_exists THEN
    ALTER TABLE messages ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    RAISE NOTICE '✅ Colonne updated_at ajoutée à messages';
  ELSE
    RAISE NOTICE '✓ Colonne updated_at existe déjà dans messages';
  END IF;
  
  -- Vérifier et ajouter content
  SELECT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'messages' AND column_name = 'content'
  ) INTO column_exists;
  
  IF NOT column_exists THEN
    ALTER TABLE messages ADD COLUMN content TEXT NOT NULL DEFAULT 'Message sans contenu';
    RAISE NOTICE '✅ Colonne content ajoutée à messages';
  ELSE
    RAISE NOTICE '✓ Colonne content existe déjà dans messages';
  END IF;
  
  -- Vérifier et ajouter sender_id
  SELECT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'messages' AND column_name = 'sender_id'
  ) INTO column_exists;
  
  IF NOT column_exists THEN
    ALTER TABLE messages ADD COLUMN sender_id UUID REFERENCES profiles(id);
    RAISE NOTICE '✅ Colonne sender_id ajoutée à messages';
  ELSE
    RAISE NOTICE '✓ Colonne sender_id existe déjà dans messages';
  END IF;
  
  -- Vérifier et ajouter recipient_id
  SELECT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'messages' AND column_name = 'recipient_id'
  ) INTO column_exists;
  
  IF NOT column_exists THEN
    ALTER TABLE messages ADD COLUMN recipient_id UUID REFERENCES profiles(id);
    RAISE NOTICE '✅ Colonne recipient_id ajoutée à messages';
  ELSE
    RAISE NOTICE '✓ Colonne recipient_id existe déjà dans messages';
  END IF;
END $$;

-- ====================================================
-- 2. VÉRIFICATION ET RÉPARATION TABLE CONVERSATIONS
-- ====================================================

-- Vérifier si la table conversations existe
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'conversations') THEN
    -- Créer la table conversations si elle n'existe pas
    CREATE TABLE conversations (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title TEXT,
      participants JSONB DEFAULT '[]',
      participant1_id UUID REFERENCES profiles(id),
      participant2_id UUID REFERENCES profiles(id),
      last_message TEXT,
      last_message_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    
    RAISE NOTICE '✅ Table conversations créée';
  ELSE
    RAISE NOTICE '✓ Table conversations existe déjà';
  END IF;
END $$;

-- Vérifier et ajouter des colonnes manquantes à conversations
DO $$
DECLARE
  column_exists BOOLEAN;
BEGIN
  -- Vérifier et ajouter participants
  SELECT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'conversations' AND column_name = 'participants'
  ) INTO column_exists;
  
  IF NOT column_exists THEN
    ALTER TABLE conversations ADD COLUMN participants JSONB DEFAULT '[]';
    RAISE NOTICE '✅ Colonne participants ajoutée à conversations';
  ELSE
    RAISE NOTICE '✓ Colonne participants existe déjà dans conversations';
  END IF;
  
  -- Vérifier et ajouter participant1_id
  SELECT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'conversations' AND column_name = 'participant1_id'
  ) INTO column_exists;
  
  IF NOT column_exists THEN
    ALTER TABLE conversations ADD COLUMN participant1_id UUID REFERENCES profiles(id);
    RAISE NOTICE '✅ Colonne participant1_id ajoutée à conversations';
  ELSE
    RAISE NOTICE '✓ Colonne participant1_id existe déjà dans conversations';
  END IF;
  
  -- Vérifier et ajouter participant2_id
  SELECT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'conversations' AND column_name = 'participant2_id'
  ) INTO column_exists;
  
  IF NOT column_exists THEN
    ALTER TABLE conversations ADD COLUMN participant2_id UUID REFERENCES profiles(id);
    RAISE NOTICE '✅ Colonne participant2_id ajoutée à conversations';
  ELSE
    RAISE NOTICE '✓ Colonne participant2_id existe déjà dans conversations';
  END IF;
END $$;

-- ====================================================
-- 3. VÉRIFICATION ET RÉPARATION TABLE FEATURE_FLAGS
-- ====================================================

-- Vérifier si la table feature_flags existe
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'feature_flags') THEN
    -- Créer la table feature_flags si elle n'existe pas
    CREATE TABLE feature_flags (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      key TEXT UNIQUE NOT NULL,
      enabled BOOLEAN DEFAULT false,
      description TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    
    -- Insérer quelques flags par défaut
    INSERT INTO feature_flags (key, enabled, description) VALUES
      ('realtime_notifications', true, 'Notifications en temps réel'),
      ('advanced_search', true, 'Recherche avancée'),
      ('messaging_system', true, 'Système de messagerie')
    ON CONFLICT (key) DO NOTHING;
    
    RAISE NOTICE '✅ Table feature_flags créée avec flags par défaut';
  ELSE
    RAISE NOTICE '✓ Table feature_flags existe déjà';
  END IF;
END $$;

-- ====================================================
-- 4. RLS POLICIES
-- ====================================================

-- RLS pour messages
DO $$
BEGIN
  -- Activer RLS sur messages
  ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
  
  -- Supprimer les politiques existantes
  DROP POLICY IF EXISTS "Users can view own messages" ON messages;
  DROP POLICY IF EXISTS "Users can insert own messages" ON messages;
  
  -- Créer de nouvelles politiques
  CREATE POLICY "Users can view own messages" ON messages
    FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = recipient_id);
  
  CREATE POLICY "Users can insert own messages" ON messages
    FOR INSERT WITH CHECK (auth.uid() = sender_id);
    
  RAISE NOTICE '✅ Politiques RLS pour messages configurées';
END $$;

-- RLS pour conversations
DO $$
BEGIN
  -- Activer RLS sur conversations
  ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
  
  -- Supprimer les politiques existantes
  DROP POLICY IF EXISTS "Users can view own conversations via participants" ON conversations;
  DROP POLICY IF EXISTS "Users can view own conversations via direct fields" ON conversations;
  DROP POLICY IF EXISTS "Users can manage own conversations" ON conversations;
  
  -- Créer de nouvelles politiques
  CREATE POLICY "Users can view own conversations via participants" ON conversations
    FOR SELECT USING (participants::jsonb @> jsonb_build_array(auth.uid()));
    
  CREATE POLICY "Users can view own conversations via direct fields" ON conversations
    FOR SELECT USING (participant1_id = auth.uid() OR participant2_id = auth.uid());
    
  CREATE POLICY "Users can manage own conversations" ON conversations
    FOR ALL USING (
      participants::jsonb @> jsonb_build_array(auth.uid()) 
      OR participant1_id = auth.uid() 
      OR participant2_id = auth.uid()
    );
    
  RAISE NOTICE '✅ Politiques RLS pour conversations configurées';
END $$;

-- RLS pour feature_flags
DO $$
BEGIN
  -- Activer RLS sur feature_flags
  ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;
  
  -- Supprimer les politiques existantes
  DROP POLICY IF EXISTS "Anyone can read feature flags" ON feature_flags;
  
  -- Créer de nouvelles politiques
  CREATE POLICY "Anyone can read feature flags" ON feature_flags
    FOR SELECT USING (true);
    
  RAISE NOTICE '✅ Politiques RLS pour feature_flags configurées';
END $$;

-- ====================================================
-- 5. VÉRIFICATION FINALE
-- ====================================================

-- Vérifier que toutes les tables nécessaires existent
DO $$
DECLARE
  missing_tables TEXT := '';
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
    missing_tables := missing_tables || 'profiles, ';
  END IF;
  
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'messages') THEN
    missing_tables := missing_tables || 'messages, ';
  END IF;
  
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'conversations') THEN
    missing_tables := missing_tables || 'conversations, ';
  END IF;
  
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'feature_flags') THEN
    missing_tables := missing_tables || 'feature_flags, ';
  END IF;
  
  IF LENGTH(missing_tables) > 0 THEN
    RAISE WARNING '⚠️ Tables manquantes: %', missing_tables;
  ELSE
    RAISE NOTICE '✅ Toutes les tables requises existent';
  END IF;
END $$;

-- Rafraîchir les statistiques pour optimiser les requêtes
ANALYZE;

-- Message final
SELECT 
  '🎉 VÉRIFICATION ET RÉPARATION TERMINÉES' as message,
  NOW() as completed_at;
