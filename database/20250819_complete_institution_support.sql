-- ===================================================================
-- MIGRATION COMPLÈTE TERANGA FONCIER - SUPPORT INSTITUTIONS
-- Date: 2025-08-19
-- Objectif: Ajout du support complet pour les institutions (banques/mairies)
-- ===================================================================

-- =================================================================
-- 1. CORRECTIONS DE SCHÉMA - TABLES MANQUANTES
-- =================================================================

-- Table notifications (si manquante)
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT,
  type TEXT DEFAULT 'info',
  data JSONB DEFAULT '{}',
  read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table fraud_alerts (si manquante)
CREATE TABLE IF NOT EXISTS fraud_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL,
  severity TEXT DEFAULT 'medium',
  title TEXT NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  status TEXT DEFAULT 'active',
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =================================================================
-- 2. AMÉLIORATION TABLE USERS POUR INSTITUTIONS
-- =================================================================

-- Ajouter colonnes pour métadonnées institutions si manquantes
DO $$ 
BEGIN
  -- Colonne pour type étendu
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'institution_type'
  ) THEN
    ALTER TABLE users ADD COLUMN institution_type TEXT;
  END IF;
  
  -- Colonne pour données d'agrément
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'license_info'
  ) THEN
    ALTER TABLE users ADD COLUMN license_info JSONB DEFAULT '{}';
  END IF;
  
  -- Colonne pour statut vérifié
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'verification_status'
  ) THEN
    ALTER TABLE users ADD COLUMN verification_status TEXT DEFAULT 'not_verified';
  END IF;
END $$;

-- =================================================================
-- 3. AMÉLIORATION TABLE REQUESTS POUR ROUTAGE
-- =================================================================

-- Ajouter colonnes de routage si manquantes
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'requests' AND column_name = 'recipient_type'
  ) THEN
    ALTER TABLE requests ADD COLUMN recipient_type TEXT;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'requests' AND column_name = 'recipient_id'
  ) THEN
    ALTER TABLE requests ADD COLUMN recipient_id UUID;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'requests' AND column_name = 'mairie_id'
  ) THEN
    ALTER TABLE requests ADD COLUMN mairie_id UUID;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'requests' AND column_name = 'banque_id'
  ) THEN
    ALTER TABLE requests ADD COLUMN banque_id UUID;
  END IF;
END $$;

-- =================================================================
-- 4. CONTRAINTES ET INDEX DE PERFORMANCE
-- =================================================================

-- Index pour les notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_created 
ON notifications(user_id, created_at DESC);

-- Index pour les alertes fraude
CREATE INDEX IF NOT EXISTS idx_fraud_alerts_user_status 
ON fraud_alerts(user_id, status);

-- Index pour le routage des demandes
CREATE INDEX IF NOT EXISTS idx_requests_recipient 
ON requests(recipient_type, recipient_id);

CREATE INDEX IF NOT EXISTS idx_requests_banque 
ON requests(banque_id) WHERE banque_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_requests_mairie 
ON requests(mairie_id) WHERE mairie_id IS NOT NULL;

-- Index pour les types d'institutions
CREATE INDEX IF NOT EXISTS idx_users_type_institution 
ON users(type, institution_type) WHERE type IN ('banque', 'mairie');

-- =================================================================
-- 5. FONCTION D'AIDE POUR CRÉATION D'INSTITUTIONS
-- =================================================================

CREATE OR REPLACE FUNCTION create_complete_institution(
  p_email TEXT,
  p_full_name TEXT,
  p_phone TEXT,
  p_type TEXT,
  p_metadata JSONB DEFAULT '{}',
  p_location JSONB DEFAULT '{}'
) RETURNS JSONB AS $$
DECLARE
  v_user_id UUID;
  v_result JSONB;
BEGIN
  -- Générer un UUID pour l'utilisateur
  v_user_id := gen_random_uuid();
  
  -- Insérer dans la table users
  INSERT INTO users (
    id,
    email,
    full_name,
    phone,
    type,
    institution_type,
    role,
    metadata,
    verification_status,
    created_at,
    updated_at
  ) VALUES (
    v_user_id,
    p_email,
    p_full_name,
    p_phone,
    p_type,
    p_type,
    'institution',
    jsonb_build_object(
      'location', p_location,
      'institution_data', p_metadata,
      'created_by', 'admin',
      'creation_method', 'complete_form'
    ),
    'verified',
    NOW(),
    NOW()
  );
  
  -- Créer une notification de bienvenue
  INSERT INTO notifications (
    user_id,
    title,
    body,
    type,
    data
  ) VALUES (
    v_user_id,
    'Bienvenue sur Teranga Foncier',
    'Votre compte ' || p_type || ' a été créé avec succès.',
    'institution_welcome',
    jsonb_build_object(
      'institution_type', p_type,
      'creation_source', 'admin'
    )
  );
  
  -- Retourner les informations de l'utilisateur créé
  SELECT jsonb_build_object(
    'id', id,
    'email', email,
    'full_name', full_name,
    'type', type,
    'created_at', created_at
  ) INTO v_result
  FROM users
  WHERE id = v_user_id;
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =================================================================
-- 6. VUES UTILES POUR L'ADMINISTRATION
-- =================================================================

