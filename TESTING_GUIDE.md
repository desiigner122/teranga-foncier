# Guide de Test - Plateforme Teranga Foncier

## 🧪 Tests de Fonctionnalité Post-Modernisation

### Prérequis
- Application démarrée : `npm run dev`
- Accès à http://localhost:5173/
- Connexion Supabase configurée
- Données de test disponibles

---

## 1. 🔐 Test du Système d'Authentification

### Test de Connexion
- [ ] Accéder à `/login`
- [ ] Tester la connexion avec des identifiants valides
- [ ] Vérifier la redirection après connexion
- [ ] Confirmer que le profil utilisateur se charge

### Test de Vérification d'Identité
- [ ] Nouvel utilisateur non vérifié → redirection vers vérification
- [ ] Upload de documents d'identité fonctionne
- [ ] Statuts de vérification (En attente, Approuvé, Rejeté) s'affichent
- [ ] Utilisateur vérifié accède directement au dashboard

---

## 2. 📊 Test des Dashboards Modernisés

### Dashboard Particulier (`/dashboard/particulier`)
- [ ] Chargement des données utilisateur depuis Supabase
- [ ] Affichage des statistiques personnalisées
- [ ] Fonctionnement de l'IA intégrée
- [ ] Navigation sidebar fonctionnelle
- [ ] Responsive design

### Dashboard Vendeur (`/dashboard/vendeur`)
- [ ] Données de vente en temps réel
- [ ] Gestion des annonces
- [ ] Suivi des demandes
- [ ] Intégration IA pour recommandations

### Dashboard Investisseur (`/dashboard/investisseur`)
- [ ] Analyse de marché avec données réelles
- [ ] Calculateur ROI fonctionnel
- [ ] Opportunités d'investissement
- [ ] Insights IA prédictifs

### Dashboard Promoteur (`/dashboard/promoteur`)
- [ ] Gestion des projets
- [ ] Suivi de construction
- [ ] Données financières
- [ ] Planning de ventes

### Dashboard Agriculteur (`/dashboard/agriculteur`)
- [ ] Gestion des terres agricoles
- [ ] Analyse du sol
- [ ] Journal de bord
- [ ] Équipements

### Dashboard Banque (`/dashboard/banque`)
- [ ] Gestion des garanties
- [ ] Évaluation foncière
- [ ] Demandes de financement
- [ ] Rapports de conformité

### Dashboard Mairie (`/dashboard/mairie`)
- [ ] Gestion foncière municipale
- [ ] Cadastre numérique
- [ ] Demandes citoyennes
- [ ] Statistiques fiscales

### Dashboard Notaire (`/dashboard/notaire`)
- [ ] Dossiers en cours
- [ ] Authentification d'actes
- [ ] Archives numériques
- [ ] Vérification de conformité

---

## 3. 🗺️ Test des Pages Principales

### Page Carte (`/map`)
- [ ] Chargement des parcelles depuis Supabase
- [ ] Affichage des marqueurs colorés par statut
- [ ] Fonctionnalité de recherche
- [ ] Popup avec détails parcelle
- [ ] Navigation vers détails parcelle

### Suivi de Dossier (`/case-tracking`)
- [ ] Recherche de dossier par ID
- [ ] Affichage des détails depuis Supabase
- [ ] Historique des statuts
- [ ] Informations de contact

### Blog (`/blog`)
- [ ] Chargement des articles depuis `blog_posts`
- [ ] Pagination et tri
- [ ] Liens vers articles individuels
- [ ] SEO metadata

### Article de Blog (`/blog/[slug]`)
- [ ] Chargement article individuel
- [ ] Affichage contenu complet
- [ ] Partage social
- [ ] Navigation retour

---

## 4. 👥 Test des Pages Agent

### Dashboard Agent (`/dashboard/agent`)
- [ ] Données agent depuis Supabase
- [ ] Clients assignés
- [ ] Parcelles assignées
- [ ] Tâches en cours

### Gestion Clients (`/dashboard/agent/clients`)
- [ ] Liste clients assignés
- [ ] Détails contact
- [ ] Historique interactions
- [ ] Actions rapides

### Gestion Parcelles (`/dashboard/agent/parcels`)
- [ ] Parcelles assignées à l'agent
- [ ] Statuts et détails
- [ ] Actions de gestion
- [ ] Mise à jour statuts

### Gestion Tâches (`/dashboard/agent/tasks`)
- [ ] Tâches assignées
- [ ] Priorités et échéances
- [ ] Marquage complété
- [ ] Nouvelles tâches

---

## 5. 🤖 Test de l'Intelligence Artificielle

