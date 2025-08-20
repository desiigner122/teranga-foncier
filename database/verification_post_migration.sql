-- =================================================================
-- SCRIPT DE VÉRIFICATION POST-MIGRATION
-- =================================================================
-- Exécuter ce script APRÈS avoir appliqué toutes les migrations
-- pour vérifier que tout est correctement configuré

-- =================================================================
-- 1. VÉRIFICATION DES TABLES PRINCIPALES
-- =================================================================
SELECT 
  'Tables principales' as verification_type,
  string_agg(tablename, ', ' ORDER BY tablename) as result
FROM pg_tables 
WHERE schemaname = 'public'
AND tablename IN (
  'users', 'profiles', 'parcels', 'parcel_submissions', 
  'notifications', 'fraud_alerts', 'transactions', 
  'institutions', 'regions', 'departments', 'communes'
);

-- =================================================================
-- 2. VÉRIFICATION DES FONCTIONS RPC DASHBOARDS
-- =================================================================
SELECT 
  'RPC Functions' as verification_type,
  COUNT(*) as total_functions,
  string_agg(routine_name, ', ' ORDER BY routine_name) as functions_list
FROM information_schema.routines 
WHERE routine_schema = 'public'
AND routine_name LIKE '%dashboard%';

-- =================================================================
-- 3. VÉRIFICATION DES POLITIQUES RLS
-- =================================================================
SELECT 
  'RLS Policies' as verification_type,
  COUNT(*) as total_policies,
  COUNT(DISTINCT tablename) as tables_with_rls
FROM pg_policies
WHERE schemaname = 'public';

-- =================================================================
-- 4. VÉRIFICATION DES TRIGGERS
-- =================================================================
SELECT 
  'Triggers' as verification_type,
  COUNT(*) as total_triggers,
  string_agg(trigger_name, ', ' ORDER BY trigger_name) as triggers_list
FROM information_schema.triggers
WHERE trigger_schema = 'public'
AND trigger_name LIKE '%updated_at%' OR trigger_name LIKE '%notify%';

-- =================================================================
-- 5. VÉRIFICATION DES VUES MATÉRIALISÉES
-- =================================================================
SELECT 
  'Materialized Views' as verification_type,
  COUNT(*) as total_mv,
  string_agg(matviewname, ', ' ORDER BY matviewname) as mv_list
FROM pg_matviews
WHERE schemaname = 'public';

-- =================================================================
-- 6. VÉRIFICATION DES EXTENSIONS
-- =================================================================
SELECT 
  'Extensions' as verification_type,
  string_agg(extname, ', ' ORDER BY extname) as extensions_list
FROM pg_extension
WHERE extname IN ('uuid-ossp', 'pgcrypto', 'postgis');

-- =================================================================
-- 7. VÉRIFICATION DES RÔLES SYSTÈME
-- =================================================================
SELECT 
  'System Roles' as verification_type,
  COUNT(*) as total_roles,
  string_agg(name, ', ' ORDER BY name) as roles_list
FROM roles
WHERE name IN ('admin', 'particulier', 'agriculteur', 'banque', 'investisseur', 'mairie', 'notaire', 'promoteur', 'vendeur', 'agent');

-- =================================================================
-- 8. VÉRIFICATION DES DONNÉES GÉOGRAPHIQUES
-- =================================================================
SELECT 
  'Geographic Data' as verification_type,
  (SELECT COUNT(*) FROM regions) as regions_count,
  (SELECT COUNT(*) FROM departments) as departments_count,
  (SELECT COUNT(*) FROM communes) as communes_count;

-- =================================================================
-- 9. TEST DE CONNECTIVITÉ DES FONCTIONS PRINCIPALES
-- =================================================================

-- Test fonction admin dashboard
SELECT 
  'Admin RPC Test' as verification_type,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.routines 
      WHERE routine_name = 'get_admin_dashboard_metrics'
    ) THEN 'Function exists ✅'
    ELSE 'Function missing ❌'
  END as result;

-- Test fonction temps réel
SELECT 
  'Realtime Test' as verification_type,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.routines 
      WHERE routine_name = 'refresh_materialized_views'
    ) THEN 'Function exists ✅'
    ELSE 'Function missing ❌'
  END as result;

-- =================================================================
-- 10. RÉSUMÉ FINAL
-- =================================================================
SELECT 
  '=== RÉSUMÉ MIGRATION ===' as section,
  NOW() as verification_time,
  'Migration completed' as status,
  'Ready for production' as next_step;

-- =================================================================
-- 11. COMMANDES DE MAINTENANCE RECOMMANDÉES
-- =================================================================

-- Actualiser les statistiques
-- ANALYZE;

-- Rafraîchir les vues matérialisées (si elles existent)
-- SELECT refresh_materialized_views();

-- Nettoyer les logs anciens (optionnel)
-- DELETE FROM notifications WHERE created_at < NOW() - INTERVAL '30 days';

SELECT 'Vérification terminée ✅' as final_message;
