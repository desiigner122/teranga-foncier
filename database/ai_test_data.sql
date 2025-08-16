-- Données de test réalistes pour les nouvelles fonctionnalités

-- Insérer des dossiers notariaux de test
INSERT INTO notaire_dossiers (reference, notaire_id, client_id, parcel_id, type, status, priority, valuation, notes) VALUES
('NOT-2025-001', (SELECT id FROM profiles WHERE role = 'notaire' LIMIT 1), (SELECT id FROM profiles WHERE role = 'particulier' LIMIT 1), 1, 'Vente', 'En attente vérification', 'high', 150000000, 'Dossier prioritaire - acheteur pressé'),
('NOT-2025-002', (SELECT id FROM profiles WHERE role = 'notaire' LIMIT 1), (SELECT id FROM profiles WHERE role = 'particulier' LIMIT 1 OFFSET 1), 2, 'Succession', 'Authentification requise', 'medium', 85000000, 'Nécessite vérification des héritiers'),
('NOT-2025-003', (SELECT id FROM profiles WHERE role = 'notaire' LIMIT 1), (SELECT id FROM profiles WHERE role = 'particulier' LIMIT 1 OFFSET 2), 3, 'Donation', 'Conforme', 'low', 45000000, 'Dossier conforme, prêt pour signature');

-- Insérer des activités notariales
INSERT INTO notaire_activities (notaire_id, dossier_id, type, description, status) VALUES
((SELECT id FROM profiles WHERE role = 'notaire' LIMIT 1), 1, 'Vérification', 'Vérification des documents de propriété', 'En cours'),
((SELECT id FROM profiles WHERE role = 'notaire' LIMIT 1), 1, 'Authentification', 'Authentification de l\'acte de vente', 'En attente'),
((SELECT id FROM profiles WHERE role = 'notaire' LIMIT 1), 2, 'Vérification', 'Contrôle succession héritiers', 'Terminé');

-- Insérer des transactions immobilières
INSERT INTO transactions (reference, parcel_id, buyer_id, seller_id, agent_id, notaire_id, type, status, price, commission_rate, workflow_step) VALUES
('TXN-2025-001', 1, 
  (SELECT id FROM profiles WHERE role = 'particulier' LIMIT 1), 
  (SELECT id FROM profiles WHERE role = 'vendeur' LIMIT 1),
  (SELECT id FROM profiles WHERE role = 'agent' LIMIT 1),
  (SELECT id FROM profiles WHERE role = 'notaire' LIMIT 1),
  'Vente', 'En cours', 150000000, 3.5, 'signature_notaire'),
('TXN-2025-002', 2,
  (SELECT id FROM profiles WHERE role = 'particulier' LIMIT 1 OFFSET 1), 
  (SELECT id FROM profiles WHERE role = 'vendeur' LIMIT 1),
  (SELECT id FROM profiles WHERE role = 'agent' LIMIT 1),
  (SELECT id FROM profiles WHERE role = 'notaire' LIMIT 1),
  'Vente', 'Complétée', 95000000, 3.0, 'finalisee');

-- Insérer des prédictions de marché
INSERT INTO market_predictions (location, property_type, predicted_price_per_sqm, confidence_score, factors) VALUES
('Almadies', 'Résidentiel', 185000, 0.89, '{"proximity_to_sea": true, "infrastructure": "excellent", "demand": "high"}'),
('Ngor', 'Résidentiel', 165000, 0.85, '{"tourism_area": true, "accessibility": "good", "development": "moderate"}'),
('Dakar Plateau', 'Commercial', 320000, 0.92, '{"business_district": true, "transport_hub": true, "high_demand": true}'),
('Sicap Liberté', 'Résidentiel', 125000, 0.82, '{"established_neighborhood": true, "middle_class": true, "stable_prices": true}');

-- Insérer des demandes municipales
INSERT INTO municipal_requests (reference, requester_id, mairie_id, parcel_id, request_type, status, priority, estimated_processing_time) VALUES
('MUN-2025-001', 
  (SELECT id FROM profiles WHERE role = 'particulier' LIMIT 1),
  (SELECT id FROM profiles WHERE role = 'mairie' LIMIT 1),
  1, 'Permis de construire', 'En évaluation', 'normal', 45),
('MUN-2025-002',
  (SELECT id FROM profiles WHERE role = 'promoteur' LIMIT 1),
  (SELECT id FROM profiles WHERE role = 'mairie' LIMIT 1),
  2, 'Certificat d\'urbanisme', 'Approuvée', 'high', 30);

-- Insérer des demandes de financement
INSERT INTO funding_requests (reference, applicant_id, bank_id, parcel_id, requested_amount, loan_type, duration_months, interest_rate, status) VALUES
('FIN-2025-001',
  (SELECT id FROM profiles WHERE role = 'particulier' LIMIT 1),
  (SELECT id FROM profiles WHERE role = 'banque' LIMIT 1),
  1, 120000000, 'Crédit habitat', 240, 8.5, 'En évaluation'),
