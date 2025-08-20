# ✅ CHECKLIST FINALE - MIGRATION SUPABASE

## 📋 AVANT DE COMMENCER

- [ ] **Accès Supabase** : Je peux me connecter au dashboard Supabase
- [ ] **Projet sélectionné** : Le projet "teranga-foncier" est sélectionné
- [ ] **Permissions admin** : J'ai les droits d'administration sur le projet
- [ ] **Sauvegarde** : J'ai fait une sauvegarde de la base (optionnel mais recommandé)
- [ ] **Fichiers prêts** : Les fichiers de migration sont disponibles localement

## 🚀 ÉTAPES D'EXÉCUTION

### ✅ ÉTAPE 1 : Préparation
- [ ] Ouvrir https://supabase.com/dashboard
- [ ] Sélectionner le projet "teranga-foncier"
- [ ] Aller dans **SQL Editor** (icône SQL dans sidebar)
- [ ] Cliquer sur **"New query"**

### ✅ ÉTAPE 2 : Migration Critique
- [ ] Ouvrir le fichier `database/01_MIGRATION_CRITIQUE_COMBINEE.sql`
- [ ] Copier TOUT le contenu (Ctrl+A + Ctrl+C)
- [ ] Coller dans SQL Editor (Ctrl+V)
- [ ] Cliquer sur **"RUN"** ou Ctrl+Enter
- [ ] ✅ Attendre la confirmation "Migration critique terminée avec succès"
- [ ] ⏱️ Temps écoulé : _____ minutes

### ✅ ÉTAPE 3 : RPC Functions
- [ ] Créer une nouvelle query dans SQL Editor
- [ ] Ouvrir le fichier `database/02_MIGRATION_RPC_FUNCTIONS.sql`
- [ ] Copier TOUT le contenu (Ctrl+A + Ctrl+C)
- [ ] Coller dans SQL Editor (Ctrl+V)
- [ ] Cliquer sur **"RUN"** ou Ctrl+Enter
- [ ] ✅ Attendre la confirmation "Migration RPC Functions terminée avec succès"
- [ ] ⏱️ Temps écoulé : _____ minutes

### ✅ ÉTAPE 4 : Vérification (Optionnel)
- [ ] Créer une nouvelle query dans SQL Editor
- [ ] Ouvrir le fichier `database/verification_post_migration.sql`
- [ ] Copier et exécuter le contenu
- [ ] ✅ Vérifier que toutes les tables sont créées
- [ ] ✅ Vérifier que les fonctions RPC existent
- [ ] ✅ Voir le message "Vérification terminée ✅"

## 🎯 VALIDATION POST-MIGRATION

### ✅ Tables créées (vérifier dans Table Editor)
- [ ] `profiles` - Profils utilisateurs
- [ ] `parcels` - Parcelles immobilières  
- [ ] `parcel_submissions` - Soumissions de parcelles
- [ ] `transactions` - Transactions financières
- [ ] `notifications` - Système de notifications
- [ ] `institutions` - Institutions (banques, mairies, etc.)
- [ ] `regions` - Régions du Sénégal
- [ ] `departments` - Départements
- [ ] `communes` - Communes
- [ ] `roles` - Rôles système
- [ ] `conversations` - Conversations de messagerie
- [ ] `messages` - Messages
- [ ] `fraud_alerts` - Alertes de fraude

### ✅ Fonctions RPC créées (SQL Editor > Functions)
- [ ] `get_admin_dashboard_metrics()`
- [ ] `get_particulier_dashboard_data(user_uuid)`
- [ ] `get_agent_dashboard_data(user_uuid)`
- [ ] `get_agriculteur_dashboard_data(user_uuid)`
- [ ] `get_banque_dashboard_data(user_uuid)`
- [ ] `search_parcels()` 
- [ ] `get_user_notifications()`
- [ ] `create_notification()`
- [ ] `mark_notification_read()`
- [ ] `refresh_materialized_views()`

