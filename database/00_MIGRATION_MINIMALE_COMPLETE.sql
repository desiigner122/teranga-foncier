-- =================================================================
-- MIGRATION COMPLÈTE MINIMALE - TERANGA FONCIER 
-- =================================================================
-- 🚨 CRITIQUE : Base complète pour démarrer l'application
-- 📅 Date : 20 Août 2025
-- ⚡ URGENT - Exécuter en PREMIER

-- Assurer la disponibilité des fonctions UUID
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =================================================================
-- 🔧 1. CRÉATION TABLE PROFILES (SI N'EXISTE PAS)
-- =================================================================

-- Désactiver RLS temporairement
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
    ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
  END IF;
END
$$;

-- Créer la table profiles si elle n'existe pas
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  user_type TEXT DEFAULT 'particulier' CHECK (user_type IN ('particulier', 'admin', 'agent', 'vendeur', 'promoteur', 'banque', 'notaire', 'agriculteur', 'investisseur', 'mairie')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending', 'suspended')),
  email_verified BOOLEAN DEFAULT false,
  phone_verified BOOLEAN DEFAULT false,
  identity_verified BOOLEAN DEFAULT false,
  avatar_url TEXT,
  date_of_birth DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =================================================================
-- 🔧 2. CRÉATION PROFIL ADMIN OBLIGATOIRE
-- =================================================================

-- Insérer le profil admin avec l'ID exact du auth.users
INSERT INTO profiles (
  id,
  email,
  first_name,
  last_name,
  user_type,
  status,
  email_verified,
  phone_verified,
  identity_verified,
  created_at,
  updated_at
) VALUES (
  '986ad46b-e990-4642-b12e-3ef5466197ff',
  'admin@terangafoncier.com',
  'Admin',
  'System',
  'admin',
  'active',
  true,
  true,
  true,
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  user_type = EXCLUDED.user_type,
  status = EXCLUDED.status,
  email_verified = EXCLUDED.email_verified,
  phone_verified = EXCLUDED.phone_verified,
  identity_verified = EXCLUDED.identity_verified,
  updated_at = NOW();

-- =================================================================
-- 🔧 3. CRÉATION TABLES ESSENTIELLES (SI N'EXISTENT PAS)
-- =================================================================

-- Table parcels
CREATE TABLE IF NOT EXISTS parcels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  region TEXT,
  price DECIMAL(15,2),
  area_sqm DECIMAL(12,2),
  land_type TEXT,
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'sold', 'reserved', 'inactive')),
  owner_id UUID REFERENCES profiles(id),
  images JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  title TEXT NOT NULL,
  body TEXT,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'warning', 'error', 'success')),
  data JSONB DEFAULT '{}',
  read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table messages
CREATE TABLE IF NOT EXISTS messages (
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

-- Table conversations
CREATE TABLE IF NOT EXISTS conversations (
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

-- Table transactions
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  parcel_id UUID REFERENCES parcels(id),
  type TEXT CHECK (type IN ('purchase', 'reservation', 'payment')),
  amount DECIMAL(15,2) NOT NULL,
  currency TEXT DEFAULT 'XOF',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  payment_method TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table feature_flags (pour éviter les erreurs frontend)
CREATE TABLE IF NOT EXISTS feature_flags (
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

-- =================================================================
-- 🔧 4. POLITIQUES RLS FLEXIBLES
-- =================================================================

-- RLS sur profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Supprimer toutes les anciennes politiques
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON profiles;

-- Nouvelles politiques flexibles
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

CREATE POLICY "Admins can manage all profiles" ON profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- RLS sur les autres tables
ALTER TABLE parcels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view available parcels" ON parcels
  FOR SELECT USING (status = 'available');

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own transactions" ON transactions
  FOR SELECT USING (auth.uid() = user_id);

ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read feature flags" ON feature_flags
  FOR SELECT USING (true);

-- RLS pour les messages
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own messages" ON messages
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = recipient_id);
CREATE POLICY "Users can insert own messages" ON messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- RLS pour les conversations
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own conversations via participants" ON conversations
  FOR SELECT USING (participants::jsonb @> jsonb_build_array(auth.uid()));
CREATE POLICY "Users can view own conversations via direct fields" ON conversations
  FOR SELECT USING (participant1_id = auth.uid() OR participant2_id = auth.uid());
CREATE POLICY "Users can manage own conversations" ON conversations
  FOR ALL USING (participants::jsonb @> jsonb_build_array(auth.uid()) OR participant1_id = auth.uid() OR participant2_id = auth.uid());

-- =================================================================
-- 🔧 5. FONCTION AUTO-CREATION PROFIL
-- =================================================================

CREATE OR REPLACE FUNCTION create_profile_for_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (
    id,
    email,
    first_name,
    last_name,
    user_type,
    status,
    email_verified,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'user_type', 'particulier'),
    'active',
    NEW.email_confirmed_at IS NOT NULL,
    NOW(),
    NOW()
  ) ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Créer le trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_profile_for_user();

-- =================================================================
-- 🔧 6. FONCTION GET PROFILE SÉCURISÉE
-- =================================================================

CREATE OR REPLACE FUNCTION get_user_profile(user_uuid UUID DEFAULT NULL)
RETURNS JSON AS $$
DECLARE
  target_uuid UUID;
  result JSON;
BEGIN
  target_uuid := COALESCE(user_uuid, auth.uid());
  
  IF target_uuid IS NULL THEN
    RETURN json_build_object('error', 'User not authenticated', 'code', 'UNAUTHENTICATED');
  END IF;
  
  SELECT row_to_json(p) INTO result
  FROM (
    SELECT 
      id, email, first_name, last_name, user_type, status,
      email_verified, phone_verified, identity_verified,
      phone, address, city, created_at, updated_at
    FROM profiles 
    WHERE id = target_uuid
  ) p;
  
  IF result IS NULL THEN
    RETURN json_build_object('error', 'Profile not found', 'code', 'PROFILE_NOT_FOUND', 'user_id', target_uuid);
  END IF;
  
  RETURN json_build_object('success', true, 'data', result);
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('error', SQLERRM, 'code', SQLSTATE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =================================================================
-- 🔧 7. TESTS DE VALIDATION
-- =================================================================

-- Test admin profile
DO $$
DECLARE
  admin_profile JSON;
BEGIN
  SELECT get_user_profile('986ad46b-e990-4642-b12e-3ef5466197ff') INTO admin_profile;
  
  IF admin_profile->>'error' IS NOT NULL THEN
    RAISE EXCEPTION '❌ Admin profile test failed: %', admin_profile->>'error';
  ELSE
    RAISE NOTICE '✅ Admin profile OK: %', admin_profile->'data'->>'email';
  END IF;
END
$$;

-- Test feature flags
DO $$
BEGIN
  PERFORM 1 FROM feature_flags WHERE key = 'realtime_notifications';
  IF NOT FOUND THEN
    RAISE EXCEPTION '❌ Feature flags test failed';
  ELSE
    RAISE NOTICE '✅ Feature flags OK';
  END IF;
END
$$;

-- Actualiser les statistiques
ANALYZE;

-- Message final
SELECT 
  '🎉 MIGRATION MINIMALE TERMINÉE' as message,
  '✅ Profil admin: admin@terangafoncier.com' as admin_created,
  '✅ Tables essentielles créées' as tables_status,
  '✅ Politiques RLS configurées' as rls_status,
  '✅ Feature flags initialisés' as flags_status,
  NOW() as completed_at;
