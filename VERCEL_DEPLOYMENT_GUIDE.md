# 🚀 Guide de Déploiement Vercel - Teranga Foncier

## ✅ Étapes de Déploiement

### 1. **Variables d'Environnement Vercel**

Allez dans votre dashboard Vercel → Settings → Environment Variables et ajoutez :

```bash
# Supabase (OBLIGATOIRES)
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre_clé_anonyme_supabase

# Firebase (OPTIONNEL - pour notifications push)
VITE_FIREBASE_API_KEY=votre_clé_api_firebase
VITE_FIREBASE_AUTH_DOMAIN=votre-projet.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=votre-projet-firebase
VITE_FIREBASE_STORAGE_BUCKET=votre-projet.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123:web:abc

# AI Assistant (OPTIONNEL)
VITE_GEMINI_API_KEY=votre_clé_gemini

# Application
VITE_APP_NAME=Teranga Foncier
VITE_APP_VERSION=1.0.0
VITE_APP_ENVIRONMENT=production
```

### 2. **Configuration du Build**

Le projet est déjà configuré avec :
- ✅ `vite.config.js` optimisé pour Vercel
- ✅ `vercel.json` avec configuration des routes
- ✅ Scripts de build adaptés

### 3. **Migration Base de Données**

**IMPORTANT** : Exécutez ces scripts dans l'ordre dans l'éditeur SQL Supabase :

1. **`database/04_MIGRATION_AVEC_NETTOYAGE.sql`** (Migration principale)
2. **`database/02_MIGRATION_RPC_FUNCTIONS_SECURISEE.sql`** (Fonctions RPC)

### 4. **Vérification du Déploiement**

Après déploiement, testez :

```bash
# Vérifier le build local
npm run build
npm run preview

# Vérifier la connexion Supabase
node check-supabase.mjs
```

### 5. **Configuration Domaine**

Si vous utilisez un domaine personnalisé :
- Configurez votre domaine dans Vercel
- Mettez à jour les URLs autorisées dans Supabase Auth

## 🔧 Dépannage

### Erreur : `createClient is not defined`
✅ **RÉSOLU** - Import corrigé dans `src/lib/supabaseClient.js`

### Erreur : Variables d'environnement manquantes
- Vérifiez que `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` sont configurées
- Le client utilise un mock automatiquement en développement

### Erreur de build
- Vérifiez `npm run build` en local
- Tous les imports sont maintenant corrigés

## 📊 Performance

Le build optimisé génère :
- ✅ Bundle principal : ~2.5MB (gzippé : ~705KB)
- ✅ CSS : ~124KB (gzippé : ~23KB)
- ✅ Modules : 3519 modules transformés
- ✅ Temps de build : ~45s

## 🎯 Fonctionnalités Déployées

- ✅ Système d'authentification Supabase
- ✅ Real-time updates
- ✅ Dashboards multi-rôles
- ✅ Gestion de parcelles
- ✅ Système de notifications
- ✅ Interface responsive
- ✅ PWA ready

---

**🚀 Votre application Teranga Foncier est maintenant prête pour la production !**
