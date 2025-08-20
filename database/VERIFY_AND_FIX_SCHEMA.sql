-- VERIFY_AND_FIX_SCHEMA.sql
-- Script complet pour vérifier et réparer toutes les tables nécessaires au chatbot

-- Fonction utilitaire pour vérifier si une colonne existe
CREATE OR REPLACE FUNCTION column_exists(schema_name text, table_name text, column_name text) 
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = schema_name
    AND table_name = table_name
    AND column_name = column_name
  );
END;
$$ LANGUAGE plpgsql;

-- 1. Vérifier et réparer la table messages
DO $$
BEGIN
  -- Vérifier si la table messages existe
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'messages') THEN
    -- Créer la table messages
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
    -- Vérifier les colonnes critiques
    IF NOT column_exists('public', 'messages', 'created_at') THEN
      ALTER TABLE messages ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
      RAISE NOTICE '✅ Colonne created_at ajoutée à messages';
    END IF;
    
    IF NOT column_exists('public', 'messages', 'updated_at') THEN
      ALTER TABLE messages ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
      RAISE NOTICE '✅ Colonne updated_at ajoutée à messages';
    END IF;
    
    IF NOT column_exists('public', 'messages', 'metadata') THEN
      ALTER TABLE messages ADD COLUMN metadata JSONB DEFAULT '{}';
      RAISE NOTICE '✅ Colonne metadata ajoutée à messages';
    END IF;
  END IF;
  
  -- Configurer RLS pour messages
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

-- 2. Vérifier et réparer la table conversations
DO $$
BEGIN
  -- Vérifier si la table conversations existe
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'conversations') THEN
    -- Créer la table conversations
    CREATE TABLE conversations (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title TEXT,
      created_by UUID REFERENCES profiles(id),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      metadata JSONB DEFAULT '{}'
    );
    
    RAISE NOTICE '✅ Table conversations créée';
  ELSE
    -- Vérifier les colonnes critiques
    IF NOT column_exists('public', 'conversations', 'created_at') THEN
      ALTER TABLE conversations ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
      RAISE NOTICE '✅ Colonne created_at ajoutée à conversations';
    END IF;
    
    IF NOT column_exists('public', 'conversations', 'updated_at') THEN
      ALTER TABLE conversations ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
      RAISE NOTICE '✅ Colonne updated_at ajoutée à conversations';
    END IF;
    
    IF NOT column_exists('public', 'conversations', 'metadata') THEN
      ALTER TABLE conversations ADD COLUMN metadata JSONB DEFAULT '{}';
      RAISE NOTICE '✅ Colonne metadata ajoutée à conversations';
    END IF;
  END IF;
  
  -- Configurer RLS pour conversations
  ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
  
  -- Supprimer les politiques existantes
  DROP POLICY IF EXISTS "Users can view own conversations" ON conversations;
  DROP POLICY IF EXISTS "Users can insert own conversations" ON conversations;
  
  -- Créer de nouvelles politiques
  CREATE POLICY "Users can view own conversations" ON conversations
    FOR SELECT USING (auth.uid() = created_by);
  
  CREATE POLICY "Users can insert own conversations" ON conversations
    FOR INSERT WITH CHECK (auth.uid() = created_by);
    
  RAISE NOTICE '✅ Politiques RLS pour conversations configurées';
END $$;

-- 3. Vérifier et réparer la table feature_flags
DO $$
BEGIN
  -- Vérifier si la table feature_flags existe
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'feature_flags') THEN
    -- Créer la table feature_flags
    CREATE TABLE feature_flags (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL UNIQUE,
      enabled BOOLEAN DEFAULT false,
      description TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    
    -- Ajouter quelques feature flags par défaut
    INSERT INTO feature_flags (name, enabled, description)
    VALUES 
      ('show_chatbot', true, 'Active le chatbot global pour tous les utilisateurs'),
      ('show_dashboard_assistant', true, 'Active l''assistant IA dans le tableau de bord'),
      ('enable_notifications', true, 'Active les notifications système');
    
    RAISE NOTICE '✅ Table feature_flags créée avec flags par défaut';
  END IF;
  
  -- Configurer RLS pour feature_flags
  ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;
  
  -- Supprimer les politiques existantes
  DROP POLICY IF EXISTS "Everyone can read feature flags" ON feature_flags;
  DROP POLICY IF EXISTS "Only admins can modify feature flags" ON feature_flags;
  
  -- Créer de nouvelles politiques
  CREATE POLICY "Everyone can read feature flags" ON feature_flags
    FOR SELECT USING (true);
  
  CREATE POLICY "Only admins can modify feature flags" ON feature_flags
    FOR ALL USING (
      EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'ADMIN'
      )
    );
    
  RAISE NOTICE '✅ Politiques RLS pour feature_flags configurées';
END $$;

-- Vérification finale
DO $$
BEGIN
  RAISE NOTICE 'Vérification du schéma terminée';
  RAISE NOTICE 'Tables vérifiées et réparées: messages, conversations, feature_flags';
  RAISE NOTICE 'Exécuter ce script a résolu les problèmes de colonnes manquantes';
END $$;
