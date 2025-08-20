-- =================================================================
-- SCRIPT MINIMAL - PROFIL ADMIN UNIQUEMENT
-- =================================================================
-- 🎯 OBJECTIF : Créer seulement le profil admin pour tester
-- 📅 Date : 20 Août 2025
-- ⚡ TEST RAPIDE

-- =================================================================
-- 🔧 1. VÉRIFIER SI LA TABLE PROFILES EXISTE
-- =================================================================

-- Afficher les tables existantes
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'parcels', 'notifications', 'transactions');

-- =================================================================
-- 🔧 2. CRÉER SEULEMENT LA TABLE PROFILES SI NÉCESSAIRE
-- =================================================================

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  user_type TEXT DEFAULT 'particulier',
  status TEXT DEFAULT 'active',
  email_verified BOOLEAN DEFAULT false,
  phone_verified BOOLEAN DEFAULT false,
  identity_verified BOOLEAN DEFAULT false,
  avatar_url TEXT,
  date_of_birth DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =================================================================
-- 🔧 3. DÉSACTIVER RLS TEMPORAIREMENT POUR INSÉRER L'ADMIN
-- =================================================================

ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- =================================================================
-- 🔧 4. INSÉRER LE PROFIL ADMIN
-- =================================================================

-- Supprimer l'admin existant s'il existe
DELETE FROM profiles WHERE id = '986ad46b-e990-4642-b12e-3ef5466197ff';

-- Insérer le nouveau profil admin
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
);

-- =================================================================
-- 🔧 5. VÉRIFIER QUE L'ADMIN A ÉTÉ CRÉÉ
-- =================================================================

SELECT 
  id,
  email,
  first_name,
  last_name,
  user_type,
  status,
  created_at
FROM profiles 
WHERE id = '986ad46b-e990-4642-b12e-3ef5466197ff';

-- =================================================================
-- 🔧 6. MESSAGE DE CONFIRMATION
-- =================================================================

SELECT 
  '✅ PROFIL ADMIN CRÉÉ AVEC SUCCÈS' as message,
  'ID: 986ad46b-e990-4642-b12e-3ef5466197ff' as admin_id,
  'Email: admin@terangafoncier.com' as admin_email,
  NOW() as completed_at;