('FIN-2025-002',
  (SELECT id FROM profiles WHERE role = 'promoteur' LIMIT 1),
  (SELECT id FROM profiles WHERE role = 'banque' LIMIT 1),
  3, 500000000, 'Crédit promoteur', 120, 9.2, 'Approuvée');

-- Insérer des projets promoteurs
INSERT INTO promoteur_projects (reference, promoteur_id, name, location, project_type, total_budget, status, start_date, estimated_completion, units_total) VALUES
('PRJ-2025-001',
  (SELECT id FROM profiles WHERE role = 'promoteur' LIMIT 1),
  'Résidence Almadies Premium', 'Almadies', 'Résidentiel', 2500000000, 'Construction', '2025-03-01', '2026-12-31', 48),
('PRJ-2025-002',
  (SELECT id FROM profiles WHERE role = 'promoteur' LIMIT 1),
  'Centre Commercial Ngor', 'Ngor', 'Commercial', 1800000000, 'Planification', '2025-06-01', '2027-03-31', 24);

-- Insérer des analyses de sol
INSERT INTO soil_analyses (parcel_id, agriculteur_id, ph_level, organic_matter, nitrogen_level, phosphorus_level, potassium_level, soil_type, recommendations) VALUES
(4, (SELECT id FROM profiles WHERE role = 'agriculteur' LIMIT 1), 6.8, 3.2, 0.15, 25, 180, 'Limoneux', '{"crops": ["maïs", "mil", "arachide"], "fertilizer": "NPK 15-15-15", "irrigation": "modérée"}'),
(5, (SELECT id FROM profiles WHERE role = 'agriculteur' LIMIT 1), 7.1, 2.8, 0.12, 22, 165, 'Argilo-sableux', '{"crops": ["riz", "tomate", "oignon"], "fertilizer": "Urée + Phosphate", "irrigation": "importante"}');

-- Insérer des investissements
INSERT INTO investments (reference, investor_id, parcel_id, investment_type, amount_invested, expected_roi, holding_period_months, status, purchase_date, current_value, rental_income) VALUES
('INV-2025-001',
  (SELECT id FROM profiles WHERE role = 'investisseur' LIMIT 1),
  1, 'Achat direct', 150000000, 12.5, 60, 'Actif', '2025-01-15', 155000000, 1200000),
('INV-2025-002',
  (SELECT id FROM profiles WHERE role = 'investisseur' LIMIT 1),
  2, 'Copropriété', 85000000, 9.8, 36, 'Actif', '2024-11-20', 88000000, 850000);

-- Insérer des logs d'actions IA pour test
INSERT INTO ai_actions_log (action, details, user_id, success) VALUES
('DELETE_USER', '{"target_user": "test@example.com", "reason": "Account cleanup"}', (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1), true),
('PREDICT_PRICE', '{"location": "Almadies", "predicted_price": 185000, "confidence": 0.89}', (SELECT id FROM profiles WHERE role = 'agent' LIMIT 1), true),
('GENERATE_REPORT', '{"report_type": "monthly_transactions", "period": "2025-01"}', (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1), true);

-- Mettre à jour quelques parcelles avec des coordonnées GPS réalistes pour Dakar
UPDATE parcels SET 
  coordinates = ST_SetSRID(ST_MakePoint(-17.4441, 14.6928), 4326),
  updated_at = NOW()
WHERE id = 1;

UPDATE parcels SET 
  coordinates = ST_SetSRID(ST_MakePoint(-17.4985, 14.7392), 4326),
  updated_at = NOW()
WHERE id = 2;

UPDATE parcels SET 
  coordinates = ST_SetSRID(ST_MakePoint(-17.4764, 14.7167), 4326),
  updated_at = NOW()
WHERE id = 3;

-- Ajouter des métadonnées réalistes aux parcelles
UPDATE parcels SET 
  metadata = jsonb_build_object(
    'amenities', ARRAY['électricité', 'eau_courante', 'égouts', 'internet'],
    'access_road', 'Bitumée',
    'flood_zone', false,
    'development_potential', 'Résidentiel haut standing',
    'zoning', 'R4',
    'last_valuation_date', '2025-01-01'
  )
WHERE location LIKE '%Almadies%';

UPDATE parcels SET 
  metadata = jsonb_build_object(
    'amenities', ARRAY['électricité', 'eau_courante'],
    'access_road', 'Terre battue',
    'flood_zone', false,
    'development_potential', 'Agricole et résidentiel',
    'zoning', 'A1',
    'soil_quality', 'Excellent',
    'irrigation_access', true
  )
WHERE location LIKE '%agricole%' OR area_sqm > 5000;
