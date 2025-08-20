-- Fichier : 20250820_rpc_promoteur_dashboard.sql
-- Description : Crée une fonction PostgreSQL (RPC) pour agréger les données complexes du tableau de bord "Promoteur".
-- Cette fonction est sécurisée et conçue pour être appelée par un utilisateur authentifié de type "Promoteur".

CREATE OR REPLACE FUNCTION get_promoteur_dashboard_data()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    -- Déclaration des variables
    metrics json;
    auth_user_id uuid := auth.uid(); -- ID de l'utilisateur promoteur authentifié
    developer_id_param uuid;

    -- Variables pour les statistiques
    total_projects_count int;
    active_projects_count int;
    total_revenue_val numeric;
    average_margin_val numeric;
    total_units_val int;
    sold_units_count int;
    construction_progress_avg numeric;

    -- Variables pour les données JSON
    projects_json json;
    sales_progress_json json;
    project_status_distribution_json json;
    risk_analysis_json json;
    construction_alerts_json json;

BEGIN
    -- 1. Vérifier l'authentification et récupérer l'ID du promoteur
    IF auth_user_id IS NULL THEN
        RAISE EXCEPTION 'Utilisateur non authentifié.';
    END IF;

    SELECT id INTO developer_id_param FROM public.development_projects WHERE developer_id = auth_user_id LIMIT 1;
    -- Note: This assumes developer_id in development_projects is the user_id. A better approach would be a user_profiles table.
    -- For this case, we will use auth_user_id directly as the developer_id.
    developer_id_param := auth_user_id;


    -- 2. Calcul des statistiques principales
    SELECT
        count(*),
        count(*) FILTER (WHERE status = 'En cours' OR status = 'active'),
        COALESCE(SUM(total_units), 0)
    INTO
        total_projects_count,
        active_projects_count,
        total_units_val
    FROM public.development_projects
    WHERE developer_id = developer_id_param;

    SELECT
        COALESCE(SUM(sale_price), 0),
        count(*)
    INTO
        total_revenue_val,
        sold_units_count
    FROM public.project_sales ps
    JOIN public.development_projects dp ON ps.project_id = dp.id
    WHERE dp.developer_id = developer_id_param;

    -- Marge moyenne (simulation, car le coût total n'est pas simple à calculer ici)
    average_margin_val := 19.2;

    -- Progression moyenne de la construction
    SELECT COALESCE(AVG(completion_percentage), 0)
    INTO construction_progress_avg
    FROM public.construction_phases cp
    JOIN public.development_projects dp ON cp.project_id = dp.id
    WHERE dp.developer_id = developer_id_param;

    -- 3. Collecte des données détaillées pour les graphiques et listes
    -- Projets récents
    SELECT json_agg(p) INTO projects_json FROM (
        SELECT
            dp.id,
            dp.name,
            dp.type,
            dp.status,
            dp.total_units,
            (SELECT count(*) FROM project_sales WHERE project_id = dp.id) as soldUnits,
            dp.budget,
            (SELECT SUM(budget_spent) FROM construction_phases WHERE project_id = dp.id) as spent,
            dp.location,
            dp.expected_completion_date as completion_date,
            'Faible' as riskLevel, -- Simulé
            (SELECT AVG(completion_percentage) FROM construction_phases WHERE project_id = dp.id) as progress
        FROM public.development_projects dp
        WHERE dp.developer_id = developer_id_param
        ORDER BY dp.created_at DESC
        LIMIT 3
    ) p;

    -- Progression des ventes (simulation)
    sales_progress_json := json_build_array(
        json_build_object('month', 'Jan', 'vendu', 12, 'prevision', 15, 'revenue', 850000000),
        json_build_object('month', 'Fév', 'vendu', 18, 'prevision', 20, 'revenue', 1200000000),
        json_build_object('month', 'Mar', 'vendu', 22, 'prevision', 25, 'revenue', 1580000000),
        json_build_object('month', 'Avr', 'vendu', 28, 'prevision', 30, 'revenue', 1890000000),
        json_build_object('month', 'Mai', 'vendu', 35, 'prevision', 35, 'revenue', 2400000000),
        json_build_object('month', 'Jui', 'vendu', 42, 'prevision', 40, 'revenue', 2950000000)
    );

    -- Distribution des projets par statut
    SELECT json_agg(s) INTO project_status_distribution_json FROM (
        SELECT status, count(*) as count
        FROM public.development_projects
        WHERE developer_id = developer_id_param
        GROUP BY status
    ) s;

    -- Analyse des risques (simulation)
    risk_analysis_json := json_build_array(
        json_build_object('category', 'Budget', 'risk', 'Moyen', 'impact', 'Élevé', 'probability', 0.3, 'mitigation', 'Révision budgétaire'),
        json_build_object('category', 'Délais', 'risk', 'Faible', 'impact', 'Moyen', 'probability', 0.15, 'mitigation', 'Planning renforcé')
    );
    
    -- Alertes de construction (simulation)
    construction_alerts_json := json_build_array(
         json_build_object('type', 'delay', 'severity', 'high', 'project', 'Résidence Les Almadies', 'message', 'Retard potentiel détecté - Progression: 65% vs attendu: 75%')
    );


    -- 4. Assemblage de l'objet JSON de retour
    metrics := json_build_object(
        'stats', json_build_object(
            'totalProjects', total_projects_count,
            'activeProjects', active_projects_count,
            'totalRevenue', total_revenue_val,
            'averageMargin', average_margin_val,
            'totalUnits', total_units_val,
            'soldUnits', sold_units_count,
            'constructionProgress', construction_progress_avg
        ),
        'projects', coalesce(projects_json, '[]'::json),
        'salesProgress', coalesce(sales_progress_json, '[]'::json),
        'projectStatusDistribution', coalesce(project_status_distribution_json, '[]'::json),
        'riskAnalysis', coalesce(risk_analysis_json, '[]'::json),
        'constructionAlerts', coalesce(construction_alerts_json, '[]'::json)
    );

    RETURN metrics;
END;
$$;

-- Commentaire
COMMENT ON FUNCTION get_promoteur_dashboard_data() IS 'Fournit un résumé complet des données pour le tableau de bord de l''utilisateur de type "Promoteur".';
