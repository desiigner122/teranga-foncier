-- REPAIR_MESSAGES_TABLE.sql
-- Script court pour corriger les problèmes de la table messages
-- Exécuter en urgence pour résoudre l'erreur "column messages.created_at does not exist"

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
    -- Renommer l'ancienne table si elle existe mais est problématique
    ALTER TABLE messages RENAME TO messages_old;
    
    -- Créer une nouvelle table avec la structure correcte
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
    
    -- Transférer les données si possible
    BEGIN
      INSERT INTO messages (id, sender_id, recipient_id, conversation_id, content, read, read_at, metadata)
      SELECT id, sender_id, recipient_id, conversation_id, content, read, read_at, metadata
      FROM messages_old;
      RAISE NOTICE '✅ Données migrées de messages_old vers messages';
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE '⚠️ Impossible de migrer les données: %', SQLERRM;
    END;
    
    RAISE NOTICE '✅ Table messages recréée';
  END IF;
  
  -- Vérifier et activer RLS
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
