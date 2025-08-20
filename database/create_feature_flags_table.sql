-- create_feature_flags_table.sql
-- Script pour créer la table feature_flags si elle n'existe pas encore

-- Vérifier si la table existe déjà
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'feature_flags') THEN
    -- Créer la table si elle n'existe pas
    CREATE TABLE feature_flags (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL UNIQUE,
      enabled BOOLEAN DEFAULT false,
      description TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    
    -- Ajouter les feature flags par défaut
    INSERT INTO feature_flags (name, enabled, description) VALUES
      ('show_chatbot', true, 'Affiche le chatbot global sur toutes les pages'),
      ('show_dashboard_assistant', true, 'Active l''assistant IA dans le tableau de bord'),
      ('enable_notifications', true, 'Active les notifications système'),
      ('enable_realtime', true, 'Active les fonctionnalités temps réel'),
      ('show_anti_fraud', true, 'Affiche le module anti-fraude'),
      ('enable_analytics', true, 'Active les fonctionnalités d''analyse'),
      ('show_development_tools', false, 'Affiche les outils de développement (uniquement pour les admins)');
    
    RAISE NOTICE '✅ Table feature_flags créée avec succès avec les flags par défaut';
  ELSE
    RAISE NOTICE '⚠️ La table feature_flags existe déjà';
    
    -- Ajouter les flags qui pourraient manquer
    INSERT INTO feature_flags (name, enabled, description)
    VALUES
      ('show_chatbot', true, 'Affiche le chatbot global sur toutes les pages')
    ON CONFLICT (name) DO NOTHING;
    
    INSERT INTO feature_flags (name, enabled, description)
    VALUES
      ('show_dashboard_assistant', true, 'Active l''assistant IA dans le tableau de bord')
    ON CONFLICT (name) DO NOTHING;
    
    INSERT INTO feature_flags (name, enabled, description)
    VALUES
      ('enable_notifications', true, 'Active les notifications système')
    ON CONFLICT (name) DO NOTHING;
    
    INSERT INTO feature_flags (name, enabled, description)
    VALUES
      ('enable_realtime', true, 'Active les fonctionnalités temps réel')
    ON CONFLICT (name) DO NOTHING;
    
    RAISE NOTICE '✅ Feature flags par défaut ajoutés si nécessaire';
  END IF;
  
  -- Activer RLS sur la table
  ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;
  
  -- Créer les politiques RLS
  DO $$
  BEGIN
    -- Supprimer les politiques existantes pour éviter les erreurs
    DROP POLICY IF EXISTS "Everyone can read feature flags" ON feature_flags;
    DROP POLICY IF EXISTS "Only admins can modify feature flags" ON feature_flags;
    
    -- Créer une politique pour permettre à tous de lire
    CREATE POLICY "Everyone can read feature flags" ON feature_flags
      FOR SELECT USING (true);
    
    -- Créer une politique pour restreindre les modifications aux admins
    CREATE POLICY "Only admins can modify feature flags" ON feature_flags
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM profiles 
          WHERE profiles.id = auth.uid() 
          AND (profiles.role = 'ADMIN' OR profiles.role = 'admin')
        )
      );
    
    RAISE NOTICE '✅ Politiques RLS pour feature_flags configurées';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '⚠️ Erreur lors de la création des politiques RLS: %', SQLERRM;
  END;
  $$;
END;
$$;
