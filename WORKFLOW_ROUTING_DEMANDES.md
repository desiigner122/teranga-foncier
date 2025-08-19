# 🚀 Système de Routage des Demandes - Teranga Foncier

## 📋 Vue d'ensemble

Le système de routage des demandes a été amélioré pour permettre aux particuliers d'envoyer leurs demandes directement aux destinataires appropriés (mairies ou banques) selon le type de demande.

## 🔄 Workflows Implémentés

### 1. Demande de Terrain Communal (Particulier → Mairie)

**Flux :**
```
Particulier → Sélectionne Mairie → Remplit formulaire → Demande envoyée à la mairie spécifique
```

**Champs spécifiques :**
- **Mairie destinataire** : Sélection d'une mairie spécifique
- **Localisation** : Région, département, commune
- **Usage prévu** : Habitation, commercial, agricole, etc.
- **Surface souhaitée** : En m²
- **Justification** : Description du projet

**Routage :**
- `recipient_type`: "Mairie"
- `recipient_id`: ID de la mairie sélectionnée
- `mairie_id`: ID de la mairie destinataire

### 2. Demande de Financement (Particulier → Banque + Terrain)

**Flux :**
```
Particulier → Sélectionne Banque → Sélectionne Terrain → Remplit demande → Banque reçoit avec détails terrain
```

**Champs spécifiques :**
- **Banque destinataire** : Sélection d'une banque spécifique
- **Terrain à financer** : Parcelle appartenant au demandeur
- **Montant demandé** : En FCFA
- **Objet du financement** : Construction, achat, etc.
- **Informations financières** : Revenus, apport personnel, situation professionnelle

**Routage :**
- `recipient_type`: "Banque"
- `recipient_id`: ID de la banque sélectionnée
- `banque_id`: ID de la banque destinataire
- `parcel_id`: ID de la parcelle soumise

## 🛠️ Améliorations Techniques

### Nouvelles Méthodes dans SupabaseDataService

#### 1. `getUsersByType(userType)`
```javascript
// Récupère les utilisateurs par type pour les sélecteurs
const mairies = await SupabaseDataService.getUsersByType('mairie');
const banques = await SupabaseDataService.getUsersByType('banque');
```

#### 2. `getParcelsByOwner(ownerId)`
```javascript
// Récupère les parcelles d'un propriétaire pour financement
const userParcels = await SupabaseDataService.getParcelsByOwner(user.id);
```

#### 3. `getRequestsByRecipient(recipientId, recipientType)`
```javascript
// Pour les dashboards mairie/banque - récupère leurs demandes
const requests = await SupabaseDataService.getRequestsByRecipient(mairieId, 'mairie');
```

### Structure de Données des Demandes

```javascript
{
  user_id: "uuid-du-demandeur",
  request_type: "terrain_communal" | "financement",
  recipient_type: "Mairie" | "Banque",
  recipient_id: "uuid-du-destinataire",
  
  // Champs spécifiques selon le type
  mairie_id: "uuid-mairie",        // Pour terrain communal
  banque_id: "uuid-banque",        // Pour financement
  parcel_id: "uuid-parcelle",      // Pour financement
  
  // Données du formulaire
  data: {
    // Détails spécifiques à chaque type de demande
  }
}
```

## 🎯 Interface Utilisateur

### Page CreateRequestPage Améliorée

**Étape 1 : Sélection du Type**
- Terrain Communal vs Financement
- Icônes et descriptions claires

**Étape 2 : Destinataire et Détails**
- **Pour Terrain :** Sélecteur de mairie + localisation + usage
- **Pour Financement :** Sélecteur de banque + terrain + montant

**Étape 3 : Validation et Envoi**
- Récapitulatif de la demande
- Notification du destinataire choisi

### Dashboards Spécialisés

**Dashboard Mairie :**
- Filtre automatique sur `recipient_type = 'Mairie'`
- Affichage des demandes de terrain reçues

**Dashboard Banque :**
- Filtre automatique sur `recipient_type = 'Banque'`
- Affichage des demandes de financement avec terrains attachés

## 🔔 Système de Notifications

### Notifications Automatiques
```javascript
// Notification au destinataire
await SupabaseDataService.createNotification({
  userId: recipient_id,
  type: 'new_request',
  title: 'Nouvelle demande reçue',
  body: `Nouvelle demande de ${type} de ${user.email}`,
  data: {
    request_id: createdRequest.id,
    request_type: type,
    requester: user.email
  }
});
```

## 📊 Avantages du Nouveau Système

### 1. Routage Précis
- **Avant :** Demandes génériques sans destinataire spécifique
- **Après :** Demandes directement routées vers la mairie/banque concernée

### 2. Workflow Métier Respecté
- **Terrain Communal :** Gestion municipale locale
- **Financement :** Évaluation bancaire avec terrain en garantie

### 3. Visibilité Améliorée
- Mairies : voient uniquement leurs demandes
- Banques : voient les demandes avec détails terrain
- Particuliers : suivi précis de leurs demandes

### 4. Efficacité Opérationnelle
- Réduction des erreurs de routage
- Traitement plus rapide des demandes
- Meilleure satisfaction utilisateur

## 🧪 Tests et Validation

### Test de Routage
```bash
npm run dev
# Naviguer vers /create-request
# Tester les deux workflows
```

### Points de Validation
1. ✅ Sélection mairie pour terrain communal
2. ✅ Sélection banque + terrain pour financement
3. ✅ Validation des champs obligatoires
4. ✅ Création demande avec routage
5. ✅ Notification destinataire
6. ✅ Affichage dans dashboard spécialisé

## 🎯 Prochaines Étapes

### Phase 2 (Optionnel)
1. **Géolocalisation intelligente** : Suggestion automatique de mairie selon l'adresse
2. **Scoring financement** : Évaluation automatique des demandes de financement
3. **Workflow d'approbation** : Étapes multiples avec validations
4. **Intégration documents** : Scan automatique et validation papiers

---

**✅ Le système de routage des demandes est maintenant opérationnel et respecte les workflows métier demandés.**
