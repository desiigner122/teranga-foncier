-- Fichier : 20250820_rpc_agriculteur_dashboard.sql
-- Description : Crée une fonction PostgreSQL (RPC) pour agréger les données complexes du tableau de bord "Agriculteur".
-- Cette fonction est sécurisée et conçue pour être appelée par un utilisateur authentifié de type "Agriculteur".

CREATE OR REPLACE FUNCTION get_agriculteur_dashboard_data()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    -- Déclaration des variables
    metrics json;
    auth_user_id uuid := auth.uid(); -- ID de l'utilisateur agriculteur authentifié

    -- Variables pour les KPIs
    total_revenue numeric;
    total_expenses numeric;
    total_area numeric;
    total_yield numeric;
    average_yield numeric;
    sustainability_score int;
    water_efficiency int;

    -- Variables pour les données JSON
    weather_data_json json;
    ai_insights_json json;
    crops_json json;
    soil_analysis_json json;
    equipment_json json;
    market_prices_json json;
    sustainability_metrics_json json;
    
BEGIN
    -- 1. Vérifier l'authentification
    IF auth_user_id IS NULL THEN
        RAISE EXCEPTION 'Utilisateur non authentifié.';
    END IF;

    -- 2. Calcul des KPIs principaux
    -- Revenus et dépenses
    SELECT 
        COALESCE(SUM(amount) FILTER (WHERE transaction_type = 'income'), 0),
        COALESCE(SUM(amount) FILTER (WHERE transaction_type = 'expense'), 0)
    INTO total_revenue, total_expenses
    FROM public.agricultural_finances
    WHERE farmer_id = auth_user_id AND transaction_date >= date_trunc('year', now());

    -- Surface totale
    SELECT COALESCE(SUM(area), 0)
    INTO total_area
    FROM public.agricultural_lands
    WHERE farmer_id = auth_user_id;

    -- Rendement total (depuis les récoltes)
    SELECT COALESCE(SUM(hr.quantity), 0)
    INTO total_yield
    FROM public.harvest_records hr
    JOIN public.crops c ON hr.crop_id = c.id
    WHERE c.farmer_id = auth_user_id AND hr.harvest_date >= date_trunc('year', now());

    -- Rendement moyen
    IF total_area > 0 THEN
        average_yield := (total_yield / 1000) / total_area; -- en Tonnes / ha
    ELSE
        average_yield := 0;
    END IF;

    -- 3. Collecte des données détaillées
    -- Données météo (simulation, à remplacer par une vraie source de données si possible)
    SELECT json_agg(wd) INTO weather_data_json FROM (
        SELECT 'Aujourd''hui' as day, 'Ensoleillé' as forecast, 29 as temperature, 5 as rainfall FROM weather_data LIMIT 1
    ) wd;
    -- Pour une implémentation réelle, on utiliserait la localisation des terres de l'agriculteur.
    -- SELECT json_agg(d) INTO weather_data_json FROM (
    --     SELECT recorded_at, temperature, rainfall, forecast 
    --     FROM weather_data 
    --     WHERE location_id IN (SELECT id FROM locations WHERE farmer_id = auth_user_id) 
    --     ORDER BY recorded_at DESC LIMIT 4
    -- ) d;

    -- Gestion des cultures
    SELECT json_agg(c) INTO crops_json FROM (
        SELECT 
            cr.id,
            cr.crop_type as name,
            cr.status,
            al.area,
            cr.yield_estimate as expectedYield,
            (cr.yield_estimate * al.area * (SELECT price FROM market_prices WHERE crop_name = cr.crop_type ORDER BY price_date DESC LIMIT 1)) as estimatedValue,
            cr.growth_stage,
            (EXTRACT(DAY FROM (now() - cr.planting_date)) / EXTRACT(DAY FROM (cr.expected_harvest - cr.planting_date))) * 100 as progress
        FROM public.crops cr
        JOIN public.agricultural_lands al ON cr.land_id = al.id
        WHERE cr.farmer_id = auth_user_id AND cr.status = 'active'
        LIMIT 6
    ) c;

    -- Analyse de sol (la plus récente par parcelle)
    SELECT json_agg(sa) INTO soil_analysis_json FROM (
        SELECT DISTINCT ON (al.id)
            al.id as land_id,
            sa.ph_level,
            sa.nitrogen_level,
            sa.phosphorus_level,
            sa.potassium_level,
            sa.organic_matter,
            'pH' as name, 'check-circle' as icon, 'Optimal' as recommendation -- Simplification pour la démo
        FROM public.soil_analyses sa
        JOIN public.agricultural_lands al ON sa.land_id = al.id
        WHERE al.farmer_id = auth_user_id
        ORDER BY al.id, sa.analysis_date DESC
    ) sa;

    -- Statut des équipements
    SELECT json_agg(eq) INTO equipment_json FROM (
        SELECT 
            id,
            name,
            type,
            status,
            last_maintenance,
            'tractor' as icon -- Simplification
        FROM public.agricultural_equipment
        WHERE owner_id = auth_user_id
        LIMIT 5
    ) eq;

    -- Prix du marché (les plus récents pour les cultures pertinentes)
    SELECT json_agg(mp) INTO market_prices_json FROM (
        SELECT DISTINCT ON (crop_name)
            crop_name as name,
            price as currentPrice,
            (random() * 10 - 5) as weekChange -- Simulation de la variation
        FROM public.market_prices
        WHERE crop_name IN (SELECT DISTINCT crop_type FROM crops WHERE farmer_id = auth_user_id)
        ORDER BY crop_name, price_date DESC
    ) mp;

    -- Métriques de durabilité (calculées ou simulées)
    water_efficiency := 85; -- Simulation
    sustainability_score := 92; -- Simulation
    sustainability_metrics_json := json_build_object(
        'waterEfficiency', json_build_object('name', 'Efficacité Hydrique', 'value', water_efficiency, 'unit', '%', 'rating', 'A', 'icon', 'droplets'),
        'carbonFootprint', json_build_object('name', 'Empreinte Carbone', 'value', 2.1, 'unit', 'T CO2e/ha', 'rating', 'B', 'icon', 'footprints'),
        'biodiversity', json_build_object('name', 'Biodiversité', 'value', 78, 'unit', 'Indice', 'rating', 'A', 'icon', 'flower'),
        'soilHealth', json_build_object('name', 'Santé du Sol', 'value', 88, 'unit', 'Score', 'rating', 'A', 'icon', 'flask-conical')
    );
    
    -- Insights IA (simulation simple basée sur les données)
    ai_insights_json := json_build_object(
        'insights', json_build_array(
            json_build_object('title', 'Optimisation de l''irrigation', 'description', 'Vos parcelles de maïs montrent un besoin en eau supérieur de 15%. Ajustez votre calendrier d''irrigation.', 'icon', 'droplets', 'confidence', 95),
            json_build_object('title', 'Alerte Météo', 'description', 'Des vents forts sont prévus dans 48h. Pensez à protéger les jeunes pousses.', 'icon', 'wind', 'confidence', 88)
        )
    );


    -- 4. Assemblage de l'objet JSON de retour
    metrics := json_build_object(
        'totalRevenue', total_revenue,
        'revenueGrowth', 12.5, -- Simulé
        'totalArea', total_area,
        'areaGrowth', 2.1, -- Simulé
        'averageYield', round(average_yield, 2),
        'yieldGrowth', 5.8, -- Simulé
        'sustainabilityScore', sustainability_score,
        'sustainabilityGrowth', 1.5, -- Simulé
        'weatherData', coalesce(weather_data_json, '[]'::json),
        'aiInsights', coalesce(ai_insights_json->'insights', '[]'::json),
        'crops', coalesce(crops_json, '[]'::json),
        'soilAnalysis', coalesce(soil_analysis_json, '[]'::json),
        'equipment', coalesce(equipment_json, '[]'::json),
        'marketPrices', coalesce(market_prices_json, '[]'::json),
        'sustainabilityMetrics', coalesce(sustainability_metrics_json, '{}'::json)
    );

    RETURN metrics;
END;
$$;

-- Commentaire
COMMENT ON FUNCTION get_agriculteur_dashboard_data() IS 'Fournit un résumé complet des données pour le tableau de bord de l''utilisateur de type "Agriculteur".';
