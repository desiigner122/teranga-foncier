-- Fichier : 20250820_rpc_notaire_dashboard.sql
-- Description : Crée une fonction PostgreSQL (RPC) pour agréger les données du tableau de bord "Notaire".
-- Cette fonction est sécurisée et conçue pour être appelée par un utilisateur authentifié de type "Notaire".

CREATE OR REPLACE FUNCTION get_notaire_dashboard_data()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    -- Déclaration des variables
    metrics json;
    auth_user_id uuid := auth.uid(); -- ID de l'utilisateur notaire authentifié

    -- Variables pour les statistiques
    dossiers_a_verifier_count int;
    dossiers_en_cours_count int;
    actes_authentifies_count int;
    dossiers_rejetes_count int;

    -- Variables pour les données
    recent_dossiers_data json;
    dossiers_par_statut_data json;
    activites_recentes_data json;

BEGIN
    -- 1. Vérifier l'authentification
    IF auth_user_id IS NULL THEN
        RAISE EXCEPTION 'Utilisateur non authentifié.';
    END IF;
    -- On suppose que les dossiers (transactions) sont assignés au notaire via une colonne `notary_id`.

    -- 2. Calcul des statistiques sur les dossiers assignés au notaire
    SELECT 
        count(*) FILTER (WHERE status IN ('submitted', 'pending_notary_review')),
        count(*) FILTER (WHERE status = 'in_progress_notary'),
        count(*) FILTER (WHERE status = 'completed' OR status = 'notarized'),
        count(*) FILTER (WHERE status = 'rejected_notary')
    INTO 
        dossiers_a_verifier_count,
        dossiers_en_cours_count,
        actes_authentifies_count,
        dossiers_rejetes_count
    FROM public.transactions
    WHERE notary_id = auth_user_id;

    -- 3. Récupération des données détaillées
    -- 5 dossiers les plus récents assignés au notaire
    SELECT json_agg(t) INTO recent_dossiers_data FROM (
        SELECT 
            t.id,
            t.status,
            t.amount,
            t.created_at,
            p.reference as parcel_reference,
            u.full_name as client_name
        FROM public.transactions t
        JOIN public.parcels p ON t.parcel_id = p.id
        JOIN public.users u ON t.user_id = u.id
        WHERE t.notary_id = auth_user_id
        ORDER BY t.created_at DESC
        LIMIT 5
    ) t;

    -- Répartition des dossiers par statut
    SELECT json_agg(d) INTO dossiers_par_statut_data FROM (
        SELECT status, count(*) as value 
        FROM public.transactions 
        WHERE notary_id = auth_user_id 
        GROUP BY status
    ) d;

    -- Activités récentes (ex: notifications pour le notaire)
    SELECT json_agg(a) INTO activites_recentes_data FROM (
        SELECT 
            id,
            title,
            message,
            created_at
        FROM public.notifications
        WHERE user_id = auth_user_id
        ORDER BY created_at DESC
        LIMIT 5
    ) a;

    -- 4. Assemblage de l'objet JSON de retour
    metrics := json_build_object(
        'stats', json_build_object(
            'dossiersAVerifier', dossiers_a_verifier_count,
            'dossiersEnCours', dossiers_en_cours_count,
            'actesAuthentifies', actes_authentifies_count,
            'dossiersRejetes', dossiers_rejetes_count
        ),
        'recentDossiers', coalesce(recent_dossiers_data, '[]'::json),
        'dossiersParStatut', coalesce(dossiers_par_statut_data, '[]'::json),
        'recentActivities', coalesce(activites_recentes_data, '[]'::json)
    );

    RETURN metrics;
END;
$$;

-- Commentaire
COMMENT ON FUNCTION get_notaire_dashboard_data() IS 'Fournit un résumé des données pour le tableau de bord de l''utilisateur de type "Notaire".';
