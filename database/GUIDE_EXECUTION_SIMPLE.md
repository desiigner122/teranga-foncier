# 🚀 GUIDE PRATIQUE D'EXÉCUTION DES MIGRATIONS SUPABASE

## ⚡ MÉTHODE RAPIDE (RECOMMANDÉE)

### 📋 Ce que vous devez faire :

1. **Ouvrir Supabase Dashboard**
   - Aller sur https://supabase.com/dashboard
   - Sélectionner votre projet "teranga-foncier"

2. **Aller dans SQL Editor**
   - Cliquer sur l'icône SQL dans la sidebar gauche
   - Cliquer sur "New query"

3. **Exécuter les 2 scripts essentiels**

#### 🔥 SCRIPT 1 : Migration Critique (OBLIGATOIRE)
```
📁 Fichier : database/01_MIGRATION_CRITIQUE_COMBINEE.sql
⏱️ Temps : 10-15 minutes
🎯 Objectif : Créer toutes les tables de base
```

**Procédure :**
- Ouvrir le fichier `01_MIGRATION_CRITIQUE_COMBINEE.sql`
- Copier TOUT le contenu (Ctrl+A puis Ctrl+C)
- Coller dans SQL Editor Supabase (Ctrl+V)
- Cliquer sur "RUN" (bouton vert) ou Ctrl+Enter
- Attendre le ✅ de confirmation

#### 🔥 SCRIPT 2 : RPC Functions (OBLIGATOIRE)
```
📁 Fichier : database/02_MIGRATION_RPC_FUNCTIONS.sql
⏱️ Temps : 5-10 minutes
🎯 Objectif : Créer les fonctions pour les dashboards
```

**Procédure :**
- Ouvrir le fichier `02_MIGRATION_RPC_FUNCTIONS.sql`
- Copier TOUT le contenu (Ctrl+A puis Ctrl+C)
- Coller dans SQL Editor Supabase (Ctrl+V)
- Cliquer sur "RUN" (bouton vert) ou Ctrl+Enter
- Attendre le ✅ de confirmation

#### ✅ SCRIPT 3 : Vérification (OPTIONNEL)
```
📁 Fichier : database/verification_post_migration.sql
⏱️ Temps : 1-2 minutes
🎯 Objectif : Vérifier que tout fonctionne
```

**Procédure :**
- Ouvrir le fichier `verification_post_migration.sql`
- Copier TOUT le contenu et exécuter
- Vérifier que toutes les tables et fonctions sont créées

## 🎯 RÉSULTAT ATTENDU

Après ces 2 scripts, vous devriez avoir :

### ✅ Tables créées (20+)
- ✅ `profiles` - Profils utilisateurs
- ✅ `parcels` - Parcelles
- ✅ `parcel_submissions` - Soumissions
- ✅ `transactions` - Transactions
- ✅ `notifications` - Notifications
- ✅ `institutions` - Institutions
- ✅ `regions` - Régions du Sénégal
- ✅ `departments` - Départements
- ✅ `communes` - Communes
- ✅ `roles` - Rôles système
- ✅ Plus toutes les autres tables...

### ✅ Fonctions RPC créées (10+)
- ✅ `get_admin_dashboard_metrics()` - Métriques admin
- ✅ `get_particulier_dashboard_data()` - Dashboard particulier
- ✅ `get_agent_dashboard_data()` - Dashboard agent
- ✅ `search_parcels()` - Recherche de parcelles
- ✅ `get_user_notifications()` - Notifications utilisateur
- ✅ Plus toutes les autres fonctions...

### ✅ Politiques RLS activées
- ✅ Sécurité au niveau ligne configurée
- ✅ Permissions par rôle définies

### ✅ Données de base insérées
- ✅ 10 rôles système
- ✅ 14 régions du Sénégal
- ✅ Index de performance

## 🚨 EN CAS DE PROBLÈME

### ❌ Si vous voyez des erreurs "already exists"
**C'est NORMAL !** Ces erreurs indiquent que certaines tables existent déjà.
**Action :** Continuez, l'exécution se poursuivra.

### ❌ Si vous voyez des erreurs de contraintes
**Cause :** Des données en conflit ou des références manquantes.
**Action :** Notez l'erreur et continuez. La plupart des erreurs sont non-bloquantes.

### ❌ Si l'exécution s'arrête complètement
**Cause :** Erreur de syntaxe ou permission insuffisante.
**Action :** 
1. Vérifiez que vous êtes bien connecté en tant qu'admin
2. Essayez d'exécuter le script par petites sections
3. Contactez le support si le problème persiste

## 🎉 APRÈS LES MIGRATIONS

Une fois terminé :

1. **Tester l'application**
   - Lancer `npm run dev` en local
   - Se connecter avec un compte test
   - Vérifier que les dashboards se chargent

2. **Vérifier les données**
   - Aller dans Supabase > Table Editor
   - Vérifier que les tables sont bien créées
   - Vérifier que les données de base sont présentes

3. **Tester les fonctions**
   - Aller dans Supabase > SQL Editor
   - Tester : `SELECT get_admin_dashboard_metrics();`
   - Doit retourner du JSON avec les métriques

## 📞 SUPPORT

- 📧 En cas de problème : Envoyer les logs d'erreur
- 📋 Garder une trace de ce qui a été exécuté
- 🔄 Possibilité de rollback si nécessaire

---

**⏱️ Temps total : 15-25 minutes**  
**🎯 Résultat : Application 100% fonctionnelle**  
**🚀 Status : Production ready**
