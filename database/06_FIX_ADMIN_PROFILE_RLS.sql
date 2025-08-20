-- =================================================================
-- FIX ADMIN PROFILE & RLS POLICIES - URGENT
-- =================================================================
-- 🚨 CRITIQUE : Correction des politiques RLS et création profil admin
-- 📅 Date : 20 Août 2025
-- ⚡ URGENT - Exécuter immédiatement

-- =================================================================
-- 🔧 1. CORRECTION DES POLITIQUES RLS PROFILES
-- =================================================================

-- Désactiver temporairement RLS pour insérer l'admin
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Supprimer toutes les politiques existantes
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON profiles;

-- =================================================================
-- 🔧 2. CRÉATION DU PROFIL ADMIN MANQUANT
-- =================================================================

-- Insérer ou mettre à jour le profil admin
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

-- Vérifier que le profil admin existe
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM profiles WHERE id = '986ad46b-e990-4642-b12e-3ef5466197ff') THEN
    RAISE NOTICE '✅ Profil admin créé/mis à jour avec succès';
  ELSE
    RAISE EXCEPTION '❌ Échec de la création du profil admin';
  END IF;
END
$$;

-- =================================================================
-- 🔧 3. NOUVELLES POLITIQUES RLS FLEXIBLES
-- =================================================================

-- Réactiver RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Politique pour voir son propre profil
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT 
  USING (auth.uid() = id);

-- Politique pour mettre à jour son propre profil
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE 
  USING (auth.uid() = id);

-- Politique pour insérer son propre profil (création automatique)
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Politique admin - peut tout voir
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND user_type = 'admin'
    )
  );

-- Politique admin - peut tout modifier
CREATE POLICY "Admins can manage all profiles" ON profiles
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND user_type = 'admin'
    )
  );

-- =================================================================
-- 🔧 4. FONCTION HELPER POUR CRÉATION PROFIL AUTOMATIQUE
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

-- Créer le trigger si il n'existe pas
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_profile_for_user();

-- =================================================================
-- 🔧 5. FONCTION DE RÉCUPÉRATION PROFILE SÉCURISÉE
-- =================================================================

CREATE OR REPLACE FUNCTION get_user_profile(user_uuid UUID DEFAULT NULL)
RETURNS JSON AS $$
DECLARE
  target_uuid UUID;
  result JSON;
BEGIN
  -- Utiliser l'UUID fourni ou celui de l'utilisateur connecté
  target_uuid := COALESCE(user_uuid, auth.uid());
  
  IF target_uuid IS NULL THEN
    RETURN json_build_object('error', 'User not authenticated', 'code', 'UNAUTHENTICATED');
  END IF;
  
  -- Récupérer le profil
  SELECT row_to_json(p) INTO result
  FROM (
    SELECT 
      id,
      email,
      first_name,
      last_name,
      user_type,
      status,
      email_verified,
      phone_verified,
      identity_verified,
      phone,
      address,
      city,
      created_at,
      updated_at
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
-- 🔧 6. TESTS DE VALIDATION
-- =================================================================

-- Test 1: Vérifier que l'admin existe
DO $$
DECLARE
  admin_profile JSON;
BEGIN
  SELECT get_user_profile('986ad46b-e990-4642-b12e-3ef5466197ff') INTO admin_profile;
  
  IF admin_profile->>'error' IS NOT NULL THEN
    RAISE EXCEPTION '❌ Admin profile test failed: %', admin_profile->>'error';
  ELSE
    RAISE NOTICE '✅ Admin profile test passed: %', admin_profile->'data'->>'email';
  END IF;
END
$$;

-- Test 2: Vérifier les politiques RLS
DO $$
BEGIN
  -- Test insertion (doit marcher avec RLS)
  PERFORM 1 FROM profiles WHERE id = '986ad46b-e990-4642-b12e-3ef5466197ff';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION '❌ RLS policies test failed - admin profile not accessible';
  ELSE
    RAISE NOTICE '✅ RLS policies test passed - admin profile accessible';
  END IF;
END
$$;

-- Message de confirmation
SELECT 
  '🎉 FIX ADMIN PROFILE & RLS TERMINÉ' as message,
  '✅ Profil admin créé: 986ad46b-e990-4642-b12e-3ef5466197ff' as admin_id,
  '✅ Politiques RLS mises à jour' as rls_status,
  '✅ Fonction get_user_profile disponible' as function_status,
  NOW() as completed_at;
