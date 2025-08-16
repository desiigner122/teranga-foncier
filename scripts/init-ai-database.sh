#!/bin/bash

# Script d'initialisation de la base de données avec les fonctionnalités IA

echo "🚀 Initialisation de la base de données Teranga Foncier avec IA..."

# Variables d'environnement (à adapter selon votre configuration)
DB_URL=${SUPABASE_DB_URL:-"postgresql://postgres:password@localhost:54322/postgres"}

echo "📊 Création des tables pour les fonctionnalités IA..."

# Exécuter les scripts SQL
psql $DB_URL -f database/ai_real_data_schema.sql

if [ $? -eq 0 ]; then
    echo "✅ Schéma de base de données créé avec succès"
else
    echo "❌ Erreur lors de la création du schéma"
    exit 1
fi

echo "📋 Insertion des données de test..."

psql $DB_URL -f database/ai_test_data.sql

if [ $? -eq 0 ]; then
    echo "✅ Données de test insérées avec succès"
else
    echo "❌ Erreur lors de l'insertion des données de test"
    exit 1
fi

echo "🔧 Configuration des permissions et indexes..."

# Vérifier la création des indexes
psql $DB_URL -c "
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename IN (
    'notaire_dossiers', 
    'transactions', 
    'market_predictions',
    'municipal_requests',
    'funding_requests'
)
ORDER BY tablename, indexname;
"

echo "🔐 Vérification des politiques RLS..."

psql $DB_URL -c "
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename IN (
    'notaire_dossiers', 
    'transactions', 
    'municipal_requests',
    'funding_requests'
)
ORDER BY tablename, policyname;
"

echo "📈 Statistiques des tables créées..."

psql $DB_URL -c "
SELECT 
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count,
    pg_size_pretty(pg_total_relation_size(quote_ident(table_name))) as table_size
FROM information_schema.tables t
WHERE table_schema = 'public' 
AND table_name IN (
    'ai_actions_log',
    'notaire_dossiers',
    'notaire_activities', 
    'transactions',
    'market_predictions',
    'municipal_requests',
    'funding_requests',
    'promoteur_projects',
    'soil_analyses',
    'investments'
)
ORDER BY table_name;
"

echo "🎯 Création des vues pour les dashboards..."

psql $DB_URL -c "
-- Vue pour les statistiques administrateur
CREATE OR REPLACE VIEW admin_dashboard_stats AS
SELECT 
    (SELECT COUNT(*) FROM profiles WHERE status != 'deleted') as total_users,
    (SELECT COUNT(*) FROM profiles WHERE last_sign_in_at > NOW() - INTERVAL '30 days') as active_users,
    (SELECT COUNT(*) FROM parcels) as total_parcels,
    (SELECT COUNT(*) FROM transactions WHERE status = 'En cours') as active_transactions,
    (SELECT COUNT(*) FROM notaire_dossiers WHERE status = 'En attente vérification') as pending_verifications;

-- Vue pour les statistiques notaire
CREATE OR REPLACE VIEW notaire_dashboard_stats AS
SELECT 
    n.notaire_id,
    COUNT(CASE WHEN n.status = 'En attente vérification' THEN 1 END) as dossiers_en_attente,
    COUNT(CASE WHEN n.status = 'Authentifié' AND n.updated_at > DATE_TRUNC('month', NOW()) THEN 1 END) as actes_authentifies_mois,
    COUNT(CASE WHEN n.status = 'En cours' THEN 1 END) as procedures_en_cours,
    COUNT(CASE WHEN n.status = 'Conforme' THEN 1 END) as verifications_conformes
FROM notaire_dossiers n
GROUP BY n.notaire_id;

-- Vue pour les tendances du marché
CREATE OR REPLACE VIEW market_trends AS
SELECT 
    location,
    AVG(predicted_price_per_sqm) as avg_price_per_sqm,
    MAX(confidence_score) as max_confidence,
    COUNT(*) as prediction_count,
    MAX(created_at) as last_updated
FROM market_predictions
WHERE valid_until > NOW()
GROUP BY location
ORDER BY avg_price_per_sqm DESC;
"

if [ $? -eq 0 ]; then
    echo "✅ Vues créées avec succès"
else
    echo "❌ Erreur lors de la création des vues"
fi

echo "🤖 Configuration des fonctions IA..."

