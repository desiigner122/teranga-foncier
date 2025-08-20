-- =================================================================
-- SYNCHRONISATION PROFILES - TERANGA FONCIER
-- =================================================================
-- 🚨 IMPORTANT : Script pour synchroniser auth.users avec profiles
-- 📅 Date : 20 Août 2025
-- ⏱️ Temps estimé : 2-3 minutes

-- =================================================================
-- 🔍 DIAGNOSTIC DES UTILISATEURS MANQUANTS
-- =================================================================

-- Vérifier les utilisateurs auth qui n'ont pas de profil
SELECT 
  'UTILISATEURS AUTH SANS PROFIL' as type,
  au.id,
  au.email,
  au.created_at as auth_created_at,
  au.raw_user_meta_data
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE p.id IS NULL;

-- Vérifier les profils orphelins (sans utilisateur auth)
SELECT 
  'PROFILS ORPHELINS' as type,
  p.id,
  p.email,
  p.first_name,
  p.last_name,
  p.user_type
FROM profiles p
LEFT JOIN auth.users au ON p.id = au.id
WHERE au.id IS NULL;

-- =================================================================
-- 🔧 SYNCHRONISATION AUTOMATIQUE
-- =================================================================

-- Créer les profils manquants à partir des utilisateurs auth
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
)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'first_name', split_part(au.email, '@', 1)) as first_name,
  COALESCE(au.raw_user_meta_data->>'last_name', '') as last_name,
  COALESCE(au.raw_user_meta_data->>'user_type', 'particulier') as user_type,
  CASE 
    WHEN au.email_confirmed_at IS NOT NULL THEN 'active'
    ELSE 'pending'
  END as status,
  au.email_confirmed_at IS NOT NULL as email_verified,
  false as phone_verified,
  false as identity_verified,
  au.created_at,
  NOW() as updated_at
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE p.id IS NULL
  AND au.email IS NOT NULL;

-- =================================================================
-- 🔧 CORRECTION DU PROFIL ADMIN SPÉCIFIQUE
-- =================================================================

-- Corriger le profil admin qui pose problème
DO $$
DECLARE
  admin_user_id UUID := '986ad46b-e990-4642-b12e-3ef5466197ff';
  admin_email TEXT := 'admin@terangafoncier.com';
BEGIN
  -- Vérifier si le profil existe
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = admin_user_id) THEN
    -- Créer le profil admin
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
      admin_user_id,
      admin_email,
      'Admin',
      'Teranga Foncier',
      'admin',
      'active',
      true,
      false,
      true,
      NOW(),
      NOW()
    );
    
    RAISE NOTICE 'Profil admin créé avec succès pour ID: %', admin_user_id;
  ELSE
    -- Mettre à jour le profil existant
    UPDATE profiles 
    SET 
      email = admin_email,
      first_name = 'Admin',
      last_name = 'Teranga Foncier',
      user_type = 'admin',
      status = 'active',
      email_verified = true,
      identity_verified = true,
      updated_at = NOW()
    WHERE id = admin_user_id;
    
    RAISE NOTICE 'Profil admin mis à jour avec succès pour ID: %', admin_user_id;
  END IF;
END
$$;

-- =================================================================
-- 🔧 TRIGGER POUR SYNCHRONISATION AUTOMATIQUE
-- =================================================================

-- Fonction pour créer automatiquement un profil lors de l'inscription
CREATE OR REPLACE FUNCTION create_profile_for_new_user()
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
    phone_verified,
    identity_verified,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'user_type', 'particulier'),
    CASE 
      WHEN NEW.email_confirmed_at IS NOT NULL THEN 'active'
      ELSE 'pending'
    END,
    NEW.email_confirmed_at IS NOT NULL,
    false,
    false,
    NEW.created_at,
    NEW.updated_at
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Créer le trigger sur auth.users
DROP TRIGGER IF EXISTS create_profile_on_signup ON auth.users;
CREATE TRIGGER create_profile_on_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_profile_for_new_user();

-- =================================================================
-- ✅ VÉRIFICATION FINALE
-- =================================================================

-- Vérifier la synchronisation
SELECT 
  'RÉSULTAT SYNCHRONISATION' as type,
  COUNT(au.id) as auth_users_total,
  COUNT(p.id) as profiles_total,
  COUNT(au.id) - COUNT(p.id) as difference
FROM auth.users au
FULL OUTER JOIN profiles p ON au.id = p.id;

-- Vérifier le profil admin spécifique
SELECT 
  'PROFIL ADMIN' as type,
  p.id,
  p.email,
  p.first_name,
  p.last_name,
  p.user_type,
  p.status,
  p.email_verified
FROM profiles p
WHERE p.id = '986ad46b-e990-4642-b12e-3ef5466197ff'
   OR p.email = 'admin@terangafoncier.com';

-- Message de confirmation
SELECT 'Synchronisation des profils terminée avec succès ✅' as message;
