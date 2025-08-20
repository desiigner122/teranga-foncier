-- Fichier : 20250820_rpc_particulier_dashboard.sql
-- Description : Crée une fonction PostgreSQL (RPC) pour agréger les données du tableau de bord "Particulier".
-- Cette fonction est sécurisée et conçue pour être appelée par l'utilisateur authentifié qui lui est propriétaire.

CREATE OR REPLACE FUNCTION get_particulier_dashboard_data()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER -- Exécuter avec les droits du créateur pour accéder aux données
AS $$
DECLARE
    -- Déclaration des variables
    metrics json;
    auth_user_id uuid := auth.uid(); -- Récupère l'ID de l'utilisateur authentifié
    
    -- Variables pour les statistiques
    favorites_count int;
    saved_searches_count int;
    requests_in_progress_count int;
    transactions_in_progress_count int;

    -- Variables pour les données
    recent_activities_data json;
    recommended_parcels_data json;
    ongoing_requests_data json;
    ongoing_transactions_data json;

BEGIN
    -- 1. Vérifier si l'utilisateur est authentifié
    IF auth_user_id IS NULL THEN
        RAISE EXCEPTION 'Utilisateur non authentifié.';
    END IF;

    -- 2. Calcul des statistiques
    SELECT count(*) INTO favorites_count FROM public.favorites WHERE user_id = auth_user_id;
    SELECT count(*) INTO saved_searches_count FROM public.saved_searches WHERE user_id = auth_user_id;
    SELECT count(*) INTO requests_in_progress_count FROM public.requests WHERE user_id = auth_user_id AND status IN ('pending', 'in_progress', 'submitted');
    SELECT count(*) INTO transactions_in_progress_count FROM public.transactions WHERE user_id = auth_user_id AND status IN ('pending', 'in_progress');

    -- 3. Récupération des données
    -- Activités récentes (ex: 5 dernières)
    SELECT json_agg(t) INTO recent_activities_data FROM (
        SELECT 
            id,
            type as activity_type,
            description,
            created_at
        FROM public.user_activities
        WHERE user_id = auth_user_id
        ORDER BY created_at DESC
        LIMIT 5
    ) t;

    -- Parcelles recommandées (logique simple : les plus récentes vérifiées)
    -- Une logique plus complexe pourrait être basée sur les favoris ou les recherches de l'utilisateur.
    SELECT json_agg(p) INTO recommended_parcels_data FROM (
        SELECT 
            id,
            reference,
            location,
            price,
            surface,
            status
        FROM public.parcels
        WHERE status = 'available' AND verification_status = 'verified'
        ORDER BY created_at DESC
        LIMIT 4
    ) p;

    -- Demandes en cours (3 dernières)
    SELECT json_agg(r) INTO ongoing_requests_data FROM (
        SELECT
            id,
            type,
            status,
            created_at,
            updated_at
        FROM public.requests
        WHERE user_id = auth_user_id AND status IN ('pending', 'in_progress', 'submitted')
        ORDER BY updated_at DESC
        LIMIT 3
    ) r;
    
    -- Transactions en cours (3 dernières)
    SELECT json_agg(tr) INTO ongoing_transactions_data FROM (
        SELECT
            t.id,
            t.status,
            t.amount,
            t.created_at,
            p.reference as parcel_reference
        FROM public.transactions t
        JOIN public.parcels p ON t.parcel_id = p.id
        WHERE t.user_id = auth_user_id AND t.status IN ('pending', 'in_progress')
        ORDER BY t.created_at DESC
        LIMIT 3
    ) tr;

    -- 4. Assemblage de l'objet JSON de retour
    metrics := json_build_object(
        'stats', json_build_object(
            'favoritesCount', favorites_count,
            'savedSearchesCount', saved_searches_count,
            'requestsInProgressCount', requests_in_progress_count,
            'transactionsInProgressCount', transactions_in_progress_count
        ),
        'recentActivities', coalesce(recent_activities_data, '[]'::json),
        'recommendedParcels', coalesce(recommended_parcels_data, '[]'::json),
        'ongoingRequests', coalesce(ongoing_requests_data, '[]'::json),
        'ongoingTransactions', coalesce(ongoing_transactions_data, '[]'::json)
    );

    RETURN metrics;
END;
$$;

-- Commentaire
COMMENT ON FUNCTION get_particulier_dashboard_data() IS 'Fournit un résumé des données pour le tableau de bord de l''utilisateur de type "Particulier".';
