-- Tables pour supporter l'IA et les données réelles

-- Table des actions IA pour traçabilité
CREATE TABLE IF NOT EXISTS ai_actions_log (
  id BIGSERIAL PRIMARY KEY,
  action VARCHAR(100) NOT NULL,
  details JSONB,
  user_id UUID REFERENCES auth.users(id),
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  success BOOLEAN DEFAULT TRUE,
  error_message TEXT
);

-- Table des dossiers notariaux
CREATE TABLE IF NOT EXISTS notaire_dossiers (
  id BIGSERIAL PRIMARY KEY,
  reference VARCHAR(50) UNIQUE NOT NULL,
  notaire_id UUID REFERENCES profiles(id),
  client_id UUID REFERENCES profiles(id),
  parcel_id BIGINT REFERENCES parcels(id),
  type VARCHAR(50) NOT NULL, -- 'Vente', 'Succession', 'Donation', etc.
  status VARCHAR(50) DEFAULT 'En attente vérification',
  priority VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high'
  valuation BIGINT, -- Valeur en XOF
  documents JSONB, -- Liste des documents attachés
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des activités notariales
CREATE TABLE IF NOT EXISTS notaire_activities (
  id BIGSERIAL PRIMARY KEY,
  notaire_id UUID REFERENCES profiles(id),
  dossier_id BIGINT REFERENCES notaire_dossiers(id),
  type VARCHAR(100) NOT NULL, -- 'Vérification', 'Authentification', etc.
  description TEXT,
  status VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des transactions immobilières
CREATE TABLE IF NOT EXISTS transactions (
  id BIGSERIAL PRIMARY KEY,
  reference VARCHAR(50) UNIQUE NOT NULL,
  parcel_id BIGINT REFERENCES parcels(id),
  buyer_id UUID REFERENCES profiles(id),
  seller_id UUID REFERENCES profiles(id),
  agent_id UUID REFERENCES profiles(id),
  notaire_id UUID REFERENCES profiles(id),
  type VARCHAR(50) NOT NULL, -- 'Vente', 'Achat', 'Location'
  status VARCHAR(50) DEFAULT 'En cours', -- 'En cours', 'Complétée', 'Annulée'
  price BIGINT NOT NULL, -- Prix en XOF
  payment_method VARCHAR(50),
  commission_rate DECIMAL(5,2), -- Pourcentage commission agent
  documents JSONB, -- Documents liés
  workflow_step VARCHAR(100), -- Étape actuelle du workflow
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des prédictions de marché
CREATE TABLE IF NOT EXISTS market_predictions (
  id BIGSERIAL PRIMARY KEY,
  location VARCHAR(100) NOT NULL,
  property_type VARCHAR(50),
  predicted_price_per_sqm DECIMAL(15,2),
  confidence_score DECIMAL(3,2), -- 0.00 à 1.00
  factors JSONB, -- Facteurs considérés
  created_at TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ
);

-- Table des demandes municipales
CREATE TABLE IF NOT EXISTS municipal_requests (
  id BIGSERIAL PRIMARY KEY,
  reference VARCHAR(50) UNIQUE NOT NULL,
  requester_id UUID REFERENCES profiles(id),
  mairie_id UUID REFERENCES profiles(id),
  parcel_id BIGINT REFERENCES parcels(id),
  request_type VARCHAR(100) NOT NULL, -- 'Permis de construire', 'Certificat d'urbanisme', etc.
  status VARCHAR(50) DEFAULT 'Soumise',
  documents JSONB,
  priority VARCHAR(20) DEFAULT 'normal',
  estimated_processing_time INTEGER, -- En jours
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des demandes de financement bancaire
CREATE TABLE IF NOT EXISTS funding_requests (
  id BIGSERIAL PRIMARY KEY,
  reference VARCHAR(50) UNIQUE NOT NULL,
  applicant_id UUID REFERENCES profiles(id),
  bank_id UUID REFERENCES profiles(id),
  parcel_id BIGINT REFERENCES parcels(id),
  requested_amount BIGINT NOT NULL,
  loan_type VARCHAR(50), -- 'Crédit habitat', 'Crédit foncier', etc.
  duration_months INTEGER,
  interest_rate DECIMAL(5,2),
  status VARCHAR(50) DEFAULT 'En évaluation',
  risk_assessment JSONB,
  guarantees JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des projets promoteurs
CREATE TABLE IF NOT EXISTS promoteur_projects (
  id BIGSERIAL PRIMARY KEY,
  reference VARCHAR(50) UNIQUE NOT NULL,
  promoteur_id UUID REFERENCES profiles(id),
  name VARCHAR(200) NOT NULL,
  location VARCHAR(200),
  project_type VARCHAR(50), -- 'Résidentiel', 'Commercial', 'Mixte'
  total_budget BIGINT,
  parcels JSONB, -- IDs des parcelles impliquées
  status VARCHAR(50) DEFAULT 'Planification',
  start_date DATE,
  estimated_completion DATE,
  units_total INTEGER,
  units_sold INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des analyses de sol pour agriculteurs
CREATE TABLE IF NOT EXISTS soil_analyses (
  id BIGSERIAL PRIMARY KEY,
  parcel_id BIGINT REFERENCES parcels(id),
  agriculteur_id UUID REFERENCES profiles(id),
  ph_level DECIMAL(3,1),
  organic_matter DECIMAL(5,2),
  nitrogen_level DECIMAL(5,2),
  phosphorus_level DECIMAL(5,2),
  potassium_level DECIMAL(5,2),
  soil_type VARCHAR(50),
  recommendations JSONB,
  analysis_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des investissements
CREATE TABLE IF NOT EXISTS investments (
  id BIGSERIAL PRIMARY KEY,
  reference VARCHAR(50) UNIQUE NOT NULL,
  investor_id UUID REFERENCES profiles(id),
  parcel_id BIGINT REFERENCES parcels(id),
  investment_type VARCHAR(50), -- 'Achat direct', 'Copropriété', 'REIT'
  amount_invested BIGINT NOT NULL,
  expected_roi DECIMAL(5,2), -- ROI attendu en pourcentage
  holding_period_months INTEGER,
  status VARCHAR(50) DEFAULT 'Actif',
  purchase_date DATE,
  current_value BIGINT,
  rental_income BIGINT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes pour performance
CREATE INDEX IF NOT EXISTS idx_notaire_dossiers_notaire_id ON notaire_dossiers(notaire_id);
CREATE INDEX IF NOT EXISTS idx_notaire_dossiers_status ON notaire_dossiers(status);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_market_predictions_location ON market_predictions(location);
CREATE INDEX IF NOT EXISTS idx_municipal_requests_status ON municipal_requests(status);
CREATE INDEX IF NOT EXISTS idx_funding_requests_status ON funding_requests(status);

-- RLS (Row Level Security) Policies
ALTER TABLE ai_actions_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE notaire_dossiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE notaire_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE municipal_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE funding_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE promoteur_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE soil_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE investments ENABLE ROW LEVEL SECURITY;

-- Policies pour les notaires
CREATE POLICY "Notaires can view their own dossiers" ON notaire_dossiers
  FOR SELECT USING (notaire_id = auth.uid());

CREATE POLICY "Notaires can update their own dossiers" ON notaire_dossiers
  FOR UPDATE USING (notaire_id = auth.uid());

-- Policies pour les transactions
CREATE POLICY "Users can view transactions they are part of" ON transactions
  FOR SELECT USING (
    buyer_id = auth.uid() OR 
    seller_id = auth.uid() OR 
    agent_id = auth.uid() OR 
    notaire_id = auth.uid()
  );

-- Policies pour les demandes municipales
CREATE POLICY "Mairies can view their requests" ON municipal_requests
  FOR SELECT USING (mairie_id = auth.uid() OR requester_id = auth.uid());

-- Policies pour les demandes de financement
CREATE POLICY "Banks can view their funding requests" ON funding_requests
  FOR SELECT USING (bank_id = auth.uid() OR applicant_id = auth.uid());

-- Triggers pour updated_at
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_timestamp_notaire_dossiers
  BEFORE UPDATE ON notaire_dossiers
  FOR EACH ROW
  EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_timestamp_transactions
  BEFORE UPDATE ON transactions
  FOR EACH ROW
  EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_timestamp_municipal_requests
  BEFORE UPDATE ON municipal_requests
  FOR EACH ROW
  EXECUTE PROCEDURE trigger_set_timestamp();
