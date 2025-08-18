// src/data/testAccounts.js - Comptes de test pour les différents rôles
export const testAccounts = {
  particulier: {
    email: 'particulier@test.com',
    password: 'Test123!',
    type: 'Particulier',
    full_name: 'Jean Dupont',
    description: 'Compte test pour particulier'
  },
  vendeur: {
    email: 'vendeur@test.com',
    password: 'Test123!',
    type: 'Vendeur',
    full_name: 'Marie Martin',
    description: 'Compte test pour vendeur'
  },
  investisseur: {
    email: 'investisseur@test.com',
    password: 'Test123!',
    type: 'Investisseur',
    full_name: 'Pierre Invest',
    description: 'Compte test pour investisseur'
  },
  promoteur: {
    email: 'promoteur@test.com',
    password: 'Test123!',
    type: 'Promoteur',
    full_name: 'Paul Promo',
    description: 'Compte test pour promoteur'
  },
  agriculteur: {
    email: 'agriculteur@test.com',
    password: 'Test123!',
    type: 'Agriculteur',
    full_name: 'Ahmed Agri',
    description: 'Compte test pour agriculteur'
  },
  banque: {
    email: 'banque@test.com',
    password: 'Test123!',
    type: 'Banque',
    full_name: 'Banque Atlantique',
    description: 'Compte test pour banque'
  },
  notaire: {
    email: 'notaire@test.com',
    password: 'Test123!',
    type: 'Notaire',
    full_name: 'Maitre Notaire',
    description: 'Compte test pour notaire'
  },
  mairie: {
    email: 'mairie@test.com',
    password: 'Test123!',
    type: 'Mairie',
    full_name: 'Mairie de Dakar',
    description: 'Compte test pour mairie'
  },
  admin: {
    email: 'admin@test.com',
    password: 'Test123!',
    type: 'Administrateur',
    role: 'admin',
    full_name: 'Administrateur Système',
    description: 'Compte test pour administrateur'
  },
  agent: {
    email: 'agent@test.com',
    password: 'Test123!',
    type: 'Agent',
    role: 'agent',
    full_name: 'Agent Commercial',
    description: 'Compte test pour agent'
  }
};

// Fonction pour obtenir tous les emails de test
export const getTestEmails = () => {
  return Object.values(testAccounts).map(account => account.email);
};

// Fonction pour obtenir un compte par type
export const getAccountByType = (type) => {
  return Object.values(testAccounts).find(account => 
    account.type === type || account.role === type
  );
};

// Fonction pour obtenir un compte par email
export const getAccountByEmail = (email) => {
  return Object.values(testAccounts).find(account => account.email === email);
};

// Script SQL pour créer les comptes de test (à exécuter dans Supabase SQL Editor)
export const createTestAccountsSQL = `
-- Créer les comptes de test dans la table profiles
-- Note: Les utilisateurs doivent d'abord être créés via Supabase Auth

-- Particulier
INSERT INTO profiles (id, email, full_name, type, role, phone, location, created_at, updated_at)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'particulier@test.com',
  'Jean Dupont',
  'Particulier',
  'user',
  '+221761234567',
  'Dakar, Sénégal',
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  type = EXCLUDED.type,
  updated_at = NOW();

-- Vendeur
INSERT INTO profiles (id, email, full_name, type, role, phone, location, created_at, updated_at)
VALUES (
  '22222222-2222-2222-2222-222222222222',
  'vendeur@test.com',
  'Marie Martin',
  'Vendeur',
  'user',
  '+221762345678',
  'Thiès, Sénégal',
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  type = EXCLUDED.type,
  updated_at = NOW();

-- Investisseur
INSERT INTO profiles (id, email, full_name, type, role, phone, location, created_at, updated_at)
VALUES (
  '33333333-3333-3333-3333-333333333333',
  'investisseur@test.com',
  'Pierre Invest',
  'Investisseur',
  'user',
  '+221763456789',
  'Saint-Louis, Sénégal',
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  type = EXCLUDED.type,
  updated_at = NOW();

-- Promoteur
INSERT INTO profiles (id, email, full_name, type, role, phone, location, created_at, updated_at)
VALUES (
  '44444444-4444-4444-4444-444444444444',
  'promoteur@test.com',
  'Paul Promo',
  'Promoteur',
  'user',
  '+221764567890',
  'Mbour, Sénégal',
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  type = EXCLUDED.type,
  updated_at = NOW();

-- Agriculteur
INSERT INTO profiles (id, email, full_name, type, role, phone, location, created_at, updated_at)
VALUES (
  '55555555-5555-5555-5555-555555555555',
  'agriculteur@test.com',
  'Ahmed Agri',
  'Agriculteur',
  'user',
  '+221765678901',
  'Kaolack, Sénégal',
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  type = EXCLUDED.type,
  updated_at = NOW();

-- Banque
INSERT INTO profiles (id, email, full_name, type, role, phone, location, created_at, updated_at)
VALUES (
  '66666666-6666-6666-6666-666666666666',
  'banque@test.com',
  'Banque Atlantique',
  'Banque',
  'user',
  '+221766789012',
  'Dakar, Sénégal',
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  type = EXCLUDED.type,
  updated_at = NOW();

-- Notaire
INSERT INTO profiles (id, email, full_name, type, role, phone, location, created_at, updated_at)
VALUES (
  '77777777-7777-7777-7777-777777777777',
  'notaire@test.com',
  'Maitre Notaire',
  'Notaire',
  'user',
  '+221767890123',
  'Dakar, Sénégal',
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  type = EXCLUDED.type,
  updated_at = NOW();

-- Mairie
INSERT INTO profiles (id, email, full_name, type, role, phone, location, created_at, updated_at)
VALUES (
  '88888888-8888-8888-8888-888888888888',
  'mairie@test.com',
  'Mairie de Dakar',
  'Mairie',
  'user',
  '+221768901234',
  'Dakar, Sénégal',
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  type = EXCLUDED.type,
  updated_at = NOW();

-- Administrateur
INSERT INTO profiles (id, email, full_name, type, role, phone, location, created_at, updated_at)
VALUES (
  '99999999-9999-9999-9999-999999999999',
  'admin@test.com',
  'Administrateur Système',
  'Administrateur',
  'admin',
  '+221769012345',
  'Dakar, Sénégal',
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  type = EXCLUDED.type,
  role = EXCLUDED.role,
  updated_at = NOW();

-- Agent
INSERT INTO profiles (id, email, full_name, type, role, phone, location, created_at, updated_at)
VALUES (
  '10101010-1010-1010-1010-101010101010',
  'agent@test.com',
  'Agent Commercial',
  'Agent',
  'agent',
  '+221760123456',
  'Dakar, Sénégal',
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  type = EXCLUDED.type,
  role = EXCLUDED.role,
  updated_at = NOW();

-- Mettre à jour les propriétés supplémentaires
UPDATE profiles SET 
  bio = 'Compte de test pour les démonstrations',
  is_verified = true,
  identity_verification_status = 'verified',
  created_at = NOW(),
  updated_at = NOW()
WHERE email IN (
  'particulier@test.com',
  'vendeur@test.com', 
  'investisseur@test.com',
  'promoteur@test.com',
  'agriculteur@test.com',
  'banque@test.com',
  'notaire@test.com',
  'mairie@test.com',
  'admin@test.com',
  'agent@test.com'
);
`;

export default testAccounts;
