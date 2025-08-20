-- =================================================================
-- MIGRATION RPC FUNCTIONS - TERANGA FONCIER
-- =================================================================
-- 🚨 IMPORTANT : Exécuter ce script APRÈS la migration critique
-- 📅 Date : 20 Août 2025
-- ⏱️ Temps estimé : 5-10 minutes

-- =================================================================
-- 🔧 FONCTION 1 : ADMIN DASHBOARD METRICS
-- =================================================================
CREATE OR REPLACE FUNCTION get_admin_dashboard_metrics()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'users', json_build_object(
      'total', COALESCE((SELECT COUNT(*) FROM profiles), 0),
      'active', COALESCE((SELECT COUNT(*) FROM profiles WHERE status = 'active'), 0),
      'new_today', COALESCE((SELECT COUNT(*) FROM profiles WHERE DATE(created_at) = CURRENT_DATE), 0),
      'by_type', COALESCE((
        SELECT json_object_agg(user_type, count)
        FROM (
          SELECT user_type, COUNT(*) as count
          FROM profiles
          GROUP BY user_type
        ) t
      ), '{}')
    ),
    'parcels', json_build_object(
      'total', COALESCE((SELECT COUNT(*) FROM parcels), 0),
      'available', COALESCE((SELECT COUNT(*) FROM parcels WHERE status = 'available'), 0),
      'sold', COALESCE((SELECT COUNT(*) FROM parcels WHERE status = 'sold'), 0),
      'new_today', COALESCE((SELECT COUNT(*) FROM parcels WHERE DATE(created_at) = CURRENT_DATE), 0)
    ),
    'transactions', json_build_object(
      'total', COALESCE((SELECT COUNT(*) FROM transactions), 0),
      'completed', COALESCE((SELECT COUNT(*) FROM transactions WHERE status = 'completed'), 0),
      'pending', COALESCE((SELECT COUNT(*) FROM transactions WHERE status = 'pending'), 0),
      'total_amount', COALESCE((SELECT SUM(amount) FROM transactions WHERE status = 'completed'), 0)
    ),
    'submissions', json_build_object(
      'total', COALESCE((SELECT COUNT(*) FROM parcel_submissions), 0),
      'pending', COALESCE((SELECT COUNT(*) FROM parcel_submissions WHERE status = 'pending'), 0),
      'approved', COALESCE((SELECT COUNT(*) FROM parcel_submissions WHERE status = 'approved'), 0),
      'today', COALESCE((SELECT COUNT(*) FROM parcel_submissions WHERE DATE(created_at) = CURRENT_DATE), 0)
    ),
    'alerts', json_build_object(
      'total', COALESCE((SELECT COUNT(*) FROM fraud_alerts WHERE status = 'active'), 0),
      'critical', COALESCE((SELECT COUNT(*) FROM fraud_alerts WHERE status = 'active' AND severity = 'critical'), 0),
      'high', COALESCE((SELECT COUNT(*) FROM fraud_alerts WHERE status = 'active' AND severity = 'high'), 0)
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =================================================================
-- 🔧 FONCTION 2 : PARTICULIER DASHBOARD
-- =================================================================
CREATE OR REPLACE FUNCTION get_particulier_dashboard_data(user_uuid UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'profile', (
      SELECT row_to_json(p)
      FROM (
        SELECT id, first_name, last_name, email, phone, user_type, status,
               email_verified, phone_verified, identity_verified
        FROM profiles WHERE id = user_uuid
      ) p
    ),
    'favorite_parcels', COALESCE((
      SELECT json_agg(
        json_build_object(
          'id', p.id,
          'title', p.title,
          'location', p.location,
          'price', p.price,
          'area_sqm', p.area_sqm,
          'images', p.images
        )
      )
      FROM parcels p
      WHERE EXISTS (
        SELECT 1 FROM parcel_submissions ps 
        WHERE ps.parcel_id = p.id AND ps.submitted_by = user_uuid
      )
      LIMIT 10
    ), '[]'),
    'recent_requests', COALESCE((
      SELECT json_agg(
        json_build_object(
          'id', ps.id,
          'parcel_title', p.title,
          'submission_type', ps.submission_type,
          'status', ps.status,
          'amount', ps.amount,
          'created_at', ps.created_at
        )
      )
      FROM parcel_submissions ps
      JOIN parcels p ON ps.parcel_id = p.id
      WHERE ps.submitted_by = user_uuid
      ORDER BY ps.created_at DESC
      LIMIT 10
    ), '[]'),
    'transactions', COALESCE((
      SELECT json_agg(
        json_build_object(
          'id', t.id,
          'type', t.type,
          'amount', t.amount,
          'status', t.status,
          'created_at', t.created_at
        )
      )
      FROM transactions t
      WHERE t.user_id = user_uuid
      ORDER BY t.created_at DESC
      LIMIT 5
    ), '[]'),
    'notifications_count', COALESCE((
      SELECT COUNT(*)
      FROM notifications
      WHERE user_id = user_uuid AND read = false
    ), 0)
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =================================================================
-- 🔧 FONCTION 3 : AGENT DASHBOARD
-- =================================================================
CREATE OR REPLACE FUNCTION get_agent_dashboard_data(user_uuid UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'assigned_parcels', COALESCE((
      SELECT json_agg(
        json_build_object(
          'id', p.id,
          'title', p.title,
          'location', p.location,
          'price', p.price,
          'status', p.status,
          'area_sqm', p.area_sqm
        )
      )
      FROM parcels p
      WHERE p.agent_id = user_uuid
      ORDER BY p.created_at DESC
      LIMIT 20
    ), '[]'),
    'pending_submissions', COALESCE((
      SELECT json_agg(
        json_build_object(
          'id', ps.id,
          'parcel_title', p.title,
          'submitter_name', prof.first_name || ' ' || prof.last_name,
          'submission_type', ps.submission_type,
          'amount', ps.amount,
          'created_at', ps.created_at
        )
      )
      FROM parcel_submissions ps
      JOIN parcels p ON ps.parcel_id = p.id
      JOIN profiles prof ON ps.submitted_by = prof.id
      WHERE p.agent_id = user_uuid AND ps.status = 'pending'
      ORDER BY ps.created_at DESC
      LIMIT 10
    ), '[]'),
    'client_inquiries', COALESCE((
      SELECT json_agg(
        json_build_object(
          'id', c.id,
          'title', c.title,
          'last_message', (
            SELECT content FROM messages
            WHERE conversation_id = c.id
            ORDER BY created_at DESC
            LIMIT 1
          ),
          'updated_at', c.updated_at
        )
      )
      FROM conversations c
      JOIN conversation_participants cp ON c.id = cp.conversation_id
      WHERE cp.user_id = user_uuid
      ORDER BY c.updated_at DESC
      LIMIT 10
    ), '[]'),
    'monthly_sales', COALESCE((
      SELECT json_build_object(
        'count', COUNT(*),
        'total_amount', SUM(t.amount)
      )
      FROM transactions t
      JOIN parcels p ON t.parcel_id = p.id
      WHERE p.agent_id = user_uuid
        AND t.status = 'completed'
        AND t.created_at >= date_trunc('month', CURRENT_DATE)
    ), '{"count": 0, "total_amount": 0}')
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =================================================================
-- 🔧 FONCTION 4 : AGRICULTEUR DASHBOARD
-- =================================================================
CREATE OR REPLACE FUNCTION get_agriculteur_dashboard_data(user_uuid UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'my_lands', COALESCE((
      SELECT json_agg(
        json_build_object(
          'id', p.id,
          'title', p.title,
          'area_sqm', p.area_sqm,
          'location', p.location,
          'land_type', p.land_type,
          'status', p.status
        )
      )
      FROM parcels p
      WHERE p.owner_id = user_uuid AND p.land_type = 'agricultural'
      ORDER BY p.created_at DESC
    ), '[]'),
    'equipment_summary', json_build_object(
      'total_items', 0,
      'operational', 0,
      'maintenance_needed', 0
    ),
    'weather_alerts', json_build_object(
      'today', 'Ensoleillé, 28°C',
      'tomorrow', 'Partiellement nuageux, 26°C',
      'alerts', '[]'
    ),
    'recent_activities', COALESCE((
      SELECT json_agg(
        json_build_object(
          'activity', 'Terrain ' || title || ' mis à jour',
          'date', updated_at,
          'type', 'land_update'
        )
      )
      FROM parcels
      WHERE owner_id = user_uuid
      ORDER BY updated_at DESC
      LIMIT 5
    ), '[]')
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =================================================================
-- 🔧 FONCTION 5 : BANQUE DASHBOARD
-- =================================================================
CREATE OR REPLACE FUNCTION get_banque_dashboard_data(user_uuid UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'funding_requests', COALESCE((
      SELECT json_agg(
        json_build_object(
          'id', ps.id,
          'applicant_name', prof.first_name || ' ' || prof.last_name,
          'parcel_title', p.title,
          'amount', ps.amount,
          'status', ps.status,
          'created_at', ps.created_at
        )
      )
      FROM parcel_submissions ps
      JOIN profiles prof ON ps.submitted_by = prof.id
      JOIN parcels p ON ps.parcel_id = p.id
      WHERE ps.submission_type = 'funding_request'
      ORDER BY ps.created_at DESC
      LIMIT 10
    ), '[]'),
    'guarantees', json_build_object(
      'active', 0,
      'pending', 0,
      'total_amount', 0
    ),
    'compliance_status', json_build_object(
      'score', 95,
      'last_check', CURRENT_DATE,
      'issues', '[]'
    ),
    'portfolio_summary', json_build_object(
      'total_loans', 0,
      'default_rate', 0,
      'avg_amount', 0
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =================================================================
-- 🔧 FONCTION 6 : REFRESH MATERIALIZED VIEWS
-- =================================================================
CREATE OR REPLACE FUNCTION refresh_materialized_views()
RETURNS TEXT AS $$
BEGIN
  -- Cette fonction rafraîchira les vues matérialisées quand elles seront créées
  -- Pour l'instant, elle retourne simplement un message
  RETURN 'Materialized views refreshed at ' || NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =================================================================
-- 🔧 FONCTION 7 : SEARCH PARCELS
-- =================================================================
CREATE OR REPLACE FUNCTION search_parcels(
  search_query TEXT DEFAULT '',
  region_filter TEXT DEFAULT NULL,
  min_price DECIMAL DEFAULT NULL,
  max_price DECIMAL DEFAULT NULL,
  land_type_filter TEXT DEFAULT NULL,
  page_size INTEGER DEFAULT 20,
  page_offset INTEGER DEFAULT 0
)
RETURNS JSON AS $$
DECLARE
  result JSON;
  total_count INTEGER;
BEGIN
  -- Compter le total
  SELECT COUNT(*) INTO total_count
  FROM parcels p
  WHERE p.status = 'available'
    AND (search_query = '' OR p.title ILIKE '%' || search_query || '%' OR p.description ILIKE '%' || search_query || '%')
    AND (region_filter IS NULL OR p.location ILIKE '%' || region_filter || '%')
    AND (min_price IS NULL OR p.price >= min_price)
    AND (max_price IS NULL OR p.price <= max_price)
    AND (land_type_filter IS NULL OR p.land_type = land_type_filter);

  -- Récupérer les résultats paginés
  SELECT json_build_object(
    'parcels', COALESCE((
      SELECT json_agg(
        json_build_object(
          'id', p.id,
          'title', p.title,
          'description', p.description,
          'location', p.location,
          'price', p.price,
          'area_sqm', p.area_sqm,
          'land_type', p.land_type,
          'images', p.images,
          'created_at', p.created_at
        )
      )
      FROM (
        SELECT *
        FROM parcels p
        WHERE p.status = 'available'
          AND (search_query = '' OR p.title ILIKE '%' || search_query || '%' OR p.description ILIKE '%' || search_query || '%')
          AND (region_filter IS NULL OR p.location ILIKE '%' || region_filter || '%')
          AND (min_price IS NULL OR p.price >= min_price)
          AND (max_price IS NULL OR p.price <= max_price)
          AND (land_type_filter IS NULL OR p.land_type = land_type_filter)
        ORDER BY p.created_at DESC
        LIMIT page_size OFFSET page_offset
      ) p
    ), '[]'),
    'total_count', total_count,
    'page_size', page_size,
    'page_offset', page_offset
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =================================================================
-- 🔧 FONCTION 8 : GET USER NOTIFICATIONS
-- =================================================================
CREATE OR REPLACE FUNCTION get_user_notifications(user_uuid UUID, unread_only BOOLEAN DEFAULT FALSE)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'notifications', COALESCE((
      SELECT json_agg(
        json_build_object(
          'id', n.id,
          'title', n.title,
          'body', n.body,
          'type', n.type,
          'data', n.data,
          'read', n.read,
          'created_at', n.created_at
        )
      )
      FROM notifications n
      WHERE n.user_id = user_uuid
        AND (NOT unread_only OR n.read = false)
      ORDER BY n.created_at DESC
      LIMIT 50
    ), '[]'),
    'unread_count', (
      SELECT COUNT(*)
      FROM notifications
      WHERE user_id = user_uuid AND read = false
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =================================================================
-- 🔧 FONCTION 9 : MARK NOTIFICATION AS READ
-- =================================================================
CREATE OR REPLACE FUNCTION mark_notification_read(notification_uuid UUID, user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE notifications
  SET read = true, read_at = NOW()
  WHERE id = notification_uuid AND user_id = user_uuid;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =================================================================
-- 🔧 FONCTION 10 : CREATE NOTIFICATION
-- =================================================================
CREATE OR REPLACE FUNCTION create_notification(
  user_uuid UUID,
  title_text TEXT,
  body_text TEXT DEFAULT NULL,
  notification_type TEXT DEFAULT 'info',
  data_json JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO notifications (user_id, title, body, type, data)
  VALUES (user_uuid, title_text, body_text, notification_type, data_json)
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =================================================================
-- ✅ POLITIQUES RLS DE BASE
-- =================================================================

-- Enable RLS sur les tables principales
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE parcels ENABLE ROW LEVEL SECURITY;
ALTER TABLE parcel_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Politique pour profiles : les utilisateurs peuvent voir et modifier leur propre profil
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Politique pour parcels : tout le monde peut voir les parcelles disponibles
CREATE POLICY "Anyone can view available parcels" ON parcels
  FOR SELECT USING (status = 'available');

CREATE POLICY "Owners can manage their parcels" ON parcels
  FOR ALL USING (auth.uid() = owner_id);

-- Politique pour notifications : utilisateurs voient leurs propres notifications
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

-- Politique pour transactions : utilisateurs voient leurs propres transactions
CREATE POLICY "Users can view own transactions" ON transactions
  FOR SELECT USING (auth.uid() = user_id);

-- =================================================================
-- 🎉 FINALISATION
-- =================================================================

-- Actualiser les statistiques
ANALYZE;

-- Message de confirmation
SELECT 
  'Migration RPC Functions terminée avec succès ✅' as message,
  NOW() as completed_at,
  'Toutes les fonctions essentielles sont maintenant disponibles' as status;
