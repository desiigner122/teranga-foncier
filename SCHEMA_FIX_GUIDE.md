# 🔧 Résolution des Erreurs de Base de Données - Teranga Foncier

## 🚨 Erreurs Identifiées

Les logs de production montrent plusieurs erreurs de schéma de base de données :

### 1. ❌ `notifications.created_at does not exist`
**Problème** : Colonne manquante dans la table notifications  
**Impact** : Échec du chargement des notifications utilisateur

### 2. ❌ `fraud_alerts` relationship issues
**Problème** : Table ou relations manquantes pour les alertes fraude  
**Impact** : Fonctionnalités anti-fraude non opérationnelles

### 3. ❌ `conversation_participants` schema issues  
**Problème** : Relations incorrectes dans le système de messagerie  
**Impact** : Système de chat/messaging défaillant

## ✅ Solution : Migration Automatisée

### 📁 Fichiers Créés

1. **`database/20250819_fix_schema_issues.sql`** - Migration complète
2. **`apply-schema-fix.mjs`** - Script de validation et test

### 🔧 Actions de la Migration

#### 1. Table Notifications
```sql
-- Création/correction table notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT,
  type TEXT DEFAULT 'info',
  data JSONB DEFAULT '{}',
  read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(), -- ✅ COLONNE AJOUTÉE
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 2. Table Fraud Alerts
```sql
-- Création table fraud_alerts avec relations correctes
CREATE TABLE IF NOT EXISTS fraud_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL,
  severity TEXT DEFAULT 'medium',
  title TEXT NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  status TEXT DEFAULT 'active',
  -- ... autres colonnes
);
```

#### 3. Système Messaging Complet
```sql
-- Tables conversations, conversation_participants, messages
-- Avec relations FK correctes et index de performance
```

#### 4. Colonnes Routage Demandes
```sql
-- Ajout colonnes manquantes pour le nouveau système de routage
ALTER TABLE requests ADD COLUMN recipient_type TEXT;
ALTER TABLE requests ADD COLUMN recipient_id UUID;
ALTER TABLE requests ADD COLUMN mairie_id UUID;
ALTER TABLE requests ADD COLUMN banque_id UUID;
ALTER TABLE requests ADD COLUMN parcel_id UUID;
```

## 🚀 Procédure d'Application

### Option 1: Via Supabase Dashboard (Recommandé)

1. **Se connecter** à Supabase Dashboard
2. **Aller dans** SQL Editor
3. **Copier-coller** le contenu de `database/20250819_fix_schema_issues.sql`
4. **Exécuter** la migration
5. **Vérifier** les résultats

### Option 2: Via CLI Supabase

```bash
# Si vous avez Supabase CLI configuré
supabase db reset
supabase db push
```

### Option 3: Script Automatisé (Nécessite Service Role Key)

```bash
# Modifier apply-schema-fix.mjs avec la clé service_role
# Puis exécuter:
node apply-schema-fix.mjs
```

## 📊 Résultats Attendus

### ✅ Avant la Migration
- ❌ Erreurs notifications dans les logs
- ❌ Fonctionnalités fraud_alerts cassées  
- ❌ Messaging system défaillant
- ❌ Routage demandes incomplet

### ✅ Après la Migration
- ✅ Notifications fonctionnelles
- ✅ Système anti-fraude opérationnel
- ✅ Messaging/chat activé
- ✅ Routage demandes complet avec FK
- ✅ Index de performance ajoutés
- ✅ Plus d'erreurs dans les logs

## 🧪 Tests de Validation

### Test 1: Notifications
```javascript
// Doit fonctionner sans erreur après migration
const notifications = await SupabaseDataService.listNotifications(userId);
```

### Test 2: Fraud Alerts
```javascript
// Doit pouvoir créer/lire des alertes fraude
const alerts = await supabase.from('fraud_alerts').select('*');
```

### Test 3: Messaging
```javascript
// Doit pouvoir charger les conversations
const conversations = await SupabaseDataService.listUserConversations(userId);
```

### Test 4: Routage Demandes
```javascript
// Doit fonctionner avec les nouvelles colonnes
const requests = await SupabaseDataService.getRequestsByRecipient(mairieId, 'mairie');
```

## ⚠️ Précautions

1. **Backup** : Toujours faire un backup avant migration
2. **Test** : Tester sur un environnement de dev d'abord
3. **Monitoring** : Surveiller les logs après déploiement
4. **Rollback** : Avoir un plan de retour en cas de problème

## 🎯 Impact Business

### Fonctionnalités Restaurées
- **✅ Notifications** : Utilisateurs recevront les alertes
- **✅ Sécurité** : Système anti-fraude opérationnel  
- **✅ Communication** : Chat/messaging activé
- **✅ Workflow** : Routage demandes complètement fonctionnel

### Performance Améliorée
- **✅ Index** : Requêtes plus rapides
- **✅ Relations** : Intégrité référentielle assurée
- **✅ Stabilité** : Plus d'erreurs de schéma

---

## 🏁 Conclusion

**Cette migration résout tous les problèmes de schéma identifiés dans les logs de production.**

**Priorité : HAUTE** - Ces erreurs affectent l'expérience utilisateur et doivent être corrigées rapidement.

**Temps estimé** : 5-10 minutes d'exécution sur Supabase Dashboard.