### ✅ Données de base insérées
- [ ] **Rôles** : 10 rôles système (admin, particulier, agriculteur, etc.)
- [ ] **Régions** : 14 régions du Sénégal (Dakar, Thiès, etc.)
- [ ] **Politiques RLS** : Sécurité activée sur les tables principales

## 🧪 TESTS FONCTIONNELS

### ✅ Test 1 : Fonctions Admin
```sql
SELECT get_admin_dashboard_metrics();
```
- [ ] ✅ Retourne un JSON avec les métriques
- [ ] ✅ Contient users, parcels, transactions, submissions, alerts

### ✅ Test 2 : Recherche de parcelles
```sql
SELECT search_parcels('', NULL, NULL, NULL, NULL, 10, 0);
```
- [ ] ✅ Retourne un JSON avec la liste des parcelles
- [ ] ✅ Contient total_count, page_size, parcels array

### ✅ Test 3 : Tables avec données
```sql
SELECT COUNT(*) FROM roles;
SELECT COUNT(*) FROM regions;
```
- [ ] ✅ roles : doit retourner 10 ou plus
- [ ] ✅ regions : doit retourner 14

## 🚀 TESTS APPLICATION

### ✅ Test 4 : Démarrage application
- [ ] Exécuter `npm run dev` en local
- [ ] ✅ L'application se lance sans erreur
- [ ] ✅ Page d'accueil s'affiche correctement
- [ ] ✅ Aucune erreur de connexion Supabase dans la console

### ✅ Test 5 : Authentification
- [ ] Aller sur la page de connexion
- [ ] Essayer de se connecter avec un compte test
- [ ] ✅ La connexion fonctionne
- [ ] ✅ Le dashboard utilisateur s'affiche

### ✅ Test 6 : Dashboard Admin (si accessible)
- [ ] Se connecter avec un compte admin
- [ ] Aller sur le dashboard admin
- [ ] ✅ Les métriques s'affichent
- [ ] ✅ Les graphiques se chargent
- [ ] ✅ Aucune erreur dans la console

## ❌ EN CAS DE PROBLÈME

### 🔧 Erreurs courantes et solutions

**Erreur : "relation already exists"**
- [ ] ✅ **Solution** : C'est normal, continuer l'exécution

**Erreur : "function already exists"**  
- [ ] ✅ **Solution** : C'est normal, continuer l'exécution

**Erreur : "permission denied"**
- [ ] 🔧 **Solution** : Vérifier les droits admin sur le projet
- [ ] 🔧 Contacter l'administrateur Supabase

**Erreur : "syntax error"**
- [ ] 🔧 **Solution** : Vérifier que le fichier est complet
- [ ] 🔧 Réessayer avec une partie du script

**Application ne se connecte pas à Supabase**
- [ ] 🔧 Vérifier les variables d'environnement
- [ ] 🔧 Vérifier la clé API Supabase
- [ ] 🔧 Tester la connexion depuis le navigateur

## 📊 MÉTRIQUES DE SUCCÈS

- ✅ **Temps total** : _____ minutes (objectif : < 30 min)
- ✅ **Erreurs critiques** : _____ (objectif : 0)
- ✅ **Tables créées** : _____ (objectif : 13+)
- ✅ **Fonctions RPC** : _____ (objectif : 10+)
- ✅ **Application fonctionnelle** : Oui/Non

## 🎉 FINALISATION

- [ ] **Migration terminée** : Toutes les étapes complétées
- [ ] **Tests réussis** : Application fonctionnelle
- [ ] **Documentation** : Notes prises sur les problèmes rencontrés
- [ ] **Équipe informée** : Migration réussie communiquée
- [ ] **Prêt production** : Application prête pour utilisation

---

**📅 Date de migration** : _____________  
**👤 Exécuté par** : _____________  
**⏱️ Durée totale** : _____________  
**✅ Statut final** : Succès / Échec / Partiel  

**🚀 Prochaines étapes :**
- [ ] Déploiement en production
- [ ] Formation utilisateurs
- [ ] Monitoring et supervision