### Assistant IA Global
- [ ] Chatbot accessible sur tous les dashboards
- [ ] Réponses contextuelles par type d'utilisateur
- [ ] Recommandations personnalisées
- [ ] Intégration avec les données utilisateur

### Anti-Fraud AI
- [ ] Détection d'anomalies en connexion
- [ ] Scores de sécurité calculés
- [ ] Alertes en temps réel
- [ ] Rapport de conformité

### Hybrid AI Insights
- [ ] Analyses prédictives sur dashboards
- [ ] Recommandations d'investissement
- [ ] Optimisations de gestion
- [ ] Insights marché

---

## 6. 📱 Test Responsive & UX

### Mobile (< 768px)
- [ ] Navigation mobile fonctionnelle
- [ ] Sidebar responsive
- [ ] Formulaires adaptés
- [ ] Cartes et graphiques lisibles

### Tablet (768px - 1024px)
- [ ] Layout intermédiaire correct
- [ ] Navigation hybride
- [ ] Grilles adaptées
- [ ] Interactions tactiles

### Desktop (> 1024px)
- [ ] Pleine utilisation de l'espace
- [ ] Sidebar complète
- [ ] Multi-colonnes
- [ ] Interactions souris

---

## 7. 🔄 Test des Données et API

### Connexion Supabase
- [ ] Authentification fonctionne
- [ ] Chargement données utilisateur
- [ ] CRUD opérations
- [ ] Gestion d'erreurs réseau

### Fallbacks d'Erreur
- [ ] Affichage en cas d'erreur réseau
- [ ] Messages d'erreur appropriés
- [ ] Retry automatique si possible
- [ ] Données de démonstration si nécessaire

### Performance
- [ ] Temps de chargement < 3s
- [ ] Lazy loading des images
- [ ] Pagination des listes longues
- [ ] Cache des données fréquentes

---

## 8. 🛡️ Test de Sécurité

### Routes Protégées
- [ ] Redirection si non connecté
- [ ] Vérification des rôles
- [ ] Accès approprié par type utilisateur
- [ ] Validation côté client et serveur

### Vérification d'Identité
- [ ] Processus complet de vérification
- [ ] Upload sécurisé de documents
- [ ] Statuts de vérification corrects
- [ ] Restrictions si non vérifié

---

## 9. ⚙️ Test des Paramètres

### Page Paramètres (`/dashboard/settings`)
- [ ] Modification profil utilisateur
- [ ] Changement de langue (sans simulation)
- [ ] Notifications preferences
- [ ] Export de données

### Notifications (`/dashboard/notifications`)
- [ ] Affichage notifications réelles
- [ ] Marquage lu/non lu
- [ ] Actions sur notifications
- [ ] Paramètres de notification

---

## 10. 📊 Test Admin (si accès admin)

### Dashboard Admin (`/dashboard/admin`)
- [ ] Statistiques globales
- [ ] Données en temps réel
- [ ] Graphiques et métriques
- [ ] Outils de gestion

### Gestion Utilisateurs (`/dashboard/admin/users`)
- [ ] Liste tous utilisateurs
- [ ] Filtres par type
- [ ] Actions administratives
- [ ] Assistant IA (sans simulation)

---

## ✅ Checklist de Validation Finale

### Fonctionnalités Core
- [ ] Authentification complète
- [ ] Vérification d'identité
- [ ] Navigation par rôle
- [ ] Données réelles partout

### Performance
- [ ] Chargement rapide
- [ ] Responsive design
- [ ] Gestion d'erreurs
- [ ] États de chargement

### Production Ready
- [ ] Aucune donnée simulée visible
- [ ] Intégrations Supabase stables
- [ ] IA fonctionnelle
- [ ] SEO optimisé

---

## 🐛 Rapport de Bugs

Si des problèmes sont détectés :

1. **Erreur JavaScript** → Vérifier console navigateur
2. **Problème de données** → Vérifier connexion Supabase
3. **Problème IA** → Vérifier configuration API
4. **Problème UI** → Vérifier responsive design

---

## 📋 Notes de Test

- **Date de test** : ___________
- **Testeur** : ___________
- **Version** : ___________
- **Navigateur** : ___________
- **Résolution** : ___________

**Résultats globaux** :
- [ ] ✅ Prêt pour production
- [ ] ⚠️ Problèmes mineurs à corriger
- [ ] ❌ Problèmes majeurs détectés

---

*Ce guide couvre tous les aspects critiques de la plateforme modernisée. Compléter ce test garantit que la plateforme est prête pour le déploiement en production.*
