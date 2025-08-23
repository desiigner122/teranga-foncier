# Teranga Foncier – Documentation Technique et Fonctionnelle

## Présentation
Teranga Foncier est une plateforme web moderne de gestion foncière, d’administration, de transactions immobilières et de suivi d’utilisateurs, construite avec React, Supabase, Vite, et une architecture modulaire.

---

## Architecture technique

- **Frontend** : React (Vite, hooks, composants modulaires)
- **Backend** : Supabase (PostgreSQL, Auth, Realtime, Storage)
- **API sécurisée** : Serverless (Vercel) pour opérations sensibles (ex : suppression Auth)
- **Gestion d’état** : Hooks React, contextes, services JS
- **CI/CD** : Déploiement Vercel, variables d’environnement pour la sécurité

---

## Fonctionnalités principales

- **Dashboard Admin** : Statistiques dynamiques, gestion des utilisateurs, institutions, parcelles, transactions, rapports, IA assistant
- **Dashboard Utilisateur (Particulier, Vendeur, etc.)** : Vue personnalisée, favoris, alertes, recommandations, transition de rôle
- **Gestion des utilisateurs** : Création, modification, suppression (avec suppression Auth sécurisée), rôles multiples, notifications
- **Gestion des parcelles** : Listing, filtres, soumission, validation anti-fraude
- **Transactions** : Suivi, reporting, analytics
- **Sécurité** : Auth Supabase, RLS, suppression Auth via API serverless sécurisée
- **Notifications** : Système de notifications, alertes sécurité, IA assistant contextuel

---

## Structure des dossiers

- `src/pages/` : Pages principales (admin, dashboards, auth, etc.)
- `src/components/` : Composants UI réutilisables (modals, cards, widgets, etc.)
- `src/services/` : Services JS pour accès Supabase, gestion utilisateurs, etc.
- `src/lib/` : Clients Supabase, helpers, IA, etc.
- `api/` : Fonctions serverless (ex : suppression sécurisée d’utilisateur)
- `public/` : Assets statiques
- `database/` : Scripts SQL, migrations

---

## Points de sécurité

- **Suppression utilisateur** :
  - Utilise une API serverless sécurisée (clé service_role côté serveur uniquement)
  - Supprime Auth + DB, révoque sessions, anonymise données
- **Variables d’environnement** :
  - Jamais de clé service_role côté client
  - Configuration dans Vercel pour production
- **RLS** : Row Level Security activé sur toutes les tables sensibles

---

## Déploiement & configuration

1. Cloner le repo et installer les dépendances :
   ```bash
   git clone ...
   cd teranga-foncier
   npm install
   ```
2. Configurer les variables d’environnement (voir `.env.example` ou Vercel dashboard)
3. Déployer sur Vercel pour activer les fonctions serverless
4. Ajouter les clés Supabase dans Vercel (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_SUPABASE_SERVICE_ROLE)

---

## Bonnes pratiques

- Toujours passer par l’API serverless pour les opérations sensibles
- Ne jamais exposer la clé service_role côté client
- Utiliser les hooks et services pour toute interaction Supabase
- Sécuriser les accès par rôle et RLS
- Documenter toute nouvelle fonctionnalité dans ce fichier

---

## Contact & support
Pour toute question technique ou contribution, contacter l’équipe projet ou ouvrir une issue sur le repo GitHub.

---

*Dernière mise à jour : août 2025*
