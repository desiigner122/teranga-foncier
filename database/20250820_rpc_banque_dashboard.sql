-- Fichier : 20250820_rpc_banque_dashboard.sql
-- Description : Crée une fonction PostgreSQL (RPC) pour agréger les données du tableau de bord "Banque".
-- Cette fonction est sécurisée et conçue pour être appelée par un utilisateur authentifié de type "Banque".

CREATE OR REPLACE FUNCTION get_banque_dashboard_data()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    -- Déclaration des variables
    metrics json;
    auth_user_id uuid := auth.uid(); -- ID de l'utilisateur banque authentifié
    bank_id_param uuid;

    -- Variables pour les statistiques
    active_guarantees_count int;
    pending_evaluations_count int;
    pending_funding_requests_count int;
    compliance_rate_val int;
    total_exposure_val numeric;
    security_score_val int;

    -- Variables pour les données JSON
    risk_analysis_json json;
    market_trends_json json;
    recent_guarantees_json json;

BEGIN
    -- 1. Vérifier l'authentification et récupérer l'ID de l'institution bancaire
    IF auth_user_id IS NULL THEN
        RAISE EXCEPTION 'Utilisateur non authentifié.';
    END IF;

    SELECT institution_id INTO bank_id_param FROM public.user_profiles WHERE user_id = auth_user_id;
    IF bank_id_param IS NULL THEN
        RAISE EXCEPTION 'Profil de banque non trouvé pour l''utilisateur.';
    END IF;

    -- 2. Calcul des statistiques principales
    -- Garanties actives
    SELECT count(*)
    INTO active_guarantees_count
    FROM public.bank_guarantees
    WHERE bank_id = bank_id_param AND status = 'active';

    -- Évaluations foncières en attente (assignées à la banque)
    SELECT count(*)
    INTO pending_evaluations_count
    FROM public.land_evaluations
    WHERE evaluator_id = bank_id_param AND status = 'pending'; -- Supposant que la banque est l'évaluateur

    -- Demandes de financement en attente
    SELECT count(*)
    INTO pending_funding_requests_count
    FROM public.financing_requests
    WHERE bank_id = bank_id_param AND status = 'pending';

    -- Taux de conformité (simulation)
    SELECT 98 INTO compliance_rate_val; -- Pour une vraie implémentation, calculer depuis une table `compliance_checks`

    -- Exposition totale
    SELECT COALESCE(SUM(guarantee_amount), 0)
    INTO total_exposure_val
    FROM public.bank_guarantees
    WHERE bank_id = bank_id_param AND status = 'active';

    -- Score de sécurité (simulation)
    SELECT 92 INTO security_score_val; -- Pourrait être calculé par une fonction d'IA anti-fraude

    -- 3. Collecte des données détaillées
    -- Analyse des risques (simulation basée sur la concentration géographique)
    WITH location_counts AS (
        SELECT p.location, count(*) as count
        FROM public.bank_guarantees bg
        JOIN public.parcels p ON bg.parcel_id = p.id
        WHERE bg.bank_id = bank_id_param AND bg.status = 'active'
        GROUP BY p.location
    )
    SELECT json_agg(r) INTO risk_analysis_json FROM (
        SELECT 
            'geographic' as type,
            'medium' as level,
            'Concentration géographique' as title,
            'Risque de concentration dans la zone: ' || location as description,
            'Diversifier le portefeuille' as recommendation
        FROM location_counts
        WHERE count > (SELECT count(*) FROM public.bank_guarantees WHERE bank_id = bank_id_param AND status = 'active') * 0.3
        LIMIT 3
    ) r;

    -- Tendances du marché (simulation)
    market_trends_json := json_build_array(
        json_build_object('type', 'volume', 'title', 'Volume des transactions', 'description', '+5.2% ce mois', 'trend', 'up'),
        json_build_object('type', 'value', 'title', 'Valeur des transactions', 'description', '+8.1% ce mois', 'trend', 'up')
    );

    -- Garanties récentes
    SELECT json_agg(g) INTO recent_guarantees_json FROM (
        SELECT 
            bg.id,
            bg.guarantee_amount,
            bg.status,
            bg.created_at,
            p.reference as parcel_reference,
            u.full_name as client_name
        FROM public.bank_guarantees bg
        JOIN public.parcels p ON bg.parcel_id = p.id
        JOIN public.users u ON bg.user_id = u.id
        WHERE bg.bank_id = bank_id_param
        ORDER BY bg.created_at DESC
        LIMIT 5
    ) g;

    -- 4. Assemblage de l'objet JSON de retour
    metrics := json_build_object(
        'stats', json_build_object(
            'activeGuarantees', active_guarantees_count,
            'pendingEvaluations', pending_evaluations_count,
            'fundingRequests', pending_funding_requests_count,
            'complianceRate', compliance_rate_val,
            'totalExposure', total_exposure_val,
            'securityScore', security_score_val
        ),
        'riskAnalysis', coalesce(risk_analysis_json, '[]'::json),
        'marketTrends', coalesce(market_trends_json, '[]'::json),
        'recentGuarantees', coalesce(recent_guarantees_json, '[]'::json)
    );

    RETURN metrics;
END;
$$;

-- Commentaire
COMMENT ON FUNCTION get_banque_dashboard_data() IS 'Fournit un résumé des données pour le tableau de bord de l''utilisateur de type "Banque".';
