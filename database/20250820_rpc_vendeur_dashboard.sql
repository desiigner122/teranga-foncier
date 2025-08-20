-- Fichier : 20250820_rpc_vendeur_dashboard.sql
-- Description : Crée une fonction PostgreSQL (RPC) pour agréger les données du tableau de bord "Vendeur".
-- Cette fonction est sécurisée et destinée à être appelée par l'utilisateur vendeur authentifié.

CREATE OR REPLACE FUNCTION get_vendeur_dashboard_data()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    -- Déclaration des variables
    metrics json;
    auth_user_id uuid := auth.uid(); -- ID de l'utilisateur authentifié

    -- Variables pour les statistiques
    total_listings_count int;
    active_listings_count int;
    sold_listings_count int;
    total_revenue_sum numeric;
    total_views_sum int;
    total_inquiries_sum int;

    -- Variables pour les données
    listings_data json;
    performance_data json;
    market_insights_data json; -- Simplifié pour l'instant

BEGIN
    -- 1. Vérifier l'authentification
    IF auth_user_id IS NULL THEN
        RAISE EXCEPTION 'Utilisateur non authentifié.';
    END IF;

    -- 2. Calcul des statistiques principales
    SELECT 
        count(*),
        count(*) FILTER (WHERE status = 'available'),
        count(*) FILTER (WHERE status = 'sold'),
        coalesce(sum(price) FILTER (WHERE status = 'sold'), 0),
        coalesce(sum(views), 0)
    INTO 
        total_listings_count,
        active_listings_count,
        sold_listings_count,
        total_revenue_sum,
        total_views_sum
    FROM public.parcels
    WHERE owner_id = auth_user_id;

    -- Compter le total des demandes de contact pour les parcelles du vendeur
    SELECT count(*) INTO total_inquiries_sum 
    FROM public.requests 
    WHERE parcel_id IN (SELECT id FROM public.parcels WHERE owner_id = auth_user_id);

    -- 3. Récupération des données détaillées
    -- 5 annonces les plus récentes
    SELECT json_agg(p) INTO listings_data FROM (
        SELECT 
            id,
            reference,
            location,
            price,
            surface,
            status,
            views
        FROM public.parcels
        WHERE owner_id = auth_user_id
        ORDER BY created_at DESC
        LIMIT 5
    ) p;

    -- Annonce la plus performante (basée sur le nombre de vues)
    SELECT json_build_object(
        'top_performing_listing', (
            SELECT row_to_json(t) FROM (
                SELECT reference, location, views 
                FROM public.parcels 
                WHERE owner_id = auth_user_id 
                ORDER BY views DESC NULLS LAST 
                LIMIT 1
            ) t
        )
    ) INTO performance_data;

    -- Insights du marché (exemples statiques pour cette version)
    -- Une version plus avancée pourrait analyser les tendances réelles.
    SELECT json_agg(t) INTO market_insights_data FROM (
        SELECT 'info' as type, 'Tendance du marché' as title, 'La demande pour les terrains résidentiels est en hausse de 12% ce trimestre.' as message
        UNION ALL
        SELECT 'tip' as type, 'Améliorez vos photos' as title, 'Les annonces avec plus de 5 photos de haute qualité reçoivent 50% de vues en plus.' as message
        UNION ALL
        SELECT 'warning' as type, 'Vérification des documents' as title, 'Assurez-vous que tous vos documents sont à jour pour accélérer les transactions.' as message
    ) t;

    -- 4. Assemblage de l'objet JSON de retour
    metrics := json_build_object(
        'stats', json_build_object(
            'totalListings', total_listings_count,
            'activeListings', active_listings_count,
            'soldListings', sold_listings_count,
            'totalRevenue', total_revenue_sum,
            'totalViews', total_views_sum,
            'totalInquiries', total_inquiries_sum
        ),
        'recentListings', coalesce(listings_data, '[]'::json),
        'performance', coalesce(performance_data, '{}'::json),
        'marketInsights', coalesce(market_insights_data, '[]'::json)
    );

    RETURN metrics;
END;
$$;

-- Commentaire
COMMENT ON FUNCTION get_vendeur_dashboard_data() IS 'Fournit un résumé des données pour le tableau de bord de l''utilisateur de type "Vendeur".';
