-- =================================================================
-- DIAGNOSTIC DE LA BASE DE DONNÉES SUPABASE
-- =================================================================
-- 🔍 Ce script vérifie l'état actuel de votre base de données
-- 📅 Date : 20 Août 2025
-- ⏱️ Temps estimé : 1-2 minutes

-- =================================================================
-- 🔍 VÉRIFICATION 1 : TABLES EXISTANTES
-- =================================================================
SELECT 
  '🔍 TABLES EXISTANTES' as section,
  string_agg(tablename, ', ' ORDER BY tablename) as tables_found
FROM pg_tables 
WHERE schemaname = 'public'
AND tablename IN ('profiles', 'parcels', 'parcel_submissions', 'transactions', 'notifications', 'fraud_alerts', 'institutions', 'regions', 'departments', 'communes', 'roles', 'conversations', 'messages');

-- =================================================================
-- 🔍 VÉRIFICATION 2 : COLONNES DE LA TABLE PARCELS
-- =================================================================
SELECT 
  '🔍 COLONNES TABLE PARCELS' as section,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'parcels')
    THEN (
      SELECT string_agg(column_name, ', ' ORDER BY ordinal_position)
      FROM information_schema.columns 
      WHERE table_name = 'parcels' AND table_schema = 'public'
    )
    ELSE 'TABLE PARCELS N''EXISTE PAS'
  END as columns_found;

-- =================================================================
-- 🔍 VÉRIFICATION 3 : EXTENSIONS INSTALLÉES
-- =================================================================
SELECT 
  '🔍 EXTENSIONS' as section,
  string_agg(extname, ', ' ORDER BY extname) as extensions_installed
FROM pg_extension;

-- =================================================================
-- 🔍 VÉRIFICATION 4 : SCHÉMAS DISPONIBLES
-- =================================================================
SELECT 
  '🔍 SCHÉMAS' as section,
  string_agg(schema_name, ', ' ORDER BY schema_name) as schemas_found
FROM information_schema.schemata
WHERE schema_name IN ('public', 'auth', 'storage', 'realtime');

-- =================================================================
-- 🔍 VÉRIFICATION 5 : FONCTIONS RPC EXISTANTES
-- =================================================================
SELECT 
  '🔍 FONCTIONS RPC' as section,
  CASE 
    WHEN COUNT(*) = 0 THEN 'AUCUNE FONCTION TROUVÉE'
    ELSE string_agg(routine_name, ', ' ORDER BY routine_name)
  END as functions_found
FROM information_schema.routines 
WHERE routine_schema = 'public'
AND routine_name LIKE '%dashboard%';

-- =================================================================
-- 🔍 VÉRIFICATION 6 : NOMBRE D'ENREGISTREMENTS
-- =================================================================
SELECT 
  '🔍 DONNÉES' as section,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles')
    THEN 'profiles: ' || (SELECT COUNT(*) FROM profiles)
    ELSE 'profiles: TABLE N''EXISTE PAS'
  END ||
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'parcels')
    THEN ', parcels: ' || (SELECT COUNT(*) FROM parcels)
    ELSE ', parcels: TABLE N''EXISTE PAS'
  END ||
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'roles')
    THEN ', roles: ' || (SELECT COUNT(*) FROM roles)
    ELSE ', roles: TABLE N''EXISTE PAS'
  END as data_counts;

-- =================================================================
-- 🔍 VÉRIFICATION 7 : POLITIQUES RLS
-- =================================================================
SELECT 
  '🔍 POLITIQUES RLS' as section,
  CASE 
    WHEN COUNT(*) = 0 THEN 'AUCUNE POLITIQUE RLS TROUVÉE'
    ELSE 'Politiques: ' || COUNT(*) || ' trouvées sur tables: ' || string_agg(DISTINCT tablename, ', ')
  END as rls_status
FROM pg_policies
WHERE schemaname = 'public';

-- =================================================================
-- 🎯 DIAGNOSTIC FINAL ET RECOMMANDATIONS
-- =================================================================
SELECT 
  '🎯 DIAGNOSTIC FINAL' as section,
  CASE 
    WHEN NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles')
    THEN '❌ CRITIQUE : Table profiles manquante. Exécuter 01_MIGRATION_CRITIQUE_COMBINEE.sql'
    
    WHEN NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'parcels')
    THEN '❌ CRITIQUE : Table parcels manquante. Exécuter 01_MIGRATION_CRITIQUE_COMBINEE.sql'
    
    WHEN NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'parcels' AND column_name = 'region')
    THEN '❌ ERREUR : Colonne region manquante dans parcels. Re-exécuter 01_MIGRATION_CRITIQUE_COMBINEE.sql'
    
    WHEN NOT EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'get_admin_dashboard_metrics')
    THEN '⚠️ ATTENTION : Fonctions RPC manquantes. Exécuter 02_MIGRATION_RPC_FUNCTIONS_SECURISEE.sql'
    
    ELSE '✅ BASE DE DONNÉES SEMBLE CORRECTE'
  END as status_and_recommendation;

-- =================================================================
-- 📋 PROCHAINES ÉTAPES RECOMMANDÉES
-- =================================================================
SELECT 
  '📋 PROCHAINES ÉTAPES' as section,
  CASE 
    WHEN NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles')
    THEN '1️⃣ Exécuter database/01_MIGRATION_CRITIQUE_COMBINEE.sql\n2️⃣ Puis exécuter database/02_MIGRATION_RPC_FUNCTIONS_SECURISEE.sql'
    
    WHEN NOT EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'get_admin_dashboard_metrics')
    THEN '✅ Tables OK - Exécuter database/02_MIGRATION_RPC_FUNCTIONS_SECURISEE.sql'
    
    ELSE '🎉 MIGRATION COMPLÈTE - Tester l''application'
  END as next_steps;

-- Message final
SELECT 
  '🔍 DIAGNOSTIC TERMINÉ' as final_message,
  NOW() as checked_at;
