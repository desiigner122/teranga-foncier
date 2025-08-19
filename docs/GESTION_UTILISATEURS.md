# Gestion des Utilisateurs dans Teranga Foncier

Ce document explique la mise en place du système de création et gestion des utilisateurs réels dans l'application Teranga Foncier.

## Architecture

Le système de gestion des utilisateurs fonctionne en plusieurs couches :

1. **Interface utilisateur** - Composant React permettant l'ajout et la gestion des utilisateurs
2. **Service de données** - Extension du service Supabase pour créer des utilisateurs avec mot de passe
3. **Backend** - Fonctions SQL et Edge Functions pour sécuriser la création d'utilisateurs

## Configuration requise

### Base de données

Exécuter le script SQL `database/create_user_with_password.sql` dans la console SQL de Supabase. Ce script crée une fonction sécurisée pour ajouter des utilisateurs avec mot de passe.

### Edge Functions

Déployer la fonction Edge `supabase/functions/create-user-with-password/index.ts` en utilisant la CLI Supabase :

```bash
supabase functions deploy create-user-with-password
```

Assurez-vous que la fonction Edge a accès à la clé de service Supabase en définissant les variables d'environnement suivantes :

```bash
supabase secrets set SUPABASE_URL=https://votre-projet.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=votre-clé-service
```

### Variables d'environnement

Ajoutez la variable d'environnement suivante à votre fichier `.env` :

```
VITE_EDGE_BASE_URL=https://votre-projet.supabase.co/functions/v1
```

## Utilisation

Le composant `AdminUsersManagement` offre une interface complète pour :

1. Voir tous les utilisateurs existants
2. Filtrer les utilisateurs par type (Mairie, Banque, Notaire, etc.)
3. Ajouter de nouveaux utilisateurs avec mot de passe

### Ajout d'un utilisateur

Le dialogue `ExceptionalAddUserDialogWithPassword` permet de créer un utilisateur complet avec :

- Email et mot de passe
- Type d'utilisateur (définit les champs dynamiques)
- Champs spécifiques au type (ex: régions, communes pour Mairie)
- Option pour auto-vérifier l'utilisateur
- Option pour envoyer une invitation par email

## Sécurité

Le système utilise plusieurs méthodes pour créer des utilisateurs selon les permissions disponibles :

1. **Méthode directe** - Utilise l'API Supabase Auth Admin (nécessite les privilèges adéquats)
2. **Fonction RPC** - Utilise une fonction PostgreSQL sécurisée
3. **Edge Function** - Utilise une fonction serverless avec la clé de service

## Tables de référence

Le système utilise les tables suivantes pour les données de référence :

- `regions` - Régions du Sénégal
- `departments` - Départements (filtré par région)
- `communes` - Communes (filtré par département)
- `notaire_specialities` - Spécialités des notaires
- `institution_profiles` - Profils institutionnels

## Extension du système

Pour ajouter des nouveaux types d'utilisateurs :

1. Modifier `ExceptionalUserSchemas.js` pour ajouter le nouveau type et ses champs
2. Ajouter le type à `defaultExceptionalTypeOrder` dans le même fichier
3. Si nécessaire, ajouter des tables de référence pour les champs spécifiques

## Déploiement

Toutes les fonctionnalités sont conçues pour fonctionner en production avec Supabase. Assurez-vous que toutes les tables et fonctions nécessaires sont migrées dans l'environnement de production.
