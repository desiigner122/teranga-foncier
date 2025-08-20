-- Fichier : 20250820_rpc_investisseur_dashboard.sql
-- Description : Crée une fonction PostgreSQL (RPC) pour agréger les données complexes du tableau de bord "Investisseur".
-- Cette fonction est sécurisée et conçue pour être appelée par un utilisateur authentifié de type "Investisseur".

CREATE OR REPLACE FUNCTION get_investisseur_dashboard_data()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    -- Déclaration des variables
    metrics json;
    auth_user_id uuid := auth.uid(); -- ID de l'utilisateur investisseur authentifié

    -- Variables pour le portfolio
    portfolio_current_value numeric;
    portfolio_initial_value numeric;
    portfolio_total_roi numeric;
    portfolio_investments_count int;
    
    -- Variables pour le marché
    market_average_price numeric;
    market_price_growth numeric;
    market_best_roi numeric;

    -- Variables pour les données JSON
    portfolio_distribution_json json;
    performance_history_json json;
    opportunities_json json;
    market_trends_json json;
    risk_metrics_json json;

BEGIN
    -- 1. Vérifier l'authentification
    IF auth_user_id IS NULL THEN
        RAISE EXCEPTION 'Utilisateur non authentifié.';
    END IF;

    -- 2. Calcul des données du portfolio de l'investisseur
    SELECT
        COALESCE(SUM(current_value), 0),
        COALESCE(SUM(initial_investment), 0),
        count(*)
    INTO
        portfolio_current_value,
        portfolio_initial_value,
        portfolio_investments_count
    FROM public.user_investments
    WHERE investor_id = auth_user_id;

    IF portfolio_initial_value > 0 THEN
        portfolio_total_roi := ((portfolio_current_value - portfolio_initial_value) / portfolio_initial_value) * 100;
    ELSE
        portfolio_total_roi := 0;
    END IF;

    -- Distribution du portfolio par type de propriété
    SELECT json_agg(dist) INTO portfolio_distribution_json FROM (
        SELECT 
            p.type as name, 
            SUM(ui.current_value) as value
        FROM public.user_investments ui
        JOIN public.parcels p ON ui.parcel_id = p.id
        WHERE ui.investor_id = auth_user_id
        GROUP BY p.type
    ) dist;

    -- Historique de performance (simulation simple)
    SELECT json_agg(ph) INTO performance_history_json FROM (
        SELECT 'Jan' as month, portfolio_initial_value * 1.02 as value, 2.0 as roi
        UNION ALL SELECT 'Fév', portfolio_initial_value * 1.05, 5.0
        UNION ALL SELECT 'Mar', portfolio_initial_value * 1.08, 8.0
        UNION ALL SELECT 'Avr', portfolio_initial_value * 1.10, 10.0
        UNION ALL SELECT 'Mai', portfolio_initial_value * 1.12, 12.0
        UNION ALL SELECT 'Jui', portfolio_current_value, portfolio_total_roi
    ) ph;

    -- 3. Calcul des données du marché
    -- Prix moyen des parcelles
    SELECT AVG(price_per_sqm * area)
    INTO market_average_price
    FROM public.parcels
    WHERE status = 'available';

    -- Croissance des prix (simulation)
    market_price_growth := 3.2;

    -- Meilleur ROI du marché (simulation)
    market_best_roi := 18.7;

    -- Tendances du marché (simulation)
    market_trends_json := (SELECT json_agg(t) FROM (
        SELECT 'Jan' as month, 2500000 as price, 156 as volume
        UNION ALL SELECT 'Fév', 2580000, 189
        UNION ALL SELECT 'Mar', 2650000, 234
        UNION ALL SELECT 'Avr', 2720000, 198
        UNION ALL SELECT 'Mai', 2800000, 267
        UNION ALL SELECT 'Jui', 2890000, 312
    ) t);

    -- 4. Génération des opportunités d'investissement (basé sur les parcelles disponibles)
    SELECT json_agg(opp) INTO opportunities_json FROM (
        SELECT
            p.id,
            p.title,
            p.type,
            p.price_per_sqm * p.area as price,
            (random() * 10 + 10) as expectedROI, -- ROI estimé aléatoire
            CASE WHEN random() > 0.6 THEN 'Élevé' WHEN random() > 0.3 THEN 'Modéré' ELSE 'Faible' END as risk,
            p.location,
            (random() * 30 + 70)::int as aiScore
        FROM public.parcels p
        WHERE p.status = 'available'
        AND NOT EXISTS (
            SELECT 1 FROM public.user_investments ui 
            WHERE ui.parcel_id = p.id AND ui.investor_id = auth_user_id
        )
        ORDER BY p.price_per_sqm * p.area DESC
        LIMIT 5
    ) opp;

    -- 5. Métriques de risque (simulation)
    risk_metrics_json := json_build_object(
        'sharpeRatio', 1.85,
        'volatility', 15.2,
        'maxDrawdown', -8.5
    );

    -- 6. Assemblage de l'objet JSON de retour
    metrics := json_build_object(
        'portfolio', json_build_object(
            'currentValue', portfolio_current_value,
            'totalROI', portfolio_total_roi,
            'monthlyReturn', 2.3, -- Simulé
            'totalInvestments', portfolio_investments_count,
            'distribution', coalesce(portfolio_distribution_json, '[]'::json),
            'performanceHistory', coalesce(performance_history_json, '[]'::json)
        ),
        'market', json_build_object(
            'averagePrice', market_average_price,
            'priceGrowth', market_price_growth,
            'bestROI', market_best_roi,
            'trends', coalesce(market_trends_json, '[]'::json)
        ),
        'opportunities', coalesce(opportunities_json, '[]'::json),
        'riskMetrics', coalesce(risk_metrics_json, '{}'::json)
    );

    RETURN metrics;
END;
$$;

-- Commentaire
COMMENT ON FUNCTION get_investisseur_dashboard_data() IS 'Fournit un résumé complet des données pour le tableau de bord de l''utilisateur de type "Investisseur".';
