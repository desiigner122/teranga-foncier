# Déploiement et Test Vercel

## 🚀 Commandes de déploiement

### Déploiement automatique
```bash
git add .
git commit -m "fix: correction erreurs authentification et ajout mode demo"
git push origin production-ready
```

### Déploiement manuel Vercel
```bash
vercel --prod
```

## 🧪 URLs de test après déploiement

### Mode Démonstration
- https://teranga-foncier.vercel.app/test
- Cliquer sur "Administrateur" pour tester le dashboard admin
- Tester tous les rôles : Particulier, Banque, Notaire, Mairie

### Test d'authentification réelle
- https://teranga-foncier.vercel.app/login
- Essayer avec : test@terangafoncier.com / test123456

### Dashboards spécifiques
- https://teranga-foncier.vercel.app/dashboard/admin
- https://teranga-foncier.vercel.app/dashboard/particulier
- https://teranga-foncier.vercel.app/dashboard/banque
- https://teranga-foncier.vercel.app/dashboard/notaire
- https://teranga-foncier.vercel.app/dashboard/mairie

## 🔧 Variables d'environnement Vercel

Vérifier dans Vercel Dashboard > Settings > Environment Variables :

```
VITE_SUPABASE_URL=https://kjriscftfduyllerhnvr.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtqcmlzY2Z0ZmR1eWxsZXJobnZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2MjY3NjIsImV4cCI6MjA2OTIwMjc2Mn0.rtcjWgB8b1NNByH8ZFpfUDQ63OEFCvnMu6S0PNHELtk
VITE_APP_ENV=production
```

## 📊 Diagnostic en production

### Problèmes attendus résolus :
✅ Erreur blog_posts.published → Corrigée vers status='published' et published_at
✅ Erreurs HTTP 406 → Headers Supabase corrigés
✅ Problème authentification → Mode démo disponible
✅ Dashboards non fonctionnels → Routes et logique corrigées

### Test de validation :
1. Page de test fonctionne
2. Mode démo permet l'accès aux dashboards  
3. Supabase connexion stable
4. Toutes les routes accessibles