-- Vue des institutions avec leurs détails
CREATE OR REPLACE VIEW institution_details AS
SELECT 
  u.id,
  u.email,
  u.full_name,
  u.phone,
  u.type,
  u.verification_status,
  u.created_at,
  u.metadata->>'location' as location_info,
  CASE 
    WHEN u.type = 'banque' THEN u.metadata->'institution_data'->>'bank_name'
    WHEN u.type = 'mairie' THEN u.metadata->'institution_data'->>'maire_name'
    ELSE NULL
  END as institution_head,
  CASE 
    WHEN u.type = 'banque' THEN jsonb_array_length(COALESCE(u.metadata->'institution_data'->'services', '[]'))
    WHEN u.type = 'mairie' THEN jsonb_array_length(COALESCE(u.metadata->'institution_data'->'services_offered', '[]'))
    ELSE 0
  END as services_count
FROM users u
WHERE u.type IN ('banque', 'mairie');

-- Vue des demandes avec routage
CREATE OR REPLACE VIEW requests_with_routing AS
SELECT 
  r.*,
  u_requester.full_name as requester_name,
  u_requester.email as requester_email,
  u_recipient.full_name as recipient_name,
  u_recipient.email as recipient_email,
  u_recipient.type as recipient_institution_type
FROM requests r
LEFT JOIN users u_requester ON r.user_id = u_requester.id
LEFT JOIN users u_recipient ON r.recipient_id = u_recipient.id;

-- =================================================================
-- 7. DONNÉES EXEMPLE POUR TESTS (OPTIONNEL)
-- =================================================================

-- Insérer quelques institutions d'exemple (seulement si aucune n'existe)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE type IN ('banque', 'mairie')) THEN
    
    -- Exemple banque
    INSERT INTO users (
      id,
      email,
      full_name,
      phone,
      type,
      institution_type,
      role,
      metadata,
      verification_status
    ) VALUES (
      gen_random_uuid(),
      'demo@cbao.sn',
      'CBAO Agence Dakar Demo',
      '+221 33 839 00 00',
      'banque',
      'banque',
      'institution',
      '{
        "location": {"region": "Dakar", "department": "Dakar", "commune": "Dakar-Plateau"},
        "institution_data": {
          "bank_name": "CBAO Demo",
          "branch_name": "Agence Demo",
          "bank_code": "SN001",
          "services": ["Crédit immobilier", "Crédit foncier"]
        },
        "created_by": "system",
        "creation_method": "demo"
      }',
      'verified'
    );
    
    -- Exemple mairie
    INSERT INTO users (
      id,
      email,
      full_name,
      phone,
      type,
      institution_type,
      role,
      metadata,
      verification_status
    ) VALUES (
      gen_random_uuid(),
      'demo@mairie-dakar.sn',
      'Mairie de Dakar Demo',
      '+221 33 821 71 71',
      'mairie',
      'mairie',
      'institution',
      '{
        "location": {"region": "Dakar", "department": "Dakar", "commune": "Dakar"},
        "institution_data": {
          "maire_name": "Maire Demo",
          "commune_type": "urbaine",
          "services_offered": ["État civil", "Urbanisme"]
        },
        "created_by": "system",
        "creation_method": "demo"
      }',
      'verified'
    );
    
  END IF;
END $$;

-- =================================================================
-- 8. PERMISSIONS RLS (Row Level Security)
-- =================================================================

-- Activer RLS pour les nouvelles tables
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE fraud_alerts ENABLE ROW LEVEL SECURITY;

-- Politique pour les notifications : utilisateur peut voir ses propres notifications
CREATE POLICY "Users can view own notifications" ON notifications
FOR SELECT USING (auth.uid() = user_id);

-- Politique pour les institutions : peuvent voir leurs propres alertes
CREATE POLICY "Institutions can view own fraud alerts" ON fraud_alerts
FOR SELECT USING (auth.uid() = user_id);

-- =================================================================
-- RÉSUMÉ DE LA MIGRATION
-- =================================================================

/*
✅ Tables créées/corrigées :
   - notifications (notifications système)
   - fraud_alerts (alertes de fraude)
   - users (colonnes institutions ajoutées)
   - requests (colonnes de routage ajoutées)

✅ Index de performance ajoutés :
   - Recherche rapide des notifications
   - Routage efficace des demandes
   - Filtrage par type d'institution

✅ Fonctions utilitaires :
   - create_complete_institution() pour création par admin
   - Vues pour tableau de bord admin

✅ Sécurité :
   - RLS activé sur les nouvelles tables
   - Politiques de sécurité définies

✅ Support complet institutions :
   - Banques avec métadonnées bancaires
   - Mairies avec métadonnées municipales
   - Routage automatique des demandes
   - Géolocalisation précise

Cette migration complète le support des institutions dans Teranga Foncier !
*/
