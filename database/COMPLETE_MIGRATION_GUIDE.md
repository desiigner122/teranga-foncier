# 🚀 GUIDE COMPLET D'APPLICATION DES MIGRATIONS SUPABASE

## 📋 PRÉREQUIS
- Accès au Dashboard Supabase de votre projet
- Clé `service_role` configurée (pour certaines opérations admin)
- Sauvegarde récente de la base de données

## 🔄 ORDRE D'EXÉCUTION (OBLIGATOIRE)

### **PHASE 1 : FONDATIONS** ⚡ CRITIQUE
```sql
-- 1. Corrections de schéma de base (OBLIGATOIRE)
-- Copier/coller le contenu de : 20250819_fix_schema_issues.sql
-- ⏱️ Temps estimé : 2-3 minutes

-- 2. Schema complet avec toutes les tables (OBLIGATOIRE)  
-- Copier/coller le contenu de : 20250819_generated_full_schema.sql
-- ⏱️ Temps estimé : 5-10 minutes
-- ⚠️ ATTENTION : Ce fichier est volumineux, exécuter par sections si nécessaire
```

### **PHASE 2 : DONNÉES DE BASE** 📊
```sql
-- 3. Données géographiques du Sénégal
-- Copier/coller le contenu de : 20250819_geo_full_seed.sql
-- ⏱️ Temps estimé : 3-5 minutes

-- 4. Rôles utilisateurs et méthodes de paiement
-- Copier/coller le contenu de : 20250819_seed_roles_payment_methods.sql  
-- ⏱️ Temps estimé : 1-2 minutes
```

### **PHASE 3 : SÉCURITÉ** 🔒
```sql
-- 5. Politiques RLS pour analytics et messaging
-- Copier/coller le contenu de : 20250819_rls_analytics_messaging.sql
-- ⏱️ Temps estimé : 2-3 minutes

-- 6. RLS pour documents et stockage
-- Copier/coller le contenu de : 20250819_rls_user_documents_and_storage.sql
-- ⏱️ Temps estimé : 2-3 minutes
```

### **PHASE 4 : FONCTIONNALITÉS TEMPS RÉEL** ⚡
```sql
-- 7. Fonctions de rafraîchissement des vues matérialisées  
-- Copier/coller le contenu de : 20250819_mv_refresh_functions.sql
-- ⏱️ Temps estimé : 2-3 minutes

-- 8. Système d'événements et notifications
-- Copier/coller le contenu de : 20250819_events_notifications_triggers.sql
-- ⏱️ Temps estimé : 3-5 minutes
```

### **PHASE 5 : NOUVELLES FONCTIONNALITÉS (20 AOÛT)** 🆕
```sql
-- 9. Refonte système complète avec optimisations
-- Copier/coller le contenu de : 20250820_system_refonte_complete.sql
-- ⏱️ Temps estimé : 5-10 minutes

-- 10. Normalisation des types d'utilisateurs
-- Copier/coller le contenu de : 20250820_normalize_user_types.sql
-- ⏱️ Temps estimé : 2-3 minutes

-- 11. Table parcel_submissions renforcée
-- Copier/coller le contenu de : 20250820_parcel_submissions_table.sql
-- ⏱️ Temps estimé : 2-3 minutes
```

### **PHASE 6 : RPC FUNCTIONS DASHBOARDS** 📊
```sql
-- 12. Métriques admin
-- Copier/coller le contenu de : 20250820_rpc_admin_dashboard_metrics.sql

-- 13-19. RPC pour chaque type de dashboard
-- Copier/coller dans l'ordre :
-- - 20250820_rpc_particulier_dashboard.sql
-- - 20250820_rpc_agriculteur_dashboard.sql  
-- - 20250820_rpc_banque_dashboard.sql
-- - 20250820_rpc_investisseur_dashboard.sql
-- - 20250820_rpc_mairie_dashboard.sql
-- - 20250820_rpc_notaire_dashboard.sql
-- - 20250820_rpc_promoteur_dashboard.sql
-- - 20250820_rpc_vendeur_dashboard.sql
-- ⏱️ Temps estimé : 10-15 minutes au total
```

## 🛠️ PROCÉDURE DÉTAILLÉE

### 📍 **ÉTAPE 1 : Préparation**
1. Ouvrir https://supabase.com/dashboard
2. Sélectionner le projet "teranga-foncier"
3. Aller dans **SQL Editor** (icône SQL dans la sidebar)
4. Créer un **New query**

### 📍 **ÉTAPE 2 : Exécution Phase par Phase**

#### Pour chaque fichier :
1. **Ouvrir le fichier** dans votre éditeur local
2. **Copier tout le contenu** (Ctrl+A, Ctrl+C)
3. **Coller dans SQL Editor** Supabase (Ctrl+V) 
4. **Cliquer sur RUN** (ou Ctrl+Enter)
5. **Attendre la fin** de l'exécution (voir le ✅ vert)
6. **Vérifier qu'il n'y a pas d'erreurs** dans l'output

#### ⚠️ **EN CAS D'ERREUR :**
- **Lire le message d'erreur** attentivement
- **Noter la ligne problématique**
- **Corriger si nécessaire** (souvent des contraintes qui existent déjà)
- **Continuer avec le fichier suivant**

### 📍 **ÉTAPE 3 : Vérification**

Après toutes les migrations, exécuter ce script de vérification :

```sql
-- Script de vérification post-migration
SELECT 
  schemaname,
  tablename,
  tableowner
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- Vérifier les fonctions RPC
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public'
AND routine_name LIKE '%dashboard%'
ORDER BY routine_name;

-- Vérifier les politiques RLS
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

## ✅ **VALIDATION FINALE**

Une fois toutes les migrations appliquées :

1. **Tester la connexion** depuis l'application
2. **Vérifier les dashboards** (un par type d'utilisateur)
3. **Tester les fonctionnalités temps réel**
4. **Contrôler les logs d'erreur**

## 🚨 **SAUVEGARDE & SÉCURITÉ**

- **Créer une sauvegarde** avant de commencer
- **Tester sur un environnement de dev** d'abord si possible
- **Garder les logs** d'exécution pour debugging
- **Documenter** toute modification apportée

## 📞 **SUPPORT**

En cas de problème :
1. Vérifier les logs SQL dans Supabase
2. Consulter la documentation Supabase
3. Revenir aux scripts de base si nécessaire

---
**Temps total estimé : 45-60 minutes**
**Fichiers à traiter : 20+ migrations**
**Impact : Production-ready avec toutes les fonctionnalités**
