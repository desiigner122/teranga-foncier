-- Fichier : 20250820_rpc_mairie_dashboard.sql
-- Description : Crée une fonction PostgreSQL (RPC) pour agréger les données du tableau de bord "Mairie".
-- Cette fonction est sécurisée et conçue pour être appelée par un utilisateur authentifié de type "Mairie".

CREATE OR REPLACE FUNCTION get_mairie_dashboard_data()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    -- Déclaration des variables
    metrics json;
    auth_user_id uuid := auth.uid(); -- ID de l'utilisateur authentifié (qui est la mairie)
    
    -- Variables pour les statistiques
    total_requests_count int;
    pending_requests_count int;
    approved_requests_count int;
    rejected_requests_count int;
    
    municipal_parcels_available_count int;
    building_permits_count int;
    land_disputes_count int;
    
    total_tax_revenue numeric;

    -- Variables pour les données
    recent_requests_data json;
    land_distribution_data json;
    revenue_by_type_data json;

BEGIN
    -- 1. Vérifier l'authentification et le rôle (si nécessaire)
    IF auth_user_id IS NULL THEN
        RAISE EXCEPTION 'Utilisateur non authentifié.';
    END IF;
    -- On suppose que l'ID de la mairie est lié à l'ID de l'utilisateur authentifié.
    -- Dans un schéma réel, il pourrait y avoir une table `mairies` liée à `users`.
    -- Pour cet exemple, nous supposons que `requests.assignee_id` ou une colonne `municipality_id` pointe vers `auth.uid()`.

    -- 2. Calcul des statistiques sur les demandes
    SELECT 
        count(*),
        count(*) FILTER (WHERE status IN ('pending', 'submitted', 'in_progress')),
        count(*) FILTER (WHERE status = 'approved'),
        count(*) FILTER (WHERE status = 'rejected')
    INTO 
        total_requests_count,
        pending_requests_count,
        approved_requests_count,
        rejected_requests_count
    FROM public.requests
    WHERE assignee_id = auth_user_id; -- Demandes assignées à cette mairie

    -- 3. Calcul des statistiques sur les parcelles et permis
    SELECT count(*) INTO municipal_parcels_available_count FROM public.parcels WHERE owner_id = auth_user_id AND status = 'available';
    SELECT count(*) INTO building_permits_count FROM public.requests WHERE assignee_id = auth_user_id AND type = 'permis_construire';
    SELECT count(*) INTO land_disputes_count FROM public.requests WHERE assignee_id = auth_user_id AND type = 'litige';

    -- 4. Calcul des revenus (exemple simplifié)
    -- Dans un vrai système, il y aurait une table `taxes` ou `payments` liée à la mairie.
    -- Ici, on simule en se basant sur les transactions des parcelles de la mairie.
    SELECT coalesce(sum(amount), 0) INTO total_tax_revenue 
    FROM public.transactions 
    WHERE parcel_id IN (SELECT id FROM public.parcels WHERE owner_id = auth_user_id);

    -- 5. Récupération des données détaillées
    -- 5 demandes les plus récentes assignées à la mairie
    SELECT json_agg(r) INTO recent_requests_data FROM (
        SELECT 
            r.id,
            r.type,
            r.status,
            r.created_at,
            u.full_name as applicant_name
        FROM public.requests r
        JOIN public.users u ON r.user_id = u.id
        WHERE r.assignee_id = auth_user_id
        ORDER BY r.created_at DESC
        LIMIT 5
    ) r;

    -- Répartition des parcelles de la mairie par statut
    SELECT json_agg(p) INTO land_distribution_data FROM (
        SELECT status, count(*) as value FROM public.parcels WHERE owner_id = auth_user_id GROUP BY status
    ) p;

    -- Répartition des revenus par type de demande (exemple)
    SELECT json_agg(t) INTO revenue_by_type_data FROM (
        SELECT 
            r.type, 
            coalesce(sum(t.amount), 0) as total_amount
        FROM public.transactions t
        JOIN public.requests r ON t.request_id = r.id
        WHERE r.assignee_id = auth_user_id
        GROUP BY r.type
    ) t;

    -- 6. Assemblage de l'objet JSON de retour
    metrics := json_build_object(
        'stats', json_build_object(
            'totalRequests', total_requests_count,
            'pendingRequests', pending_requests_count,
            'approvedRequests', approved_requests_count,
            'rejectedRequests', rejected_requests_count,
            'municipalParcelsAvailable', municipal_parcels_available_count,
            'buildingPermits', building_permits_count,
            'landDisputes', land_disputes_count,
            'totalRevenue', total_tax_revenue
        ),
        'recentRequests', coalesce(recent_requests_data, '[]'::json),
        'landDistribution', coalesce(land_distribution_data, '[]'::json),
        'revenueByType', coalesce(revenue_by_type_data, '[]'::json)
    );

    RETURN metrics;
END;
$$;

-- Commentaire
COMMENT ON FUNCTION get_mairie_dashboard_data() IS 'Fournit un résumé des données pour le tableau de bord de l''utilisateur de type "Mairie".';
