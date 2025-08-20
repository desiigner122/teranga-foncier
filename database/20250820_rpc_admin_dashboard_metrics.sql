-- Fichier : 20250820_rpc_admin_dashboard_metrics.sql
-- Description : Crée une fonction PostgreSQL (RPC) pour agréger les métriques du tableau de bord admin.
-- Cette fonction est conçue pour être appelée depuis l'application via l'API de Supabase.
-- Elle consolide plusieurs requêtes en une seule pour améliorer les performances.

CREATE OR REPLACE FUNCTION get_admin_dashboard_metrics()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER -- Important pour permettre à la fonction de lire des tables avec RLS
AS $$
DECLARE
    -- Déclaration des variables pour stocker les résultats intermédiaires
    metrics json;
    total_users_count int;
    total_parcels_count int;
    total_requests_count int;
    total_sales_amount_sum numeric;
    user_registrations_data json;
    parcel_status_data json;
    request_types_data json;
    monthly_sales_data json;
    actor_stats_data json;
    upcoming_events_data json;
BEGIN
    -- 1. Calcul des totaux principaux
    SELECT count(*) INTO total_users_count FROM auth.users;
    SELECT count(*) INTO total_parcels_count FROM public.parcels;
    SELECT count(*) INTO total_requests_count FROM public.requests;
    SELECT coalesce(sum(amount), 0) INTO total_sales_amount_sum FROM public.transactions WHERE status = 'completed';

    -- 2. Données pour les graphiques
    -- Inscriptions par mois (12 derniers mois)
    SELECT json_agg(t) INTO user_registrations_data FROM (
        SELECT 
            to_char(date_trunc('month', created_at), 'YYYY-MM') as month,
            count(*) as count
        FROM auth.users
        WHERE created_at > now() - interval '12 months'
        GROUP BY 1
        ORDER BY 1
    ) t;

    -- Répartition des parcelles par statut
    SELECT json_agg(t) INTO parcel_status_data FROM (
        SELECT status, count(*) as value FROM public.parcels GROUP BY status
    ) t;

    -- Répartition des demandes par type
    SELECT json_agg(t) INTO request_types_data FROM (
        SELECT type, count(*) as value FROM public.requests GROUP BY type
    ) t;

    -- Ventes par mois (12 derniers mois)
    SELECT json_agg(t) INTO monthly_sales_data FROM (
        SELECT 
            to_char(date_trunc('month', created_at), 'YYYY-MM') as month,
            sum(amount) as total
        FROM public.transactions
        WHERE status = 'completed' AND created_at > now() - interval '12 months'
        GROUP BY 1
        ORDER BY 1
    ) t;

    -- 3. Statistiques par acteur (exemple)
    -- Cette section peut être étendue pour être plus précise
    SELECT json_build_object(
        'vendeur', json_build_object(
            'parcellesListees', (SELECT count(*) FROM parcels WHERE owner_id IN (SELECT id FROM users WHERE type = 'Vendeur')),
            'transactionsReussies', (SELECT count(*) FROM transactions t JOIN users u ON t.user_id = u.id WHERE u.type = 'Vendeur' AND t.status = 'completed')
        ),
        'particulier', json_build_object(
            'demandesSoumises', (SELECT count(*) FROM requests r JOIN users u ON r.user_id = u.id WHERE u.type = 'Particulier'),
            'acquisitions', (SELECT count(*) FROM transactions t JOIN users u ON t.user_id = u.id WHERE u.type = 'Particulier' AND t.type = 'acquisition')
        ),
        'mairie', json_build_object(
            'parcellesCommunales', (SELECT count(*) FROM parcels WHERE owner_id IN (SELECT id FROM users WHERE type = 'Mairie')),
            'demandesTraitees', (SELECT count(*) FROM requests WHERE assignee_id IN (SELECT id FROM users WHERE type = 'Mairie'))
        ),
        'banque', json_build_object(
            'pretsAccordes', (SELECT count(*) FROM requests WHERE type = 'financement' AND status = 'approved'),
            'garantiesEvaluees', (SELECT count(*) FROM documents WHERE category = 'Garantie Financière' AND verified = true)
        ),
        'notaire', json_build_object(
            'dossiersTraites', (SELECT count(*) FROM requests WHERE assignee_id IN (SELECT id FROM users WHERE type = 'Notaire')),
            'actesAuthentifies', (SELECT count(*) FROM documents WHERE category = 'Acte Notarié' AND verified = true)
        ),
        'agent', json_build_object(
            'clientsAssignes', (SELECT count(distinct user_id) FROM requests WHERE assignee_id IN (SELECT id FROM users WHERE type = 'Agent Immobilier')),
            'visitesPlanifiees', (SELECT count(*) FROM events WHERE type = 'visite' AND status = 'scheduled')
        )
    ) INTO actor_stats_data;

    -- 4. Événements à venir (5 prochains)
    SELECT json_agg(t) INTO upcoming_events_data FROM (
        SELECT id, title, event_date, type, status
        FROM public.events
        WHERE event_date >= now()
        ORDER BY event_date ASC
        LIMIT 5
    ) t;

    -- 5. Assemblage final de l'objet JSON de retour
    metrics := json_build_object(
        'totals', json_build_object(
            'totalUsers', total_users_count,
            'totalParcels', total_parcels_count,
            'totalRequests', total_requests_count,
            'totalSalesAmount', total_sales_amount_sum
        ),
        'charts', json_build_object(
            'userRegistrations', coalesce(user_registrations_data, '[]'::json),
            'parcelStatus', coalesce(parcel_status_data, '[]'::json),
            'requestTypes', coalesce(request_types_data, '[]'::json),
            'monthlySales', coalesce(monthly_sales_data, '[]'::json)
        ),
        'actorStats', coalesce(actor_stats_data, '{}'::json),
        'upcomingEvents', coalesce(upcoming_events_data, '[]'::json)
    );

    RETURN metrics;
END;
$$;

-- Commentaire final
COMMENT ON FUNCTION get_admin_dashboard_metrics() IS 'Fournit un résumé complet des métriques pour le tableau de bord administrateur en un seul appel RPC.';