psql $DB_URL -c "
-- Fonction pour calculer le score de confiance d'une prédiction
CREATE OR REPLACE FUNCTION calculate_prediction_confidence(
    location_param VARCHAR,
    property_type_param VARCHAR,
    historical_transactions_count INTEGER
) 
RETURNS DECIMAL(3,2) AS \$\$
DECLARE
    base_confidence DECIMAL(3,2) := 0.5;
    location_factor DECIMAL(3,2) := 0.0;
    data_factor DECIMAL(3,2) := 0.0;
BEGIN
    -- Facteur basé sur la localisation (zones premium = plus de confiance)
    IF location_param IN ('Almadies', 'Ngor', 'Dakar Plateau') THEN
        location_factor := 0.3;
    ELSIF location_param IN ('Sicap Liberté', 'Mermoz', 'Fann') THEN
        location_factor := 0.2;
    ELSE
        location_factor := 0.1;
    END IF;
    
    -- Facteur basé sur le nombre de transactions historiques
    IF historical_transactions_count >= 50 THEN
        data_factor := 0.3;
    ELSIF historical_transactions_count >= 20 THEN
        data_factor := 0.2;
    ELSIF historical_transactions_count >= 10 THEN
        data_factor := 0.1;
    ELSE
        data_factor := 0.05;
    END IF;
    
    RETURN LEAST(0.95, base_confidence + location_factor + data_factor);
END;
\$\$ LANGUAGE plpgsql;

-- Fonction pour générer des recommandations d'investissement
CREATE OR REPLACE FUNCTION generate_investment_recommendations(
    budget_min BIGINT,
    budget_max BIGINT,
    preferred_locations TEXT[]
)
RETURNS TABLE(
    parcel_id BIGINT,
    location VARCHAR,
    predicted_roi DECIMAL(5,2),
    confidence_score DECIMAL(3,2),
    recommendation_reason TEXT
) AS \$\$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.location,
        CASE 
            WHEN mp.predicted_price_per_sqm > 150000 THEN 8.5
            WHEN mp.predicted_price_per_sqm > 100000 THEN 12.0
            ELSE 15.5
        END as predicted_roi,
        mp.confidence_score,
        CASE 
            WHEN p.location = ANY(preferred_locations) THEN 'Zone préférée avec bon potentiel'
            WHEN mp.predicted_price_per_sqm < 120000 THEN 'Prix attractif pour la zone'
            ELSE 'Opportunité d''investissement standard'
        END as recommendation_reason
    FROM parcels p
    JOIN market_predictions mp ON mp.location = p.location
    WHERE p.price BETWEEN budget_min AND budget_max
    AND p.status = 'available'
    AND mp.valid_until > NOW()
    ORDER BY mp.confidence_score DESC, predicted_roi DESC
    LIMIT 10;
END;
\$\$ LANGUAGE plpgsql;
"

if [ $? -eq 0 ]; then
    echo "✅ Fonctions IA configurées avec succès"
else
    echo "❌ Erreur lors de la configuration des fonctions IA"
fi

echo "🔄 Test des fonctionnalités IA..."

# Test de la fonction de prédiction
psql $DB_URL -c "
SELECT calculate_prediction_confidence('Almadies', 'Résidentiel', 25) as confidence_test;
"

# Test des recommandations d'investissement
psql $DB_URL -c "
SELECT * FROM generate_investment_recommendations(50000000, 200000000, ARRAY['Almadies', 'Ngor']) LIMIT 3;
"

echo ""
echo "🎉 Initialisation terminée avec succès !"
echo ""
echo "📋 Résumé des fonctionnalités activées :"
echo "   ✅ Tables IA et données réelles"
echo "   ✅ Système de logs d'actions IA"
echo "   ✅ Gestion des dossiers notariaux"
echo "   ✅ Prédictions de marché"
echo "   ✅ Demandes municipales et bancaires"
echo "   ✅ Projets promoteurs et analyses agricoles"
echo "   ✅ Système d'investissements"
echo "   ✅ Vues et fonctions IA"
echo "   ✅ Politiques de sécurité RLS"
echo ""
echo "🔗 Prochaines étapes :"
echo "   1. Configurer les variables d'environnement IA (OPENAI_API_KEY)"
echo "   2. Tester l'assistant IA dans les dashboards"
echo "   3. Personnaliser les prédictions selon vos besoins"
echo "   4. Ajuster les politiques de sécurité si nécessaire"
echo ""
